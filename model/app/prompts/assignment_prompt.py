ASSIGNMENT_PROMPT_TEMPLATE = """You are an expert educational content designer. Based on the user's input, generate a structured list of topics for an assignment.

User Input: {user_input}

Generate a JSON response with the following structure:
{{
  "assignment_name": "Brief descriptive name for the assignment",
  "description": "Short description of what this assignment covers",
  "topics": [
    {{
      "id": 1,
      "title": "Topic name",
      "description": "Brief description of the topic",
      "difficulty": "easy|medium|hard",
      "estimated_time_minutes": 15
    }}
  ],
  "total_questions": 15,
  "difficulty_level": "beginner|intermediate|advanced"
}}

Guidelines:
- Generate 4-8 relevant topics based on the user input
- Each topic should be distinct and focused
- Topics should cover different aspects of the subject
- Difficulty should be appropriate for the assignment level
- Total questions should be distributed across topics
- Keep descriptions concise and clear
- Use proper JSON formatting

Return ONLY the JSON object, no additional text or explanation.
"""
