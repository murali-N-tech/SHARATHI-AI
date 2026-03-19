TOPICS_PROMPT_TEMPLATE = """
<|system|>
You are an expert curriculum designer and assessment specialist.
You must output ONLY valid JSON.
<|end|>
<|user|>
User Request: "{user_input}"

INSTRUCTIONS:
1. Analyze the user request to identify the main subject/topic.
2. Generate a comprehensive list of 8-12 specific topics/subtopics that should be assessed.
3. Each topic should be specific, measurable, and suitable for quiz assessment.
4. Organize topics from foundational to advanced.
5. Include the main topic and difficulty level for each.

STRICT JSON SCHEMA:
{{
  "main_topic": "String",
  "total_topics": Integer,
  "topics": [
    {{
      "topic_id": Integer (starting from 1),
      "title": "String",
      "description": "String",
      "difficulty": "String (one of: Beginner, Intermediate, Advanced, Expert)",
      "suggested_questions": Integer (number of questions to assess this topic)
    }}
  ]
}}
<|end|>
<|assistant|>
"""
