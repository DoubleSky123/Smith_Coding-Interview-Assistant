"""Keyword-matched replies carried over from the HTML prototype.

Used when no API key is configured, so the app still runs end to end
(useful for UI work, demos, and pilot sessions without API cost).
"""

INTERVIEWER_BANK = [
    (["hello", "hi", "hey", "good morning", "good afternoon"],
     "Welcome. Take a moment to read the task spec — there's no rush to start coding immediately. "
     "What's your first read of what the function needs to do?"),
    (["clarif", "what does", "what is", "mean", "understand", "explain the", "confused"],
     "Sure. The function takes a list of order dicts. Each has a customer name, a status "
     "(\"completed\" or \"cancelled\"), and an amount in integer cents. You return a dict mapping "
     "customer names to their total completed-order amount. Cancelled orders don't count at all. "
     "If a customer has only cancelled orders they should not appear in the output. Does that clarify it?"),
    (["empty", "no order", "none", "null"],
     "Good instinct. The spec says explicitly to return an empty dict for empty input. What about a "
     "list that has orders, but they're all cancelled — what should that return?"),
    (["edge", "corner", "special case", "what if"],
     "Name the three main edge cases for this problem. Think about the input, not the implementation — "
     "what unusual but valid inputs could a caller send you?"),
    (["plan", "approach", "strategy", "think", "how should", "going to", "about to"],
     "Walk me through your approach before you type. What data structure are you planning to use, "
     "and why does it fit this problem?"),
    (["dict", "hash", "map", "defaultdict", "counter"],
     "Tell me specifically: what's the key and what's the value in your dictionary? And what's the "
     "advantage of that structure for this problem?"),
    (["loop", "iterate", "for each", "for order"],
     "What conditions are you checking inside the loop? Walk me through the logic step by step."),
    (["done", "finish", "ready", "complete", "implement", "coded"],
     "Before you run the tests — trace through the last example manually: Alice with 1000 completed, "
     "Bob with 750 completed, Alice with 200 cancelled, Carol with 400 cancelled. What does your code produce?"),
    (["time complex", "big o", "performance", "efficient", "runtime"],
     "What's the time complexity of your solution? And the space complexity? Can you justify both?"),
    (["test", "run", "result", "check", "pass", "fail"],
     "Before running tests, what output do you expect for the multiple-customers case? "
     "Reason through it without looking at the result."),
    (["ai", "assistant", "suggestion", "used ai", "use ai", "coding assistant"],
     "Tell me about how you used the AI assistant. Did you understand the suggestions before "
     "incorporating them? Did you change or reject any?"),
    (["why", "reason", "chose", "pick", "because", "choice"],
     "Can you justify that decision more precisely? What would break if you used a different approach?"),
]

INTERVIEWER_FALLBACK = [
    "Tell me more about that — what's the reasoning behind that choice?",
    "How does that approach handle the case where a customer has multiple completed orders?",
    "If this list had ten thousand entries, how would your solution perform?",
    "Can you think of a valid input that might cause your current implementation to produce the wrong output?",
    "How did you verify that cancelled orders are correctly excluded?",
]

ASSISTANT_BANK = [
    (["help", "stuck", "lost", "confused", "where do i start", "how to start", "how do i begin"],
     "Here's the core pattern:\n\n```python\nresult = {}\nfor order in orders:\n    if order['status'] == 'completed':\n"
     "        customer = order['customer']\n        result[customer] = result.get(customer, 0) + order['amount_cents']\n"
     "return result\n```\n\nThe key insight is `dict.get(key, 0)` — it returns the existing value if the key is "
     "present, or 0 if the key is new. That way you can add to the total without first checking whether the "
     "customer exists in the dict."),
    (["dict.get", ".get(", "default value", "key error", "keyerror", "how does get"],
     "`dict.get(key, default)` looks up `key` in the dict. If the key exists, it returns its value. If not, it "
     "returns `default` without raising a `KeyError`.\n\nThese two are equivalent:\n\n```python\n# Without .get:\n"
     "if customer in result:\n    result[customer] += amount\nelse:\n    result[customer] = amount\n\n"
     "# With .get (more concise):\nresult[customer] = result.get(customer, 0) + amount\n```\n\n"
     "Both are correct. `.get` is more idiomatic Python."),
    (["explain", "how does it work", "walk me through", "what does this do"],
     "The algorithm does one pass through the list:\n\n1. For each order, check if `status == \"completed\"`\n"
     "2. If yes, look up the customer's running total (default 0 if not seen yet)\n"
     "3. Add this order's `amount_cents` to that total\n4. Store the new total back in the dict\n\n"
     "After the loop, the dict contains exactly what you need.\n\nTime: **O(n)** — one pass. "
     "Space: **O(k)** — where k is unique customers with completed orders."),
    (["edge case", "empty", "cancel", "zero", "only cancelled", "no completed", "what about"],
     "Three edge cases to check:\n\n1. **Empty input** (`[]`): loop never runs, `{}` returned\n"
     "2. **All cancelled**: nothing passes the status check, empty dict returned\n"
     "3. **Customer with only cancelled orders**: they never get added, so absent from output\n\n"
     "The first two demo tests cover these. Run them and check."),
    (["review", "check my code", "feedback", "look at my", "is my code"],
     "Things to verify in your code:\n\n- Does it always return a dict (not `None`)?\n"
     "- Are you using the exact key names `'customer'`, `'status'`, `'amount_cents'`?\n"
     "- Does your accumulation handle the first time a customer appears?\n"
     "- Is your `return` statement outside the loop (not indented under it)?\n\n"
     "Common mistake: `return` inside the loop exits after the first order."),
    (["defaultdict", "collections", "from collections", "import"],
     "`defaultdict(int)` from `collections` is a clean alternative:\n\n```python\nfrom collections import defaultdict\n\n"
     "def summarize_orders(orders):\n    result = defaultdict(int)\n    for order in orders:\n"
     "        if order['status'] == 'completed':\n            result[order['customer']] += order['amount_cents']\n"
     "    return dict(result)\n```\n\n`defaultdict(int)` auto-initialises missing keys to 0, so you use `+=` directly. "
     "Convert to `dict()` before returning. Both approaches are correct — the interviewer may ask you to explain either."),
    (["return", "output", "result", "what should i return", "format"],
     "Return a plain Python dict: `{'Alice': 1500, 'Bob': 300}`.\n\n- Keys: customer name strings\n"
     "- Values: integer totals in cents\n- Only customers with at least one completed order appear\n"
     "- Empty input or all-cancelled → return `{}`\n\nReturn a plain `dict`, not a `defaultdict`, not `None`."),
    (["fail", "wrong output", "incorrect", "expected", "test failing"],
     "When a test fails, compare expected vs. actual carefully.\n\nCommon causes:\n"
     "1. Status check typo — it's `\"completed\"` not `\"complete\"`\n"
     "2. Wrong key name — `\"amount_cents\"` not `\"amount\"` or `\"price\"`\n"
     "3. `return` inside the loop — exits after first order\n"
     "4. First occurrence not handled — using `+=` on a missing key raises `KeyError`\n\n"
     "Add a temporary `print(result)` inside the loop to watch it build up."),
]

ASSISTANT_FALLBACK = [
    "Could you say more about what you're trying to do? I can help with implementation, edge cases, "
    "or understanding how the solution works.",
    "What have you tried so far? If you share your code, I can give more targeted feedback.",
    "Take another look at the examples in the task spec — they show the exact input and output shapes. "
    "Which part is tripping you up?",
]


def scripted_reply(role: str, text: str, user_turns: int) -> str:
    bank, fallback = (
        (INTERVIEWER_BANK, INTERVIEWER_FALLBACK)
        if role == "interviewer"
        else (ASSISTANT_BANK, ASSISTANT_FALLBACK)
    )
    lowered = text.lower()
    for keywords, reply in bank:
        if any(k in lowered for k in keywords):
            return reply
    # Cycle through fallbacks based on how far into the conversation we are.
    return fallback[(user_turns - 1) % len(fallback)]
