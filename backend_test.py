#!/usr/bin/env python3
"""
LEVEL 7 Cerca AI Backend Testing
Tests all AI endpoints including knowledge base, chat, and message history
"""

import requests
import json
import sys
import time

BASE_URL = "https://nextjs-fullstack-9.preview.emergentagent.com/api"

def test_seed():
    """Test 1: POST /api/seed for clean state"""
    print("\n=== Test 1: POST /api/seed ===")
    try:
        response = requests.post(f"{BASE_URL}/seed")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get("ok") == True, "Expected ok:true"
        assert data.get("reseeded") == True, "Expected reseeded:true"
        
        print("✅ Test 1 PASSED: Seed endpoint working")
        return True
    except Exception as e:
        print(f"❌ Test 1 FAILED: {str(e)}")
        return False

def test_get_knowledge():
    """Test 2: GET /api/knowledge - 25 docs with id/title/category/tags, no full text, no _id"""
    print("\n=== Test 2: GET /api/knowledge ===")
    try:
        response = requests.get(f"{BASE_URL}/knowledge")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        knowledge = data.get("knowledge", [])
        print(f"Number of knowledge docs: {len(knowledge)}")
        
        assert len(knowledge) == 25, f"Expected 25 docs, got {len(knowledge)}"
        
        # Check first doc structure
        doc = knowledge[0]
        print(f"\nFirst doc: {json.dumps(doc, indent=2)}")
        
        required_fields = ['id', 'title', 'category', 'tags']
        for field in required_fields:
            assert field in doc, f"Missing field: {field}"
        
        # Verify no full text or _id
        assert 'text' not in doc, "Found 'text' field (should not be included)"
        assert '_id' not in doc, "Found '_id' field (should be cleaned)"
        
        print("✅ Test 2 PASSED: GET /api/knowledge returns 25 docs with correct structure")
        return True
    except Exception as e:
        print(f"❌ Test 2 FAILED: {str(e)}")
        return False

def test_chat_validation():
    """Test 3: POST /api/ai/chat validation - empty body, missing fields, long message"""
    print("\n=== Test 3: POST /api/ai/chat validation ===")
    try:
        # Test empty body
        print("\n--- Testing empty body ---")
        response1 = requests.post(f"{BASE_URL}/ai/chat", json={})
        print(f"Empty body status: {response1.status_code}")
        assert response1.status_code == 400, f"Expected 400, got {response1.status_code}"
        
        # Test missing message
        print("\n--- Testing missing message ---")
        response2 = requests.post(f"{BASE_URL}/ai/chat", json={"session_id": "test-session"})
        print(f"Missing message status: {response2.status_code}")
        assert response2.status_code == 400, f"Expected 400, got {response2.status_code}"
        
        # Test missing session_id
        print("\n--- Testing missing session_id ---")
        response3 = requests.post(f"{BASE_URL}/ai/chat", json={"message": "Hello"})
        print(f"Missing session_id status: {response3.status_code}")
        assert response3.status_code == 400, f"Expected 400, got {response3.status_code}"
        
        # Test message longer than 2000 chars
        print("\n--- Testing message > 2000 chars ---")
        long_message = "a" * 2001
        response4 = requests.post(f"{BASE_URL}/ai/chat", json={"session_id": "test-session", "message": long_message})
        print(f"Long message status: {response4.status_code}")
        assert response4.status_code == 400, f"Expected 400, got {response4.status_code}"
        
        print("✅ Test 3 PASSED: All validation checks working correctly")
        return True
    except Exception as e:
        print(f"❌ Test 3 FAILED: {str(e)}")
        return False

def test_training_question():
    """Test 4: Training question - leash pulling"""
    print("\n=== Test 4: Training question (leash pulling) ===")
    try:
        payload = {
            "session_id": "qa-train",
            "message": "How can I teach Milo not to pull on the leash?"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        sources = data.get("sources", [])
        emergency = data.get("emergency", None)
        offTopic = data.get("offTopic", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Sources: {json.dumps(sources, indent=2)}")
        print(f"Emergency: {emergency}")
        print(f"Off-topic: {offTopic}")
        
        # Verify answer is non-empty
        assert len(answer) > 0, "Answer should be non-empty"
        
        # Verify answer is grounded and mentions key concepts
        answer_lower = answer.lower()
        assert any(keyword in answer_lower for keyword in ['stop', 'leash', 'walk', 'reward', 'beside', 'tighten']), \
            "Answer should mention stopping when leash tightens or rewarding walking beside"
        
        # Verify sources include 'Loose Leash Walking Basics'
        source_titles = [s.get('title', '') for s in sources]
        print(f"Source titles: {source_titles}")
        assert len(sources) >= 1, f"Expected at least 1 source, got {len(sources)}"
        assert 'Loose Leash Walking Basics' in source_titles, \
            f"Expected 'Loose Leash Walking Basics' in sources, got {source_titles}"
        
        # Verify not emergency or off-topic
        assert emergency == False, f"Expected emergency:false, got {emergency}"
        assert offTopic == False, f"Expected offTopic:false, got {offTopic}"
        
        print("✅ Test 4 PASSED: Training question answered correctly with proper grounding")
        return True
    except Exception as e:
        print(f"❌ Test 4 FAILED: {str(e)}")
        return False

def test_behaviour_question():
    """Test 5: Behaviour question - cat hiding"""
    print("\n=== Test 5: Behaviour question (cat hiding) ===")
    try:
        payload = {
            "session_id": "qa-behav",
            "message": "My cat suddenly hides all day, is she stressed?"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        sources = data.get("sources", [])
        emergency = data.get("emergency", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Sources: {json.dumps(sources, indent=2)}")
        print(f"Emergency: {emergency}")
        
        # Verify answer is non-empty and relevant
        assert len(answer) > 0, "Answer should be non-empty"
        
        # Verify sources are non-empty and topically plausible
        assert len(sources) > 0, f"Expected non-empty sources, got {len(sources)}"
        
        source_titles = [s.get('title', '') for s in sources]
        print(f"Source titles: {source_titles}")
        # Should include cat hiding/behaviour related doc
        assert any('hide' in title.lower() or 'cat' in title.lower() or 'behaviour' in title.lower() 
                   for title in source_titles), \
            f"Expected cat/hiding/behaviour related source, got {source_titles}"
        
        # Verify not emergency
        assert emergency == False, f"Expected emergency:false, got {emergency}"
        
        print("✅ Test 5 PASSED: Behaviour question answered with relevant sources")
        return True
    except Exception as e:
        print(f"❌ Test 5 FAILED: {str(e)}")
        return False

def test_emergency_poisoning():
    """Test 6: EMERGENCY - poisoning"""
    print("\n=== Test 6: EMERGENCY (poisoning) ===")
    try:
        payload = {
            "session_id": "qa-emerg-poison",
            "message": "My dog may have eaten something poisonous and is shaking. What should I do?"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        sources = data.get("sources", [])
        emergency = data.get("emergency", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Sources: {json.dumps(sources, indent=2)}")
        print(f"Emergency: {emergency}")
        
        # Verify emergency flag is true
        assert emergency == True, f"Expected emergency:true, got {emergency}"
        
        # Verify sources include emergency/toxic docs
        source_titles = [s.get('title', '') for s in sources]
        print(f"Source titles: {source_titles}")
        assert any(title in ['When to Go to the Vet Immediately', 'Foods and Plants to Keep Away'] 
                   for title in source_titles), \
            f"Expected emergency/toxic sources, got {source_titles}"
        
        # Verify answer escalates to urgent vet care
        answer_lower = answer.lower()
        assert any(keyword in answer_lower for keyword in ['vet', 'emergency', 'urgent', 'immediately', 'clinic']), \
            "Answer should clearly escalate to urgent veterinary care"
        
        # Verify answer does NOT attempt diagnosis or suggest home remedies
        assert not any(keyword in answer_lower for keyword in ['probably', 'might be fine', 'wait and see', 'home remedy']), \
            "Answer should NOT suggest waiting or home remedies for emergency"
        
        print("✅ Test 6 PASSED: Emergency (poisoning) detected and escalated correctly")
        return True
    except Exception as e:
        print(f"❌ Test 6 FAILED: {str(e)}")
        return False

def test_emergency_seizure():
    """Test 7: EMERGENCY - seizure"""
    print("\n=== Test 7: EMERGENCY (seizure) ===")
    try:
        payload = {
            "session_id": "qa-emerg-seizure",
            "message": "My cat is having a seizure"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        emergency = data.get("emergency", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Emergency: {emergency}")
        
        # Verify emergency flag is true
        assert emergency == True, f"Expected emergency:true, got {emergency}"
        
        # Verify answer escalates to urgent vet care
        answer_lower = answer.lower()
        assert any(keyword in answer_lower for keyword in ['vet', 'emergency', 'urgent', 'immediately']), \
            "Answer should clearly escalate to urgent veterinary care"
        
        print("✅ Test 7 PASSED: Emergency (seizure) detected and escalated correctly")
        return True
    except Exception as e:
        print(f"❌ Test 7 FAILED: {str(e)}")
        return False

def test_emergency_breathing():
    """Test 8: EMERGENCY - breathing difficulty"""
    print("\n=== Test 8: EMERGENCY (breathing difficulty) ===")
    try:
        payload = {
            "session_id": "qa-emerg-breath",
            "message": "My dog cannot breathe properly"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        emergency = data.get("emergency", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Emergency: {emergency}")
        
        # Verify emergency flag is true
        assert emergency == True, f"Expected emergency:true, got {emergency}"
        
        # Verify answer escalates to urgent vet care
        answer_lower = answer.lower()
        assert any(keyword in answer_lower for keyword in ['vet', 'emergency', 'urgent', 'immediately']), \
            "Answer should clearly escalate to urgent veterinary care"
        
        print("✅ Test 8 PASSED: Emergency (breathing) detected and escalated correctly")
        return True
    except Exception as e:
        print(f"❌ Test 8 FAILED: {str(e)}")
        return False

def test_non_emergency():
    """Test 9: NON-EMERGENCY should not be alarmist - brushing"""
    print("\n=== Test 9: NON-EMERGENCY (brushing) ===")
    try:
        payload = {
            "session_id": "qa-nonemerg",
            "message": "How often should I brush Milo?"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        emergency = data.get("emergency", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Emergency: {emergency}")
        
        # Verify emergency flag is false
        assert emergency == False, f"Expected emergency:false, got {emergency}"
        
        # Verify answer does NOT tell user to rush to vet
        answer_lower = answer.lower()
        assert not any(keyword in answer_lower for keyword in ['rush to vet', 'emergency', 'urgent', 'immediately see a vet']), \
            "Answer should NOT be alarmist for routine grooming question"
        
        print("✅ Test 9 PASSED: Non-emergency question handled calmly without alarm")
        return True
    except Exception as e:
        print(f"❌ Test 9 FAILED: {str(e)}")
        return False

def test_offtopic_worldcup():
    """Test 10: Off-topic - World Cup"""
    print("\n=== Test 10: Off-topic (World Cup) ===")
    try:
        payload = {
            "session_id": "qa-offtopic-wc",
            "message": "Who won the World Cup?"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        sources = data.get("sources", [])
        offTopic = data.get("offTopic", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Sources: {sources}")
        print(f"Off-topic: {offTopic}")
        
        # Verify offTopic flag is true
        assert offTopic == True, f"Expected offTopic:true, got {offTopic}"
        
        # Verify sources is empty array
        assert sources == [], f"Expected empty sources array, got {sources}"
        
        # Verify answer is short polite refusal mentioning pets
        answer_lower = answer.lower()
        assert any(keyword in answer_lower for keyword in ['pet', 'cerca']), \
            "Answer should mention pets or Cerca"
        
        # Verify [[OFFTOPIC]] marker is NOT in the answer text
        assert '[[OFFTOPIC]]' not in answer, "Raw marker [[OFFTOPIC]] should NOT appear in answer text"
        
        print("✅ Test 10 PASSED: Off-topic (World Cup) detected and handled correctly")
        return True
    except Exception as e:
        print(f"❌ Test 10 FAILED: {str(e)}")
        return False

def test_offtopic_python():
    """Test 11: Off-topic - Python script"""
    print("\n=== Test 11: Off-topic (Python script) ===")
    try:
        payload = {
            "session_id": "qa-offtopic-py",
            "message": "Write me a Python script to sort a list"
        }
        print(f"Sending: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        answer = data.get("answer", "")
        sources = data.get("sources", [])
        offTopic = data.get("offTopic", None)
        
        print(f"\nAnswer (first 200 chars): {answer[:200]}...")
        print(f"Sources: {sources}")
        print(f"Off-topic: {offTopic}")
        
        # Verify offTopic flag is true
        assert offTopic == True, f"Expected offTopic:true, got {offTopic}"
        
        # Verify sources is empty array
        assert sources == [], f"Expected empty sources array, got {sources}"
        
        # Verify [[OFFTOPIC]] marker is NOT in the answer text
        assert '[[OFFTOPIC]]' not in answer, "Raw marker [[OFFTOPIC]] should NOT appear in answer text"
        
        print("✅ Test 11 PASSED: Off-topic (Python) detected and handled correctly")
        return True
    except Exception as e:
        print(f"❌ Test 11 FAILED: {str(e)}")
        return False

def test_multiturn_memory():
    """Test 12: Multi-turn memory - same session_id"""
    print("\n=== Test 12: Multi-turn memory ===")
    try:
        session_id = "qa-multi"
        
        # First question
        print("\n--- First question ---")
        payload1 = {
            "session_id": session_id,
            "message": "How can I teach Milo not to pull on the leash?"
        }
        print(f"Sending: {json.dumps(payload1, indent=2)}")
        
        response1 = requests.post(f"{BASE_URL}/ai/chat", json=payload1, timeout=35)
        print(f"Status: {response1.status_code}")
        data1 = response1.json()
        
        assert response1.status_code == 200, f"Expected 200, got {response1.status_code}"
        
        answer1 = data1.get("answer", "")
        print(f"Answer 1 (first 200 chars): {answer1[:200]}...")
        
        # Wait a moment before second question
        time.sleep(2)
        
        # Second question (follow-up)
        print("\n--- Second question (follow-up) ---")
        payload2 = {
            "session_id": session_id,
            "message": "How long will that take?"
        }
        print(f"Sending: {json.dumps(payload2, indent=2)}")
        
        response2 = requests.post(f"{BASE_URL}/ai/chat", json=payload2, timeout=35)
        print(f"Status: {response2.status_code}")
        data2 = response2.json()
        
        assert response2.status_code == 200, f"Expected 200, got {response2.status_code}"
        
        answer2 = data2.get("answer", "")
        print(f"Answer 2 (first 200 chars): {answer2[:200]}...")
        
        # Verify second answer is contextually about leash training
        answer2_lower = answer2.lower()
        assert any(keyword in answer2_lower for keyword in ['leash', 'walk', 'train', 'week', 'consistency', 'practice']), \
            "Second answer should be contextually about leash training, not a generic reply"
        
        print("✅ Test 12 PASSED: Multi-turn memory working, conversation history used")
        return True
    except Exception as e:
        print(f"❌ Test 12 FAILED: {str(e)}")
        return False

def test_get_messages():
    """Test 13: GET /api/ai/messages - retrieve conversation history"""
    print("\n=== Test 13: GET /api/ai/messages ===")
    try:
        session_id = "qa-multi"
        
        # Get messages for the multi-turn session
        print(f"\n--- Getting messages for session: {session_id} ---")
        response = requests.get(f"{BASE_URL}/ai/messages?session_id={session_id}")
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        messages = data.get("messages", [])
        print(f"Number of messages: {len(messages)}")
        
        # Should have at least 4 messages (2 user + 2 assistant from multi-turn test)
        assert len(messages) >= 4, f"Expected at least 4 messages, got {len(messages)}"
        
        # Check message structure
        for i, msg in enumerate(messages[:4]):
            print(f"\nMessage {i+1}: {json.dumps(msg, indent=2)}")
            
            assert 'role' in msg, f"Message {i+1} missing 'role' field"
            assert msg['role'] in ['user', 'assistant'], f"Message {i+1} has invalid role: {msg['role']}"
            assert 'content' in msg, f"Message {i+1} missing 'content' field"
            
            # Assistant messages should have sources
            if msg['role'] == 'assistant':
                assert 'sources' in msg, f"Assistant message {i+1} missing 'sources' field"
            
            # Verify no _id field
            assert '_id' not in msg, f"Message {i+1} has _id field (should be cleaned)"
        
        # Verify messages are in chronological order
        if len(messages) >= 2:
            for i in range(len(messages) - 1):
                assert messages[i].get('createdAt', '') <= messages[i+1].get('createdAt', ''), \
                    f"Messages not in chronological order at index {i}"
        
        # Test missing session_id
        print("\n--- Testing missing session_id ---")
        response_400 = requests.get(f"{BASE_URL}/ai/messages")
        print(f"Missing session_id status: {response_400.status_code}")
        assert response_400.status_code == 400, f"Expected 400, got {response_400.status_code}"
        
        print("✅ Test 13 PASSED: GET /api/ai/messages returns stored messages correctly")
        return True
    except Exception as e:
        print(f"❌ Test 13 FAILED: {str(e)}")
        return False

def test_regression():
    """Test 14: Regression - all previous endpoints still work"""
    print("\n=== Test 14: Regression sweep ===")
    try:
        endpoints = [
            ("GET", "/health", 200, 6),
            ("GET", "/bootstrap", 200, None),
            ("GET", "/reports", 200, 6),
            ("GET", "/posts", 200, 6),
            ("GET", "/questions", 200, 5),
            ("GET", "/lessons", 200, 7),
            ("GET", "/products", 200, 6),
            ("GET", "/sitters", 200, 4),
            ("GET", "/rehoming", 200, 4),
            ("GET", "/badges", 200, 5),
            ("GET", "/progress", 200, None),
            ("GET", "/cart", 200, None),
        ]
        
        for method, endpoint, expected_status, expected_count in endpoints:
            url = f"{BASE_URL}{endpoint}"
            response = requests.get(url)
            print(f"{method} {endpoint}: {response.status_code}")
            assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}"
            
            # Check for _id leakage
            data = response.json()
            data_str = json.dumps(data)
            assert '"_id"' not in data_str, f"Found _id leakage in {endpoint}"
            
            # Check counts for collection endpoints
            if expected_count is not None:
                collection_name = endpoint.strip('/').split('/')[-1]
                if collection_name in data:
                    items = data[collection_name]
                    if isinstance(items, list):
                        actual_count = len(items)
                        assert actual_count == expected_count, \
                            f"{endpoint} expected {expected_count} items, got {actual_count}"
                        print(f"  ✓ Count: {actual_count}")
                elif collection_name == 'badges':
                    badges = data.get('badges', [])
                    actual_count = len(badges)
                    assert actual_count == expected_count, \
                        f"{endpoint} expected {expected_count} badges, got {actual_count}"
                    print(f"  ✓ Count: {actual_count}")
        
        # Test POST endpoints
        print("\n--- Testing POST endpoints ---")
        
        # POST /api/reports
        report_payload = {
            "status": "lost",
            "species": "Dog",
            "petName": "Test Dog",
            "lat": 52.52,
            "lng": 13.40
        }
        response = requests.post(f"{BASE_URL}/reports", json=report_payload)
        print(f"POST /reports: {response.status_code}")
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        # POST /api/posts
        post_payload = {
            "text": "Test post for regression"
        }
        response = requests.post(f"{BASE_URL}/posts", json=post_payload)
        print(f"POST /posts: {response.status_code}")
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        # POST /api/cart
        cart_payload = {
            "productId": "pr-1",
            "qty": 1
        }
        response = requests.post(f"{BASE_URL}/cart", json=cart_payload)
        print(f"POST /cart: {response.status_code}")
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        # POST /api/bookings
        booking_payload = {
            "sitterId": "st-anna",
            "date": "2026-08-22",
            "pet": "Milo"
        }
        response = requests.post(f"{BASE_URL}/bookings", json=booking_payload)
        print(f"POST /bookings: {response.status_code}")
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        # POST /api/interests
        interest_payload = {
            "petId": "rh-luna",
            "message": "I would love to adopt Luna."
        }
        response = requests.post(f"{BASE_URL}/interests", json=interest_payload)
        print(f"POST /interests: {response.status_code}")
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        
        # POST /api/progress/complete
        progress_payload = {
            "lessonId": "les-recall"
        }
        response = requests.post(f"{BASE_URL}/progress/complete", json=progress_payload)
        print(f"POST /progress/complete: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        print("✅ Test 14 PASSED: All regression tests passed, no _id leakage")
        return True
    except Exception as e:
        print(f"❌ Test 14 FAILED: {str(e)}")
        return False

def test_seed_clears_ai_messages():
    """Test 15: POST /api/seed clears ai_messages"""
    print("\n=== Test 15: POST /api/seed clears ai_messages ===")
    try:
        # Send a chat message
        print("\n--- Sending a chat message ---")
        payload = {
            "session_id": "test-seed-clear",
            "message": "How often should I feed my dog?"
        }
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, timeout=35)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify message exists
        print("\n--- Verifying message exists ---")
        response = requests.get(f"{BASE_URL}/ai/messages?session_id=test-seed-clear")
        data = response.json()
        messages_before = data.get("messages", [])
        print(f"Messages before seed: {len(messages_before)}")
        assert len(messages_before) > 0, "Expected messages before seed"
        
        # Reseed
        print("\n--- Reseeding ---")
        response_seed = requests.post(f"{BASE_URL}/seed")
        assert response_seed.status_code == 200, f"Expected 200, got {response_seed.status_code}"
        
        # Verify messages are cleared
        print("\n--- Verifying messages are cleared ---")
        response = requests.get(f"{BASE_URL}/ai/messages?session_id=test-seed-clear")
        data = response.json()
        messages_after = data.get("messages", [])
        print(f"Messages after seed: {len(messages_after)}")
        assert len(messages_after) == 0, f"Expected 0 messages after seed, got {len(messages_after)}"
        
        print("✅ Test 15 PASSED: POST /api/seed clears ai_messages")
        return True
    except Exception as e:
        print(f"❌ Test 15 FAILED: {str(e)}")
        return False

def main():
    """Run all LEVEL 7 Cerca AI tests"""
    print("=" * 80)
    print("LEVEL 7 CERCA AI BACKEND TESTING")
    print("=" * 80)
    
    tests = [
        test_seed,
        test_get_knowledge,
        test_chat_validation,
        test_training_question,
        test_behaviour_question,
        test_emergency_poisoning,
        test_emergency_seizure,
        test_emergency_breathing,
        test_non_emergency,
        test_offtopic_worldcup,
        test_offtopic_python,
        test_multiturn_memory,
        test_get_messages,
        test_regression,
        test_seed_clears_ai_messages,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            results.append(False)
    
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n⚠️  SOME TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
