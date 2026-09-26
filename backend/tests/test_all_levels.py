import sys, os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)
API_KEY_HEADER = {'X-API-Key': 'spamshield_secret_key_2026'}

def run_tests():
    print("==================================================")
    print(" Running SpamShield AI Level 1 - Level 7 Test Suite")
    print("==================================================")

    # 1. Level 2 Health Check
    res = client.get('/health')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print(" [PASSED] Level 2: Health Check API (HTTP 200)")

    # 2. Level 3 ML Analysis
    payload = {'message': 'URGENT: Your account has been suspended. Click http://bit.ly/verify to unlock.'}
    res = client.post('/api/analyze/message', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 'mlDetails' in data
    assert data['mlDetails']['ml_class'] == 'spam'
    print(f" [PASSED] Level 3: ML Model Prediction ({data['mlDetails']['ml_probability']}% Spam Probability)")

    # 3. Level 4 Explainability & Category
    payload = {'message': 'CONGRATULATIONS! You won a $1000 Amazon Gift Card! Claim now at http://win-prize.xyz'}
    res = client.post('/api/analyze/message', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert 'explanation' in data
    assert data['category'] in ['prize_scam', 'phishing']
    print(f" [PASSED] Level 4: Scam Intelligence & Category ({data['category'].upper()})")

    # 4. Level 5 URL Inspection
    res = client.post('/api/analyze/url', json={'url': 'http://paypa1-security-login.xyz/verify'})
    assert res.status_code == 200
    data = res.json()
    assert data['risk'] == 'HIGH'
    assert 'paypa1' in data['hostname']
    print(" [PASSED] Level 5: URL Inspection (Typosquatting + High-Risk TLD Detection)")

    # 5. Level 5 Email Inspection
    payload = {
        'sender': 'security@chase-secure-update.com',
        'subject': 'URGENT: Chase Account Locked',
        'body': 'Click http://chase-login.com to verify your debit card pin.'
    }
    res = client.post('/api/analyze/email', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data['risk'] == 'HIGH'
    print(" [PASSED] Level 5: Email Inspection (Sender Domain Mismatch + Header Spoofing)")

    # 6. Level 6 SQLite Database Scan History & Task 2 Auth Check
    # Unauthenticated GET /api/scans should return 401
    unauth_res = client.get('/api/scans')
    assert unauth_res.status_code == 401, f"Expected 401 for unauthenticated scan history, got {unauth_res.status_code}"

    # Authenticated GET /api/scans
    res = client.post('/api/analyze/message', json={'message': 'Level 6 DB test scan message'})
    assert res.status_code == 200
    scan_id = res.json().get('scan_id')
    assert scan_id is not None

    history_res = client.get('/api/scans', headers=API_KEY_HEADER)
    assert history_res.status_code == 200
    scans = history_res.json()
    assert len(scans) > 0
    print(f" [PASSED] Level 6 & Task 2: Auth-Protected SQLite History (Saved Scan ID #{scan_id}, Total History: {len(scans)})")

    # 7. Level 7 Production Rate Limiting
    statuses = [client.get('/health').status_code for _ in range(120)]
    assert 429 in statuses, "Rate limiter did not trigger HTTP 429"
    print(" [PASSED] Level 7: Production Rate Limiter Middleware (HTTP 429 Triggered)")

    print("\n[SUCCESS] ALL TESTS PASSED! PROJECT FULLY COMPLETED TO LEVEL 7 & TASK 2!")

if __name__ == '__main__':
    run_tests()
