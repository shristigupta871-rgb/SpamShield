import re
from typing import List, Dict, Any
from app.services.ml_service import predict_spam_ml


def analyze_message(message: str) -> Dict[str, Any]:
    text = message.strip()
    if not text:
        raise ValueError('Message cannot be empty.')

    normalized = text.lower()
    signals: List[str] = []

    # Heuristic Rule Checks
    is_urgent = bool(re.search(r'urgent|immediately|today|asap|act now|limited time|final warning|within \d+ hours', normalized))
    is_link = bool(re.search(r'https?://|\.com|\.net|\.org|\.cc|\.xyz|\.site|click here|tap link|visit', normalized))
    is_financial = bool(re.search(r'pay|payment|wallet|bank|verify|account|update now|send money|bitcoin|btc|zelle|ssn|card pin|refund', normalized))
    is_prize = bool(re.search(r'winner|congratulations|free prize|claim now|lottery|cash reward|voucher|gift card', normalized))
    is_delivery = bool(re.search(r'usps|fedex|dhl|package|shipment|delivery failure|customs|parcel', normalized))
    is_job = bool(re.search(r'job opportunity|work from home|hourly pay|earn \$\d+|telegram @|whatsapp \+', normalized))

    if is_urgent:
        signals.append('Urgent or time-pressured language')
    if is_link:
        signals.append('External link or suspicious website reference')
    if is_financial:
        signals.append('Requests for payment, account verification, or financial data')
    if is_prize:
        signals.append('Prize or reward scam language')
    if is_delivery:
        signals.append('Package delivery alert pattern')
    if is_job:
        signals.append('Unsolicited high-paying job offer pattern')

    # Heuristic baseline score (0 - 100)
    rule_score = min(100, len(signals) * 25 + (15 if len(normalized) > 300 else 0))

    # Level 3 ML Model Prediction
    ml_result = predict_spam_ml(text)

    if ml_result is not None:
        ml_prob = ml_result['ml_probability']
        ml_confidence = ml_result['ml_confidence']
        
        # Hybrid Scoring: 60% ML Probability + 40% Heuristic Rule Score
        score = int(round(0.60 * ml_prob + 0.40 * rule_score))
        score = max(0, min(100, score))

        if ml_result['ml_class'] == 'spam':
            signals.append(f"Machine learning classifier flagged message as spam ({ml_prob}% spam probability)")
    else:
        score = rule_score

    # Determine Specific Category (Level 4 Scam Intelligence)
    if is_prize:
        category = 'prize_scam'
    elif is_crypto := bool(re.search(r'bitcoin|btc|crypto|wallet|metamask|binance|trustwallet', normalized)):
        category = 'crypto_scam'
    elif is_delivery:
        category = 'delivery_scam'
    elif is_job:
        category = 'job_scam'
    elif is_financial or is_link:
        category = 'phishing'
    elif score >= 40:
        category = 'suspicious'
    else:
        category = 'safe'

    # Determine Overall Risk Level & Recommendations
    if score >= 70:
        risk = 'HIGH'
        classification = 'likely_scam'
        recommendation = 'Do not click any links or share personal information. Report the message and block the sender.'
        explanation = (
            f"High scam risk detected (Score: {score}/100). "
            + ("ML model predicts a high probability of phishing/spam. " if ml_result else "Rule-based analysis identified critical threat vectors. ")
            + f"Key indicators include: {', '.join(signals[:3])}."
        )
    elif score >= 40:
        risk = 'MEDIUM'
        classification = 'requires_review'
        recommendation = 'Verify the sender independently before acting. Avoid clicking links until you confirm legitimacy.'
        explanation = (
            f"Moderate risk level (Score: {score}/100). "
            + "The message exhibits suspicious language patterns or external link references that warrant caution."
        )
    else:
        risk = 'LOW'
        classification = 'likely_legitimate'
        recommendation = 'This message looks relatively safe. You can proceed with caution.'
        explanation = (
            f"Low risk level (Score: {score}/100). "
            + ("ML classifier and heuristic rules found no major threat indicators." if ml_result else "Rule-based analysis found no suspicious threat patterns.")
        )

    payload = {
        'risk': risk,
        'score': score,
        'classification': classification,
        'category': category,
        'signals': signals if signals else ['No obvious scam signals detected'],
        'explanation': explanation,
        'recommendedAction': recommendation,
        'recommendation': recommendation,
        'mlDetails': ml_result
    }

    return payload
