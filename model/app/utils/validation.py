from app.models import QuizHistoryItem
from typing import List

def validate_mcq(question_obj):
    """Validate MCQ structure"""
    if not isinstance(question_obj, dict):
        return False
    mandatory_fields = ["question", "options", "correct_answer", "hint", "explanation"]
    if not all(k in question_obj and question_obj[k] for k in mandatory_fields):
        return False
    if "code_context" not in question_obj:
        question_obj["code_context"] = None
    return True

def validate_curriculum(data):
    """Validate curriculum structure"""
    if not isinstance(data, dict) or "programs" not in data:
        return False
    if len(data["programs"]) < 4 or len(data["programs"]) > 5:
        return False
    # Validate difficulty enums
    valid_diff = {"Beginner", "Intermediate", "Advanced", "Expert"}
    for p in data["programs"]:
        if str(p.get("difficulty", "")).capitalize() not in valid_diff:
            return False
    return True
