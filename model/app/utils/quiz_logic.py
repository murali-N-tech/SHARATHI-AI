from typing import List, Any


def get_level_description(level: int) -> str:
    """Get description for difficulty level"""
    mapping = {
        1: "Basics (Definitions & Terminology)",
        2: "Easy (Simple Concepts)",
        3: "Medium (Application & Logic)",
        4: "Hard (Complex Scenarios & Optimization)",
        5: "Certification (Comprehensive Mixed Assessment)",
    }
    return mapping.get(level, "General")


def auto_adjust_level(level: int, history: List[Any]) -> int:
    """Auto-adjust difficulty based on the most recent answer.

    Rules (per last question in history):
    - If the last question was answered CORRECTLY: increase level by 1
    - If the last question was answered WRONG: decrease level by 2
    - If the last question was SKIPPED: decrease level by 1 (smaller drop)

    A question is treated as "skipped" if user_answer is empty/None
    or a string like "skip"/"skipped" (case-insensitive).

    Levels are always clamped between 1 and 5.
    """

    if not history:
        return max(1, min(5, level))

    last = history[-1]
    # Support both dicts and Pydantic/BaseModel objects
    was_correct = last.get("was_correct", False) if isinstance(last, dict) else getattr(last, "was_correct", False)
    user_answer = last.get("user_answer") if isinstance(last, dict) else getattr(last, "user_answer", None)

    is_skipped = False
    if user_answer is None:
        is_skipped = True
    elif isinstance(user_answer, str) and user_answer.strip() == "":
        is_skipped = True
    elif isinstance(user_answer, str) and user_answer.strip().lower() in {"skip", "skipped"}:
        is_skipped = True

    adjusted = level

    if was_correct:
        adjusted += 1
    elif is_skipped:
        adjusted -= 1
    else:
        adjusted -= 2

    return max(1, min(5, adjusted))


def auto_adjust_assignment_level(level: int, history: List[Any]) -> int:
    """Auto-adjust difficulty for assignment quizzes with skip/wrong/correct logic.

    Rules (per most recent answered question in history):
    - If the last question was SKIPPED: decrease level by 2 (strong penalty)
    - If the last question was WRONG: decrease level by 1 (milder penalty)
    - If the last question was CORRECT: increase level by 1
    Levels are always clamped between 1 and 5.

    A question is treated as "skipped" if user_answer is empty/None
    or a string like "skip"/"skipped" (case-insensitive).
    """

    if not history:
        return max(1, min(5, level))

    last = history[-1]
    # Support both dicts and Pydantic/BaseModel objects
    was_correct = last.get("was_correct", False) if isinstance(last, dict) else getattr(last, "was_correct", False)
    user_answer = last.get("user_answer") if isinstance(last, dict) else getattr(last, "user_answer", None)

    is_skipped = False
    if user_answer is None:
        is_skipped = True
    elif isinstance(user_answer, str) and user_answer.strip() == "":
        is_skipped = True
    elif isinstance(user_answer, str) and user_answer.strip().lower() in {"skip", "skipped"}:
        is_skipped = True

    adjusted = level

    if is_skipped:
        adjusted -= 2
    elif was_correct:
        adjusted += 1
    else:
        adjusted -= 1

    return max(1, min(5, adjusted))

