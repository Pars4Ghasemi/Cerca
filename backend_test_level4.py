#!/usr/bin/env python3
"""
LEVEL 4 Backend API Tests - Learning + Streak + Rewards
Tests badges computation, progress tracking, lesson completion, and streak logic
"""

import requests
import json
import sys

BASE_URL = "https://nextjs-fullstack-9.preview.emergentagent.com/api"

def test_seed_reset():
    """Test 1: POST /api/seed to get clean state (seed v4)"""
    print("\n=== Test 1: POST /api/seed (reset to clean state v4) ===")
    try:
        response = requests.post(f"{BASE_URL}/seed", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('ok') == True, "Expected ok:true"
        assert data.get('reseeded') == True, "Expected reseeded:true"
        assert data.get('version') == 4, f"Expected version:4, got {data.get('version')}"
        
        print("✅ Test 1 PASSED: Seed reset successful with version 4")
        return True
    except Exception as e:
        print(f"❌ Test 1 FAILED: {str(e)}")
        return False

def test_get_badges():
    """Test 2: GET /api/badges - verify 5 computed badges with correct structure"""
    print("\n=== Test 2: GET /api/badges (5 computed badges) ===")
    try:
        response = requests.get(f"{BASE_URL}/badges", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        badges = data.get('badges', [])
        print(f"Number of badges: {len(badges)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert len(badges) == 5, f"Expected 5 badges, got {len(badges)}"
        
        # Check each badge structure
        required_fields = ['id', 'emoji', 'name', 'description', 'progress', 'target', 'unlocked']
        for badge in badges:
            for field in required_fields:
                assert field in badge, f"Badge {badge.get('id')} missing field: {field}"
            assert '_id' not in badge, f"Badge {badge.get('id')} has _id leakage"
            print(f"{badge['id']}: {badge['name']} - {badge['progress']}/{badge['target']} - unlocked: {badge['unlocked']}")
        
        # Verify specific badge states with clean seed (3 lessons completed)
        bd_starter = next((b for b in badges if b['id'] == 'bd-starter'), None)
        bd_smart = next((b for b in badges if b['id'] == 'bd-smart'), None)
        bd_streak7 = next((b for b in badges if b['id'] == 'bd-streak7'), None)
        bd_explorer = next((b for b in badges if b['id'] == 'bd-explorer'), None)
        bd_caring = next((b for b in badges if b['id'] == 'bd-caring'), None)
        
        assert bd_starter is not None, "bd-starter not found"
        assert bd_starter['progress'] == 1, f"bd-starter progress should be 1, got {bd_starter['progress']}"
        assert bd_starter['target'] == 1, f"bd-starter target should be 1, got {bd_starter['target']}"
        assert bd_starter['unlocked'] == True, f"bd-starter should be unlocked, got {bd_starter['unlocked']}"
        
        assert bd_smart is not None, "bd-smart not found"
        assert bd_smart['progress'] == 3, f"bd-smart progress should be 3, got {bd_smart['progress']}"
        assert bd_smart['target'] == 5, f"bd-smart target should be 5, got {bd_smart['target']}"
        assert bd_smart['unlocked'] == False, f"bd-smart should be locked, got {bd_smart['unlocked']}"
        
        assert bd_streak7 is not None, "bd-streak7 not found"
        assert bd_streak7['progress'] == 4, f"bd-streak7 progress should be 4, got {bd_streak7['progress']}"
        assert bd_streak7['target'] == 7, f"bd-streak7 target should be 7, got {bd_streak7['target']}"
        assert bd_streak7['unlocked'] == False, f"bd-streak7 should be locked, got {bd_streak7['unlocked']}"
        
        assert bd_explorer is not None, "bd-explorer not found"
        assert bd_explorer['progress'] == 4, f"bd-explorer progress should be 4, got {bd_explorer['progress']}"
        assert bd_explorer['target'] == 7, f"bd-explorer target should be 7, got {bd_explorer['target']}"
        assert bd_explorer['unlocked'] == False, f"bd-explorer should be locked, got {bd_explorer['unlocked']}"
        
        assert bd_caring is not None, "bd-caring not found"
        assert bd_caring['progress'] == 0, f"bd-caring progress should be 0, got {bd_caring['progress']}"
        assert bd_caring['target'] == 1, f"bd-caring target should be 1, got {bd_caring['target']}"
        assert bd_caring['unlocked'] == False, f"bd-caring should be locked, got {bd_caring['unlocked']}"
        
        print("✅ Test 2 PASSED: All 5 badges with correct structure and initial states")
        return True
    except Exception as e:
        print(f"❌ Test 2 FAILED: {str(e)}")
        return False

def test_get_progress():
    """Test 3: GET /api/progress - verify progress object with badges array"""
    print("\n=== Test 3: GET /api/progress (progress + badges) ===")
    try:
        response = requests.get(f"{BASE_URL}/progress", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        progress = data.get('progress', {})
        badges = data.get('badges', [])
        
        print(f"Progress: {json.dumps(progress, indent=2)}")
        print(f"Badges count: {len(badges)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'progress' in data, "Response missing progress object"
        assert 'badges' in data, "Response missing badges array"
        
        # Verify progress structure
        assert progress.get('streak') == 4, f"Expected streak 4, got {progress.get('streak')}"
        assert progress.get('target') == 7, f"Expected target 7, got {progress.get('target')}"
        assert progress.get('points') == 340, f"Expected points 340, got {progress.get('points')}"
        assert len(progress.get('completedLessons', [])) == 3, f"Expected 3 completed lessons, got {len(progress.get('completedLessons', []))}"
        assert 'les-paws' in progress.get('completedLessons', []), "Expected les-paws in completedLessons"
        assert 'les-sniff' in progress.get('completedLessons', []), "Expected les-sniff in completedLessons"
        assert 'les-food-portions' in progress.get('completedLessons', []), "Expected les-food-portions in completedLessons"
        assert '_id' not in progress, "Progress has _id leakage"
        
        # Verify badges array
        assert len(badges) == 5, f"Expected 5 badges, got {len(badges)}"
        
        print("✅ Test 3 PASSED: Progress object with streak 4, points 340, 3 lessons, and 5 badges")
        return True
    except Exception as e:
        print(f"❌ Test 3 FAILED: {str(e)}")
        return False

def test_bootstrap_with_badges():
    """Test 4: GET /api/bootstrap - verify it now returns badges array"""
    print("\n=== Test 4: GET /api/bootstrap (now includes badges) ===")
    try:
        response = requests.get(f"{BASE_URL}/bootstrap", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'badges' in data, "Bootstrap response missing badges array"
        
        badges = data.get('badges', [])
        print(f"Badges count in bootstrap: {len(badges)}")
        assert len(badges) == 5, f"Expected 5 badges in bootstrap, got {len(badges)}"
        
        # Verify no _id leakage in any part of bootstrap
        assert '_id' not in data.get('user', {}), "User has _id leakage"
        assert '_id' not in data.get('pet', {}), "Pet has _id leakage"
        assert '_id' not in data.get('progress', {}), "Progress has _id leakage"
        for badge in badges:
            assert '_id' not in badge, f"Badge {badge.get('id')} has _id leakage"
        
        print("✅ Test 4 PASSED: Bootstrap now includes badges array (5 badges), no _id leakage")
        return True
    except Exception as e:
        print(f"❌ Test 4 FAILED: {str(e)}")
        return False

def test_complete_lesson_first_time():
    """Test 5: POST /api/progress/complete with lessonId:'les-stay' - verify streak increase"""
    print("\n=== Test 5: POST /api/progress/complete (les-stay, first time) ===")
    try:
        payload = {"lessonId": "les-stay"}
        response = requests.post(f"{BASE_URL}/progress/complete", json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('already') == False, f"Expected already:false, got {data.get('already')}"
        assert data.get('awarded') == 20, f"Expected awarded:20 (les-stay points), got {data.get('awarded')}"
        assert data.get('streakIncreased') == True, f"Expected streakIncreased:true (last completed ~26h ago), got {data.get('streakIncreased')}"
        
        progress = data.get('progress', {})
        assert progress.get('streak') == 5, f"Expected streak 5 (4+1), got {progress.get('streak')}"
        assert progress.get('points') == 360, f"Expected points 360 (340+20), got {progress.get('points')}"
        assert len(progress.get('completedLessons', [])) == 4, f"Expected 4 completed lessons, got {len(progress.get('completedLessons', []))}"
        assert 'les-stay' in progress.get('completedLessons', []), "Expected les-stay in completedLessons"
        
        badges = data.get('badges', [])
        assert len(badges) == 5, f"Expected 5 badges, got {len(badges)}"
        
        # Check badge progress updates
        bd_smart = next((b for b in badges if b['id'] == 'bd-smart'), None)
        bd_streak7 = next((b for b in badges if b['id'] == 'bd-streak7'), None)
        bd_explorer = next((b for b in badges if b['id'] == 'bd-explorer'), None)
        
        assert bd_smart['progress'] == 4, f"bd-smart progress should be 4, got {bd_smart['progress']}"
        assert bd_smart['unlocked'] == False, f"bd-smart should still be locked (4/5), got {bd_smart['unlocked']}"
        
        assert bd_streak7['progress'] == 5, f"bd-streak7 progress should be 5, got {bd_streak7['progress']}"
        assert bd_streak7['unlocked'] == False, f"bd-streak7 should still be locked (5/7), got {bd_streak7['unlocked']}"
        
        assert bd_explorer['progress'] == 5, f"bd-explorer progress should be 5, got {bd_explorer['progress']}"
        assert bd_explorer['unlocked'] == False, f"bd-explorer should still be locked (5/7), got {bd_explorer['unlocked']}"
        
        print("✅ Test 5 PASSED: Lesson completed, streak 4->5, points 340->360, badges updated to 4/5 and 5/7")
        return True
    except Exception as e:
        print(f"❌ Test 5 FAILED: {str(e)}")
        return False

def test_complete_lesson_idempotency():
    """Test 6: POST /api/progress/complete with same lesson again - idempotency check"""
    print("\n=== Test 6: POST /api/progress/complete (les-stay again, idempotency) ===")
    try:
        payload = {"lessonId": "les-stay"}
        response = requests.post(f"{BASE_URL}/progress/complete", json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('already') == True, f"Expected already:true (lesson already completed), got {data.get('already')}"
        assert data.get('awarded') == 0, f"Expected awarded:0 (no double award), got {data.get('awarded')}"
        assert data.get('streakIncreased') == False, f"Expected streakIncreased:false (already completed), got {data.get('streakIncreased')}"
        
        progress = data.get('progress', {})
        assert progress.get('streak') == 5, f"Expected streak still 5 (unchanged), got {progress.get('streak')}"
        assert progress.get('points') == 360, f"Expected points still 360 (unchanged), got {progress.get('points')}"
        assert len(progress.get('completedLessons', [])) == 4, f"Expected still 4 completed lessons, got {len(progress.get('completedLessons', []))}"
        
        print("✅ Test 6 PASSED: Idempotency working - already:true, awarded:0, no changes to progress")
        return True
    except Exception as e:
        print(f"❌ Test 6 FAILED: {str(e)}")
        return False

def test_complete_second_lesson_same_day():
    """Test 7: POST /api/progress/complete with different lesson (les-recall) - same day, no streak increase"""
    print("\n=== Test 7: POST /api/progress/complete (les-recall, same day) ===")
    try:
        payload = {"lessonId": "les-recall"}
        response = requests.post(f"{BASE_URL}/progress/complete", json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('already') == False, f"Expected already:false, got {data.get('already')}"
        assert data.get('awarded') == 25, f"Expected awarded:25 (les-recall points), got {data.get('awarded')}"
        assert data.get('streakIncreased') == False, f"Expected streakIncreased:false (same day as les-stay), got {data.get('streakIncreased')}"
        
        progress = data.get('progress', {})
        assert progress.get('streak') == 5, f"Expected streak still 5 (same day), got {progress.get('streak')}"
        assert progress.get('points') == 385, f"Expected points 385 (360+25), got {progress.get('points')}"
        assert len(progress.get('completedLessons', [])) == 5, f"Expected 5 completed lessons, got {len(progress.get('completedLessons', []))}"
        assert 'les-recall' in progress.get('completedLessons', []), "Expected les-recall in completedLessons"
        
        badges = data.get('badges', [])
        bd_smart = next((b for b in badges if b['id'] == 'bd-smart'), None)
        
        assert bd_smart['progress'] == 5, f"bd-smart progress should be 5, got {bd_smart['progress']}"
        assert bd_smart['unlocked'] == True, f"bd-smart should now be unlocked (5/5), got {bd_smart['unlocked']}"
        
        print("✅ Test 7 PASSED: Second lesson completed same day, streak stays 5, points 360->385, bd-smart unlocked (5/5)")
        return True
    except Exception as e:
        print(f"❌ Test 7 FAILED: {str(e)}")
        return False

def test_complete_nonexistent_lesson():
    """Test 8: POST /api/progress/complete with non-existent lesson - should return 404"""
    print("\n=== Test 8: POST /api/progress/complete (non-existent lesson) ===")
    try:
        payload = {"lessonId": "does-not-exist"}
        response = requests.post(f"{BASE_URL}/progress/complete", json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert response.status_code == 404, f"Expected 404 for non-existent lesson, got {response.status_code}"
        assert 'error' in data, "Expected error message in response"
        print(f"Error message: {data.get('error')}")
        
        print("✅ Test 8 PASSED: Non-existent lesson returns 404 with error message")
        return True
    except Exception as e:
        print(f"❌ Test 8 FAILED: {str(e)}")
        return False

def test_caring_owner_badge():
    """Test 9: POST /api/contacts then GET /api/badges - verify bd-caring unlocked"""
    print("\n=== Test 9: Caring Owner badge (POST /api/contacts + GET /api/badges) ===")
    try:
        # First, verify bd-caring is locked
        response1 = requests.get(f"{BASE_URL}/badges", timeout=10)
        badges_before = response1.json().get('badges', [])
        bd_caring_before = next((b for b in badges_before if b['id'] == 'bd-caring'), None)
        print(f"bd-caring before contact: progress {bd_caring_before['progress']}/{bd_caring_before['target']}, unlocked: {bd_caring_before['unlocked']}")
        assert bd_caring_before['unlocked'] == False, "bd-caring should be locked before contact"
        
        # Send a contact message
        contact_payload = {
            "reportId": "rep-nala",
            "to": "Lena",
            "message": "I saw this pet"
        }
        response2 = requests.post(f"{BASE_URL}/contacts", json=contact_payload, timeout=10)
        print(f"POST /api/contacts - Status: {response2.status_code}")
        assert response2.status_code == 201, f"Expected 201, got {response2.status_code}"
        
        # Check badges again
        response3 = requests.get(f"{BASE_URL}/badges", timeout=10)
        badges_after = response3.json().get('badges', [])
        bd_caring_after = next((b for b in badges_after if b['id'] == 'bd-caring'), None)
        print(f"bd-caring after contact: progress {bd_caring_after['progress']}/{bd_caring_after['target']}, unlocked: {bd_caring_after['unlocked']}")
        
        assert bd_caring_after['progress'] == 1, f"bd-caring progress should be 1, got {bd_caring_after['progress']}"
        assert bd_caring_after['unlocked'] == True, f"bd-caring should be unlocked (1/1), got {bd_caring_after['unlocked']}"
        
        print("✅ Test 9 PASSED: Caring Owner badge unlocked after sending contact message")
        return True
    except Exception as e:
        print(f"❌ Test 9 FAILED: {str(e)}")
        return False

def test_regression():
    """Test 10: Regression - all previous endpoints still working, no _id leakage"""
    print("\n=== Test 10: Regression tests (all previous endpoints) ===")
    try:
        # GET /api/health
        response1 = requests.get(f"{BASE_URL}/health", timeout=10)
        assert response1.status_code == 200, f"GET /api/health failed: {response1.status_code}"
        assert response1.json().get('seedVersion') == 4, "Health endpoint should return seedVersion 4"
        print("✅ GET /api/health working (seedVersion 4)")
        
        # GET /api/reports
        response2 = requests.get(f"{BASE_URL}/reports", timeout=10)
        assert response2.status_code == 200, f"GET /api/reports failed: {response2.status_code}"
        reports = response2.json().get('reports', [])
        assert len(reports) == 6, f"Expected 6 reports, got {len(reports)}"
        for r in reports:
            assert '_id' not in r, f"Report {r.get('id')} has _id leakage"
        print(f"✅ GET /api/reports working (6 reports, no _id leakage)")
        
        # GET /api/posts
        response3 = requests.get(f"{BASE_URL}/posts", timeout=10)
        assert response3.status_code == 200, f"GET /api/posts failed: {response3.status_code}"
        posts = response3.json().get('posts', [])
        assert len(posts) == 6, f"Expected 6 posts, got {len(posts)}"
        for p in posts:
            assert '_id' not in p, f"Post {p.get('id')} has _id leakage"
        print(f"✅ GET /api/posts working (6 posts, no _id leakage)")
        
        # GET /api/questions
        response4 = requests.get(f"{BASE_URL}/questions", timeout=10)
        assert response4.status_code == 200, f"GET /api/questions failed: {response4.status_code}"
        questions = response4.json().get('questions', [])
        assert len(questions) == 5, f"Expected 5 questions, got {len(questions)}"
        for q in questions:
            assert '_id' not in q, f"Question {q.get('id')} has _id leakage"
        print(f"✅ GET /api/questions working (5 questions, no _id leakage)")
        
        # GET /api/lessons
        response5 = requests.get(f"{BASE_URL}/lessons", timeout=10)
        assert response5.status_code == 200, f"GET /api/lessons failed: {response5.status_code}"
        lessons = response5.json().get('lessons', [])
        assert len(lessons) == 7, f"Expected 7 lessons, got {len(lessons)}"
        for l in lessons:
            assert '_id' not in l, f"Lesson {l.get('id')} has _id leakage"
        print(f"✅ GET /api/lessons working (7 lessons, no _id leakage)")
        
        # GET /api/products
        response6 = requests.get(f"{BASE_URL}/products", timeout=10)
        assert response6.status_code == 200, f"GET /api/products failed: {response6.status_code}"
        products = response6.json().get('products', [])
        assert len(products) == 6, f"Expected 6 products, got {len(products)}"
        print(f"✅ GET /api/products working (6 products)")
        
        # GET /api/sitters
        response7 = requests.get(f"{BASE_URL}/sitters", timeout=10)
        assert response7.status_code == 200, f"GET /api/sitters failed: {response7.status_code}"
        sitters = response7.json().get('sitters', [])
        assert len(sitters) == 4, f"Expected 4 sitters, got {len(sitters)}"
        print(f"✅ GET /api/sitters working (4 sitters)")
        
        # GET /api/rehoming
        response8 = requests.get(f"{BASE_URL}/rehoming", timeout=10)
        assert response8.status_code == 200, f"GET /api/rehoming failed: {response8.status_code}"
        rehoming = response8.json().get('rehoming', [])
        assert len(rehoming) == 4, f"Expected 4 rehoming, got {len(rehoming)}"
        print(f"✅ GET /api/rehoming working (4 rehoming)")
        
        # Verify no _id leakage in badges and progress responses
        response9 = requests.get(f"{BASE_URL}/badges", timeout=10)
        badges = response9.json().get('badges', [])
        for b in badges:
            assert '_id' not in b, f"Badge {b.get('id')} has _id leakage"
        print(f"✅ GET /api/badges no _id leakage")
        
        response10 = requests.get(f"{BASE_URL}/progress", timeout=10)
        progress_data = response10.json()
        assert '_id' not in progress_data.get('progress', {}), "Progress has _id leakage"
        for b in progress_data.get('badges', []):
            assert '_id' not in b, f"Badge {b.get('id')} in progress response has _id leakage"
        print(f"✅ GET /api/progress no _id leakage")
        
        print("✅ Test 10 PASSED: All regression tests passed, no _id leakage anywhere")
        return True
    except Exception as e:
        print(f"❌ Test 10 FAILED: {str(e)}")
        return False

def test_final_seed_reset():
    """Test 11: Final POST /api/seed to reset and verify clean state"""
    print("\n=== Test 11: Final POST /api/seed (reset and verify) ===")
    try:
        response = requests.post(f"{BASE_URL}/seed", timeout=10)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert data.get('ok') == True, "Expected ok:true"
        assert data.get('reseeded') == True, "Expected reseeded:true"
        assert data.get('version') == 4, f"Expected version:4, got {data.get('version')}"
        
        # Verify progress is back to initial state
        response2 = requests.get(f"{BASE_URL}/progress", timeout=10)
        progress = response2.json().get('progress', {})
        print(f"Progress after reset: streak {progress.get('streak')}, points {progress.get('points')}")
        
        assert progress.get('streak') == 4, f"Expected streak 4 after reset, got {progress.get('streak')}"
        assert progress.get('points') == 340, f"Expected points 340 after reset, got {progress.get('points')}"
        assert len(progress.get('completedLessons', [])) == 3, f"Expected 3 completed lessons after reset, got {len(progress.get('completedLessons', []))}"
        
        print("✅ Test 11 PASSED: Final seed reset successful, progress back to streak 4 / points 340")
        return True
    except Exception as e:
        print(f"❌ Test 11 FAILED: {str(e)}")
        return False

def main():
    print("=" * 80)
    print("LEVEL 4 Backend API Tests - Learning + Streak + Rewards")
    print("=" * 80)
    
    results = []
    
    # Run all tests in sequence
    results.append(("Seed Reset (v4)", test_seed_reset()))
    results.append(("GET /api/badges (5 computed badges)", test_get_badges()))
    results.append(("GET /api/progress (with badges)", test_get_progress()))
    results.append(("GET /api/bootstrap (includes badges)", test_bootstrap_with_badges()))
    results.append(("POST /api/progress/complete (les-stay, first time)", test_complete_lesson_first_time()))
    results.append(("POST /api/progress/complete (idempotency)", test_complete_lesson_idempotency()))
    results.append(("POST /api/progress/complete (les-recall, same day)", test_complete_second_lesson_same_day()))
    results.append(("POST /api/progress/complete (non-existent lesson)", test_complete_nonexistent_lesson()))
    results.append(("Caring Owner badge (POST /api/contacts)", test_caring_owner_badge()))
    results.append(("Regression tests (all endpoints)", test_regression()))
    results.append(("Final seed reset", test_final_seed_reset()))
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print("=" * 80)
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 80)
    
    if passed == total:
        print("\n🎉 All tests passed! LEVEL 4 backend is working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
