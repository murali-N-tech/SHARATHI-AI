import re

def clean_json_string(text: str) -> str:
    """Remove markdown formatting from JSON string"""
    text = re.sub(r"```json", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```", "", text)
    return text.strip()
