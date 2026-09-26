import re
from typing import Dict, Any, List
from app.services.analysis_service import analyze_message
from app.services.url_service import analyze_url

KNOWN_ORGANIZATIONS = {
    'paypal': 'paypal.com',
    'chase': 'chase.com',
    'amazon': 'amazon.com',
    'google': 'google.com',
    'apple': 'apple.com',
    'netflix': 'netflix.com',
    'binance': 'binance.com',
    'microsoft': 'microsoft.com',
    'bank of america': 'bankofamerica.com',
    'wells fargo': 'wellsfargo.com',
    'usps': 'usps.com',
    'fedex': 'fedex.com'
}

def analyze_email(sender: str, subject: str, body: str) -> Dict[str, Any]:
    sender_clean = sender.strip()
    subject_clean = subject.strip()
    body_clean = body.strip()

    if not body_clean and not subject_clean:
        raise ValueError('Email subject or body cannot be empty.')

    signals: List[str] = []
    score = 0

    # 1. Parse Sender Email Address & Domain
    sender_domain = ""
    email_match = re.search(r'[\w\.-]+@([\w\.-]+\.\w+)', sender_clean)
    if email_match:
        sender_domain = email_match.group(1).lower()

    # 2. Sender Spoofing & Mismatch Check
    combined_header_text = (subject_clean + " " + body_clean).lower()
    for org_name, legit_domain in KNOWN_ORGANIZATIONS.items():
        if org_name in combined_header_text:
            if sender_domain and legit_domain not in sender_domain:
                signals.append(f'Sender domain mismatch! Email claims to be from {org_name.capitalize()} but comes from domain @{sender_domain}')
                score += 45
                break

    # 3. Suspicious Subject Line Check
    if re.search(r'urgent|action required|suspended|locked|verify|invoice|security alert|final notice|payment received', subject_clean, re.IGNORECASE):
        signals.append('Suspicious or urgent action-demanding subject line')
        score += 20

    # 4. Body Content Threat Analysis (ML + Heuristics)
    body_analysis = analyze_message(body_clean if body_clean else subject_clean)
    score += int(0.40 * body_analysis.get('score', 0))

    if body_analysis.get('mlDetails'):
        ml_prob = body_analysis['mlDetails']['ml_probability']
        if ml_prob > 50:
            signals.append(f"ML Email Classifier detected spam/phishing pattern ({ml_prob}% probability)")

    # 5. Extract & Analyze URLs in Email Body
    urls_found = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', body_clean)
    url_results = []
    for u in urls_found[:3]: # Analyze up to 3 links
        try:
            u_res = analyze_url(u)
            url_results.append(u_res)
            if u_res['risk'] == 'HIGH':
                signals.append(f"High-risk phishing link detected in email body ({u_res['hostname']})")
                score += 35
            elif u_res['risk'] == 'MEDIUM':
                signals.append(f"Suspicious link found in email body ({u_res['hostname']})")
                score += 15
        except Exception:
            pass

    # Cap score
    score = max(0, min(100, score))

    if score >= 70:
        risk = 'HIGH'
        category = 'phishing_email'
        classification = 'high_risk_phishing'
        recommendation = 'DO NOT REPLY or click any links in this email. Mark as Phishing/Spam in your email client and delete it.'
        explanation = (
            f"High Email Threat Risk (Score: {score}/100). "
            + f"Key warning signals include: {', '.join(signals[:3])}."
        )
    elif score >= 35:
        risk = 'MEDIUM'
        category = 'suspicious_email'
        classification = 'requires_verification'
        recommendation = 'Inspect the sender email address closely and verify with the organization directly through official channels.'
        explanation = (
            f"Moderate Email Risk (Score: {score}/100). "
            + "This email contains urgent request patterns or unverified sender domains."
        )
    else:
        risk = 'LOW'
        category = 'safe_email'
        classification = 'likely_legitimate_email'
        recommendation = 'This email looks legitimate. Standard email safety practices apply.'
        explanation = (
            f"Low Email Risk (Score: {score}/100). "
            + "Sender domain and email body text show no major phishing signatures."
        )

    return {
        'sender': sender_clean,
        'subject': subject_clean,
        'risk': risk,
        'score': score,
        'classification': classification,
        'category': category,
        'signals': signals if signals else ['No email threat signatures detected'],
        'explanation': explanation,
        'recommendedAction': recommendation,
        'recommendation': recommendation,
        'urlsAnalyzed': len(url_results),
        'mlDetails': body_analysis.get('mlDetails'),
        'channel': 'email'
    }
