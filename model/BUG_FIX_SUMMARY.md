# Bug Fix: correct_option_index = -1 Issue

## Root Cause
The validation was checking for the **wrong field name**:

```python
# ❌ WRONG (Line 67 in old code)
correct_idx = parsed.get("correctIndex")  # This field doesn't exist in AI response!
```

Since `correctIndex` doesn't exist in the parsed JSON, `correct_idx` was always `None`, which passed the validation check `if correct_idx not in (0, 1, 2, 3)`.

The AI was returning `-1` for `correct_option_index`, but the validation was silently allowing it through.

## Solution Applied

### 1. Fixed Field Name in Validation
```python
# ✓ CORRECT (Line 87 in new code)
correct_idx = parsed.get("correct_option_index")  # Check the ACTUAL field
if correct_idx == -1:
    raise ValueError("correct_option_index is -1 (invalid index returned by model)")
if correct_idx not in (0, 1, 2, 3):
    raise ValueError(f"correct_option_index must be 0-3, got {correct_idx}")
```

### 2. Added Data Transformation Function
Created `transform_backend_to_frontend()` to properly convert between formats:
- Backend sends: `correct_option_index`
- Frontend receives: `correctIndex`

This ensures:
- Type consistency
- Clear field mapping
- Single point of validation before transformation

### 3. Added Double Validation
- Validates in `generate_quiz_core()` 
- Validates again before sending response
- Validates cached data before returning

### 4. Backend Structure (what API sends)
```json
{
  "status": "success",
  "session_id": "xxx",
  "attempts_used": 1,
  "data": {
    "id": "Q1",
    "question": "What is...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "hint": "...",
    "code_context": null,
    "explanation": "..."
  }
}
```

## Testing
Run `test_quiz_debug.py` to verify:
```powershell
python main.py
# In another terminal:
python test_quiz_debug.py
```

You should now see:
- `correctIndex: 0, 1, 2, or 3` (NEVER -1)
- Console logs showing validation passed
- No more invalid indices reaching the frontend
