from app.config import sessions
from typing import List, Dict, Any, Optional


def load_session_history(session_id: str) -> List[Dict[str, Any]]:
    """Load session history for a quiz session from MongoDB.

    Each history item is a dict that includes at minimum `question_text`.
    This is used by exact_repeat/semantic_repeat to avoid duplicates.
    """
    doc = sessions.find_one({"session_id": session_id})
    return doc.get("history", []) if doc else []


def save_question(
    session_id: str,
    question_text: str,
    options: Optional[list] = None,
    correct_option_index: Optional[int] = None,
) -> None:
    """Append a generated question to the session history in MongoDB.

    Stores question text, options, and correct index so that the backend
    can track what has already been asked for this session.
    """
    history_item: Dict[str, Any] = {"question_text": question_text}
    if options is not None:
        history_item["options"] = options
    if correct_option_index is not None:
        history_item["correct_option_index"] = correct_option_index

    sessions.update_one(
        {"session_id": session_id},
        {"$push": {"history": history_item}},
        upsert=True,
    )
