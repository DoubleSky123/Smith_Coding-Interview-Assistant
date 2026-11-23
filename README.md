# Smith: AI-Assisted Coding Interview Practice Platform

**CS5340 – Human-Computer Interaction · Project FALL26_9**

## Team Members

- Kunyi Shi
- Jiaxin Jia
- Xinyuan Fan

## Project Description

Smith simulates a coding interview in which the candidate is explicitly allowed to use AI tools. It investigates how computer science students read code, diagnose bugs, evaluate AI suggestions, and explain their own solutions while preparing for technical interviews. The target group is university students preparing for software engineering internships or entry-level roles, with varying levels of programming and AI experience.

Prior research suggests that reading code, diagnosing bugs, using AI, and verifying AI output are related but separate skills — and that receiving AI help does not mean a student can explain or verify the result. Existing tools such as LeetCode, HackerRank, and ChatGPT already offer practice, feedback, and assistance. What remains unclear is how students combine these resources, recognize unreliable suggestions, and judge whether they can solve or explain a problem independently.

### Research Questions

- How do students approach unfamiliar-code tasks, and where do they get stuck?
- How do they identify a bug's cause and check whether a change fixes it?
- When do they consult AI, and how do they verify its suggestions?
- How do they judge whether they can explain a solution independently?

---

## Project Files

| File | Description |
|------|-------------|
| [Smith_Project_Phase_1_Report_5.docx](Smith_Project_Phase_1_Report_5.docx) | Phase 1 report: background research, competitor analysis, Design Thinking plan |
| [Smith_Project_Phase_2_User_Research.docx](Smith_Project_Phase_2_User_Research.docx) | Phase 2 report: user interviews, findings, design implications |
| [smith-prototype.html](smith-prototype.html) | Interactive prototype — open in any browser, no server needed |

---

## Phase 1 — Research & Planning ✓

[Smith_Project_Phase_1_Report_5.docx](Smith_Project_Phase_1_Report_5.docx) covers:

1. Project understanding and background research
2. Market and competitor analysis (LeetCode, HackerRank, ChatGPT)
3. Stakeholder identification
4. Design Thinking milestones (Empathize, Define, Ideate, Prototype, Test)
5. Technical foundation and implementation planning

## Phase 2 — User Research ✓

[Smith_Project_Phase_2_User_Research.docx](Smith_Project_Phase_2_User_Research.docx) covers:

Six semi-structured interviews with CS students at various stages of interview preparation. Key findings:

- Students already combine LeetCode practice with AI assistance in their own workflows
- Some verify AI suggestions through reasoning and edge cases; others rely mainly on passing tests
- Working code does not always mean the student can explain the solution or answer follow-up questions
- Students want more realistic interviewer interaction and personalized feedback
- AI explanations can be hard to follow or can displace the student's own thinking

## Phase 3 — Prototype ✓

[smith-prototype.html](smith-prototype.html) is a self-contained interactive prototype (HTML + CSS + JS, no backend or API keys required).

### How to run

Open `smith-prototype.html` in any modern browser. No installation needed.

### Features

- **Setup screen** — task description, difficulty, 20-minute time limit, AI-use policy
- **Interview workspace** — editable Python code area, collapsible task spec, demo test runner, 20-minute countdown timer
- **Two AI roles** (separate tabs, separate histories):
  - *AI Interviewer* — clarifies requirements, asks about approach, challenges decisions; never supplies the solution
  - *AI Coding Assistant* — explains concepts, suggests implementation patterns, reviews code
- **Demo tests** — 4 cases simulated with heuristic grading; labeled as simulated
- **Follow-up questions** — 3 questions asked one at a time after coding; answers preserved when navigating back
- **Session review** — actual elapsed time, assistant message count, test run history, context-aware feedback per category, next-practice suggestions

### Design decisions tied to research findings

| Finding | Design response |
|---|---|
| Students already use AI alongside practice tools | AI assistance available from the start, no lockout period |
| Passing tests ≠ ability to explain | Follow-up questions require verbal explanation of repeated-customer handling |
| Want more realistic interviewer interaction | Interviewer challenges decisions and asks "why", does not supply code |
| Want personalized feedback | Review reads actual session data: code content, message count, test runs, written answers |
| AI can displace student thinking | Coding Assistant prompts reflection; follow-up asks student to evaluate AI use |

### Prototype limitations

All AI responses are scripted with keyword matching — no live model calls. Test results are heuristically simulated, not real Python execution. Review feedback is illustrative and labeled as such. The prototype runs entirely client-side.
