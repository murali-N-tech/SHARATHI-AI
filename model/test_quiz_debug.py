#!/usr/bin/env python3
"""Debug script to test quiz generation and see the actual -1 issue"""
import requests
import json

# Test the quiz endpoint
def test_quiz():
    url = "http://127.0.0.1:8000/quiz/quiz"
    
    payload = {
        "domain_name": "Python",
        "program_name": "Data Structures",
        "level": 2,
        "session_id": "test-session-001",
        "history": []
    }
    
    print("=" * 80)
    print("SENDING QUIZ REQUEST:")
    print(json.dumps(payload, indent=2))
    print("=" * 80)
    
    response = requests.post(url, json=payload, timeout=60)
    
    print("\nRESPONSE STATUS:", response.status_code)
    print("\nRESPONSE BODY:")
    resp_data = response.json()
    print(json.dumps(resp_data, indent=2))
    
    if response.status_code == 200 and "data" in resp_data:
        data = resp_data["data"]
        print("\n" + "=" * 80)
        print("EXTRACTED DATA:")
        print(f"question_id: {data.get('question_id')}")
        print(f"question_text: {data.get('question_text')}")
        print(f"correct_option_index: {data.get('correct_option_index')} (type: {type(data.get('correct_option_index'))})")
        print(f"options: {data.get('options')}")
        print(f"hint: {data.get('hint')}")
        print(f"explanation: {data.get('explanation')}")
        print("=" * 80)
        
        # Check if -1 is present
        if data.get('correct_option_index') == -1:
            print("\n❌ ERROR: correct_option_index is -1!")
        else:
            print(f"\n✓ correct_option_index is valid: {data.get('correct_option_index')}")

if __name__ == "__main__":
    test_quiz()
