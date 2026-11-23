"""Interview task definitions.

Each task carries everything the app needs: the spec shown to the candidate,
starter code, the demo tests run in the browser (Pyodide), and the follow-up
questions asked after coding. To add a task, append another dict to TASKS.

`tests[*].args` is the positional-argument list passed to the function, and
`expected` is compared with `==` against the return value, so both must be
JSON-serialisable.
"""

TASKS = [
    {
        "id": "summarize-orders",
        "title": "summarize_orders(orders)",
        "function_name": "summarize_orders",
        "category": "Implementation",
        "difficulty": "Medium",
        "language": "Python",
        "time_limit_sec": 20 * 60,
        "summary": (
            "Implement a function that processes a list of customer orders and returns each "
            "customer's total from completed orders only. Cancelled orders are ignored. The "
            "function handles empty input, customers who only have cancelled orders, and multiple "
            "orders from the same customer, using integer cents to avoid floating-point ambiguity."
        ),
        "signature": "def summarize_orders(orders: list[dict]) -> dict:",
        "input_heading": "Each order contains",
        "input_fields": [
            {"name": "customer", "desc": "string, the customer's name"},
            {"name": "status", "desc": '`"completed"` or `"cancelled"`'},
            {"name": "amount_cents", "desc": "non-negative integer"},
        ],
        "returns": (
            "A `dict` mapping customer names to their **total completed-order amount**. "
            "Ignore cancelled orders. Customers with only cancelled orders must not appear in the output."
        ),
        "examples": """# Empty input
summarize_orders([]) == {}

# Cancelled orders ignored
summarize_orders([
    {"customer": "Alice", "status": "cancelled", "amount_cents": 500}
]) == {}

# Multiple completed orders — same customer
summarize_orders([
    {"customer": "Alice", "status": "completed", "amount_cents": 300},
    {"customer": "Alice", "status": "completed", "amount_cents": 200},
]) == {"Alice": 500}

# Multiple customers
summarize_orders([
    {"customer": "Alice", "status": "completed",  "amount_cents": 1000},
    {"customer": "Bob",   "status": "completed",  "amount_cents":  750},
    {"customer": "Alice", "status": "cancelled",  "amount_cents":  200},
    {"customer": "Carol", "status": "cancelled",  "amount_cents":  400},
]) == {"Alice": 1000, "Bob": 750}""",
        "starter_code": '''def summarize_orders(orders):
    """
    Return a dict mapping each customer to their total
    completed-order amount in cents. Ignore cancelled orders.
    """
    # TODO: implement this function
    pass
''',
        "tests": [
            {
                "name": "Empty input returns {}",
                "args": [[]],
                "expected": {},
            },
            {
                "name": "Cancelled orders are ignored",
                "args": [[{"customer": "Alice", "status": "cancelled", "amount_cents": 500}]],
                "expected": {},
            },
            {
                "name": "Multiple orders for same customer are summed",
                "args": [[
                    {"customer": "Alice", "status": "completed", "amount_cents": 300},
                    {"customer": "Alice", "status": "completed", "amount_cents": 200},
                ]],
                "expected": {"Alice": 500},
            },
            {
                "name": "Multiple customers returned correctly",
                "args": [[
                    {"customer": "Alice", "status": "completed", "amount_cents": 1000},
                    {"customer": "Bob", "status": "completed", "amount_cents": 750},
                    {"customer": "Alice", "status": "cancelled", "amount_cents": 200},
                    {"customer": "Carol", "status": "cancelled", "amount_cents": 400},
                ]],
                "expected": {"Alice": 1000, "Bob": 750},
            },
        ],
        "follow_ups": [
            "Walk me through how your implementation handles the case where the same customer "
            "appears multiple times in the orders list.",
            "Describe one edge case you considered. How did you verify your code handles it correctly?",
            "Explain one AI suggestion you accepted, changed, or chose not to use — and why. "
            "If you didn't use the assistant at all, say so.",
        ],
    },
]

TASKS_BY_ID = {t["id"]: t for t in TASKS}


def task_as_text(task: dict) -> str:
    """Plain-text rendering of a task spec, used inside AI system prompts."""
    fields = "\n".join(f"- {f['name']}: {f['desc']}" for f in task["input_fields"])
    return (
        f"Task: {task['title']} ({task['language']}, {task['difficulty']}, "
        f"{task['time_limit_sec'] // 60} minutes)\n\n"
        f"{task['summary']}\n\n"
        f"Signature:\n{task['signature']}\n\n"
        f"{task['input_heading']}:\n{fields}\n\n"
        f"Returns: {task['returns']}\n\n"
        f"Examples:\n{task['examples']}"
    )
