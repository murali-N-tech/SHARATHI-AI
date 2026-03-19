DIFFICULTY_PROMPT_TEMPLATE = """
You are an expert curriculum designer. Analyze the following text extracted from a PDF document.

Task:
1. Identify all key educational topics, concepts, or modules in the text.
2. Categorize them into four difficulty levels: "easy", "medium", "hard", and "advanced".

Categorization Guidelines:
- EASY: Foundational concepts, basic terminology, simple definitions, introductory material
- MEDIUM: Intermediate concepts requiring some prior knowledge, practical applications
- HARD: Complex theories, advanced applications, multi-step problem-solving
- ADVANCED: Expert-level content, cutting-edge research, highly specialized knowledge

Requirements:
- Return ONLY a JSON object.
- The JSON must have exactly these four keys: "easy", "medium", "hard", "advanced".
- The value for each key must be a list of strings (the topics).
- If no topics fit a category, leave the list empty.
- Each topic should be clear, concise, and specific.
- Include 3-10 topics per category when possible.

Input Text:
{raw_text}

Output Format:
{{
    "easy": ["topic1", "topic2", ...],
    "medium": ["topic1", "topic2", ...],
    "hard": ["topic1", "topic2", ...],
    "advanced": ["topic1", "topic2", ...]
}}
"""
