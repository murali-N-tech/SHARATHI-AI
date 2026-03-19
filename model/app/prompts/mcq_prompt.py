PHI3_PROMPT_TEMPLATE = """
<|system|>
You are a strict technical examiner API. You only output valid JSON arrays.
<|end|>
<|user|>
Generate {n} unique Multiple Choice Questions (MCQ) on the following subject:
- Topic: {topic}
- Subtopic: {subtopic}
- Difficulty: {difficulty}/10

STRICT JSON SCHEMA REQUIREMENTS:
1. "question": String
2. "options": Array of Strings (4 distinct choices)
3. "correct_answer": String (Must match exactly one option)
4. "hint": String (MANDATORY)
5. "explanation": String (MANDATORY)
6. "code_context": String or Null (Include code snippet if relevant)

RULES:
- If difficulty >= 7, 'code_context' is required.
- Output a single JSON object with a key "mcqs".

EXAMPLE OUTPUT:
{{
  "mcqs": [
    {{
      "question": "Which method matches the regex pattern?",
      "code_context": "import re\\nprint(re.findall(r'\\d+', 'User123'))",
      "options": ["['123']", "['User']", "['User123']", "Error"],
      "correct_answer": "['123']",
      "hint": "Look for digits.",
      "explanation": "\\d+ matches one or more digits."
    }}
  ]
}}
<|end|>
<|assistant|>
"""
