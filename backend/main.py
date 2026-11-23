"""Smith backend: task data, AI chat proxy, and session logging.

Run (dev):  uvicorn main:app --reload --port 8000
"""

import json
import os
import sqlite3
import uuid
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv

load_dotenv()  # must run before importing ai, which reads env at import time

import anthropic  # noqa: E402
from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from pydantic import BaseModel, ConfigDict, Field  # noqa: E402

import ai  # noqa: E402
from scripted_ai import scripted_reply  # noqa: E402
from tasks import TASKS, TASKS_BY_ID  # noqa: E402

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("SMITH_DB", BASE_DIR / "smith.db"))
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

app = FastAPI(title="Smith API")


# ── Database (SQLite, stdlib) ─────────────────────────────────────────────

def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


with closing(db()) as conn, conn:
    conn.execute(
        """CREATE TABLE IF NOT EXISTS sessions (
               id         TEXT PRIMARY KEY,
               task_id    TEXT NOT NULL,
               created_at TEXT NOT NULL,
               data       TEXT NOT NULL
           )"""
    )


# ── Health ────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    live = ai.live_ai_enabled()
    return {"ok": True, "ai_mode": "live" if live else "scripted", "model": ai.MODEL if live else None}


# ── Tasks ─────────────────────────────────────────────────────────────────

@app.get("/api/tasks")
def list_tasks():
    keys = ("id", "title", "category", "difficulty", "language", "time_limit_sec")
    return [{k: t[k] for k in keys} for t in TASKS]


@app.get("/api/tasks/{task_id}")
def get_task(task_id: str):
    task = TASKS_BY_ID.get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task


# ── AI chat ───────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    task_id: str
    role: Literal["interviewer", "assistant"]
    messages: list[ChatMessage] = Field(min_length=1)
    code: str = ""
    seconds_left: int | None = None
    test_summary: str | None = None


@app.post("/api/chat")
async def chat(req: ChatRequest):
    task = TASKS_BY_ID.get(req.task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    # The API requires the conversation to start with a user turn and end with one;
    # drop app-generated greetings at the front and empty messages anywhere.
    history = [m.model_dump() for m in req.messages if m.content.strip()]
    while history and history[0]["role"] == "assistant":
        history.pop(0)
    if not history or history[-1]["role"] != "user":
        raise HTTPException(400, "The last message must come from the user")
    user_turns = sum(1 for m in history if m["role"] == "user")

    if not ai.live_ai_enabled():
        return {"reply": scripted_reply(req.role, history[-1]["content"], user_turns), "source": "scripted"}

    try:
        reply = await ai.live_reply(req.role, task, history, req.code, req.seconds_left, req.test_summary)
    except anthropic.AuthenticationError:
        raise HTTPException(502, "The AI service rejected the API key. Check ANTHROPIC_API_KEY in backend/.env.")
    except anthropic.RateLimitError:
        raise HTTPException(429, "The AI service is rate limiting requests. Wait a moment and try again.")
    except anthropic.APIStatusError as e:
        raise HTTPException(502, f"AI service error ({e.status_code}): {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(502, "Could not reach the AI service. Check your network connection.")
    return {"reply": reply, "source": "live", "model": ai.MODEL}


# ── Sessions (research log) ───────────────────────────────────────────────

class SessionIn(BaseModel):
    # The frontend sends the full session (code, chats, test runs, answers, timings);
    # only task_id is required so the shape can evolve without backend changes.
    model_config = ConfigDict(extra="allow")
    task_id: str


@app.post("/api/sessions", status_code=201)
def save_session(session: SessionIn):
    session_id = uuid.uuid4().hex
    with closing(db()) as conn, conn:
        conn.execute(
            "INSERT INTO sessions (id, task_id, created_at, data) VALUES (?, ?, ?, ?)",
            (session_id, session.task_id, datetime.now(timezone.utc).isoformat(), json.dumps(session.model_dump())),
        )
    return {"id": session_id}


@app.get("/api/sessions")
def list_sessions(limit: int = 50):
    with closing(db()) as conn:
        rows = conn.execute(
            "SELECT id, task_id, created_at FROM sessions ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(r) for r in rows]


@app.get("/api/sessions/{session_id}")
def get_session(session_id: str):
    with closing(db()) as conn:
        row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Session not found")
    return {**dict(row), "data": json.loads(row["data"])}


# ── Frontend (production build) ───────────────────────────────────────────
# After `npm run build` in frontend/, the whole app is served from this one process.

if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
