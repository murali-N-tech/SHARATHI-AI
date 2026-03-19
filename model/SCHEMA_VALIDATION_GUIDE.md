# JSON Schema vs Parsed Data - Validation Checklist

## Expected Schema (from quiz_prompt.py)
```json
{
  "question_id": "String",
  "question_text": "String", 
  "code_context": "String or null",
  "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
  "correct_option_index": 0,
  "hint": "String",
  "explanation": "String"
}
```

## Validation Checklist (Now Enforced in quiz.py)

### ✅ Required Fields (All Must Exist)
- [x] `question_id` - Must exist
- [x] `question_text` - Must exist
- [x] `options` - Must exist
- [x] `correct_option_index` - Must exist
- [x] `hint` - Must exist
- [x] `explanation` - Must exist
- [x] `code_context` - Optional (can be null)

### ✅ Field Type Validation

| Field | Type | Validation |
|-------|------|-----------|
| `question_id` | `string` | Non-empty |
| `question_text` | `string` | Non-empty |
| `options` | `array[string]` | Exactly 4 items, all strings |
| `correct_option_index` | `integer` | Must be 0, 1, 2, or 3 (NOT -1) |
| `hint` | `string` | Non-empty |
| `explanation` | `string` | Non-empty |
| `code_context` | `string` or `null` | Can be null or string |

## Validation Flow

### Before (INCOMPLETE)
❌ Missing `question_id` check  
❌ Missing `code_context` type check  
❌ `hint` and `explanation` checked only for existence, not type  
❌ `options` items not validated as strings  
❌ `correct_option_index` not checked as integer type  

### After (COMPLETE)
✅ All required fields checked for existence  
✅ All field types validated  
✅ All field values sanitized  
✅ Proper error messages identify exactly what failed  
✅ Each field has explicit validation with clear error output  

## Example Error Messages Now Generated

```
Missing required field: question_id
question_id must be a non-empty string
question_text must be a non-empty string
options must be exactly 4 items
all options must be strings
correct_option_index must be an integer, got NoneType
correct_option_index is -1 (invalid index returned by model)
correct_option_index must be 0-3, got 5
hint must be a non-empty string
explanation must be a non-empty string
code_context must be string or null, got list
```

## Testing

When you see validation errors in console, they now clearly indicate:
1. **WHAT** failed (field name)
2. **WHY** it failed (type or value issue)
3. **EXPECTED** format (what should have been provided)
4. **ACTUAL** value or type (what was provided)

This makes debugging AI response issues much easier!
