CURRICULUM_PROMPT_TEMPLATE = """
<|system|>
You are a Senior Technical Curriculum Architect. 
You must output ONLY valid JSON.
<|end|>
<|user|>
User Request: "{user_input}"

INSTRUCTIONS:
1. Analyze the request to find the "main_topic".
2. Design a curriculum with EXACTLY 4 to 5 distinct "programs" (modules).
3. **DIFFICULTY RULE**: Use EXACTLY: "Beginner", "Intermediate", "Advanced", "Expert".

STRICT JSON SCHEMA:
{{
  "main_topic": "String",
  "programs": [
    {{
      "program_order": Integer (1-5),
      "title": "String",
      "difficulty": "String",
      "description": "String",
      "key_topics": ["String", "String", "String"]
    }}
  ]
}}
<|end|>
<|assistant|>
"""
