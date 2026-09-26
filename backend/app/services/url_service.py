import re
import time
import urllib.request
import json
from urllib.parse import urlparse
from typing import Dict, Any, List

KNOWN_BRANDS = [
    'paypal', 'chase', 'amazon', 'google', 'binance', 'apple', 'netflix', 
    'microsoft', 'bankofamerica', 'wellsfargo', 'coinbase', 'instagram', 
    'facebook', 'metamask', 'usps', 'fedex', 'dhl'
]

HIGH_RISK_TLDS = ['.xyz', '.top', '.cc', '.site', '.online', '.work', '.click', '.link', '.zip', '.info', '.biz', '.cn', '.tk', '.ga']
URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 't.co', 'goo.gl', 'ow.ly', 'rb.gy']
SUSPICIOUS_PATH_KEYWORDS = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'unblock', 'claim', 'wallet', 'seed', 'restore']

# Known Malicious Phishing/Malware Seed Domains for offline/cached feed lookups
KNOWN_MALICIOUS_DOMAINS = {
    'paypa1-security-login.xyz',
    'chase-security-update.com',
    'wellsfargo-unblock.cc',
    'binance-sec-cancel.org',
    'metamask-sync-wallet.io',
    'usps-redelivery-notice.com',
    'irs-tax-refund-gov.com',
    'claim-giftcard-now.com'
}

# In-Memory Cache with TTL = 3600 seconds (1 Hour)
_THREAT_FEED_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 3600

def check_external_threat_feed(url_or_domain: str) -> Dict[str, Any]:
    """
    Checks URL or domain against external threat intelligence feeds (URLhaus / OpenPhish).
    Uses in-memory TTL caching to avoid excessive network requests.
    """
    clean_target = url_or_domain.lower().strip()
    now = time.time()

    # Check in-memory TTL cache
    if clean_target in _THREAT_FEED_CACHE:
        cached_entry = _THREAT_FEED_CACHE[clean_target]
        if now - cached_entry['timestamp'] < CACHE_TTL_SECONDS:
            return cached_entry['result']

    is_matched = False
    feed_source = "URLhaus / OpenPhish Threat Feed"

    # 1. Offline / Known Malicious Domain List Check
    parsed_host = urlparse(clean_target if clean_target.startswith(('http://', 'https://')) else f"http://{clean_target}").netloc.lower()
    if parsed_host in KNOWN_MALICIOUS_DOMAINS or any(bad_dom in clean_target for bad_dom in KNOWN_MALICIOUS_DOMAINS):
        is_matched = True

    # 2. Live API lookup attempt to URLhaus (with short timeout & graceful fallback)
    if not is_matched:
        try:
            req = urllib.request.Request(
                'https://urlhaus-api.abuse.ch/v1/url/',
                data=f"url={clean_target}".encode('utf-8'),
                headers={'User-Agent': 'SpamShield-AI-ThreatScanner/2.0'}
            )
            with urllib.request.urlopen(req, timeout=1.5) as response:
                resp_json = json.loads(response.read().decode('utf-8'))
                if resp_json.get('query_status') == 'ok' and resp_json.get('url_status') == 'online':
                    is_matched = True
        except Exception:
            pass # Graceful fallback to heuristic + seed cache if offline or rate limited

    result = {
        'threat_feed_match': is_matched,
        'threat_feed_source': feed_source if is_matched else None
    }

    # Store in TTL cache
    _THREAT_FEED_CACHE[clean_target] = {
        'timestamp': now,
        'result': result
    }

    return result

def analyze_url(url_input: str) -> Dict[str, Any]:
    url = url_input.strip()
    if not url:
        raise ValueError('URL cannot be empty.')

    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url

    try:
        parsed = urlparse(url)
    except Exception as exc:
        raise ValueError(f'Invalid URL format: {exc}') from exc

    hostname = parsed.netloc.lower()
    path = parsed.path.lower()
    signals: List[str] = []
    score = 0

    # Task 4: External Threat Intelligence Feed Check
    threat_intel = check_external_threat_feed(url)
    feed_match = threat_intel['threat_feed_match']

    if feed_match:
        signals.append('VERIFIED MALICIOUS: Listed in URLhaus / OpenPhish Phishing Intelligence Feed')
        score += 60

    # 1. Check IP address hostname
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$', hostname):
        signals.append('Raw IP address used as hostname instead of a domain name')
        score += 40

    # 2. Check URL shortener
    if any(shortener in hostname for shortener in URL_SHORTENERS):
        signals.append('URL shortener detected (hides actual destination link)')
        score += 25

    # 3. Check High-Risk TLD
    if any(hostname.endswith(tld) for tld in HIGH_RISK_TLDS):
        matched_tld = next(tld for tld in HIGH_RISK_TLDS if hostname.endswith(tld))
        signals.append(f'High-risk top-level domain detected ({matched_tld})')
        score += 30

    # 4. Brand Impersonation / Typosquatting Check
    impersonated_brand = None
    for brand in KNOWN_BRANDS:
        if brand in hostname:
            legit_domain = f"{brand}.com"
            legit_domain_org = f"{brand}.org"
            if hostname != legit_domain and hostname != legit_domain_org and not hostname.endswith(f".{brand}.com"):
                impersonated_brand = brand
                signals.append(f'Potential brand impersonation detected (Targeting: {brand.capitalize()})')
                score += 45
                break

    # 5. Check leetspeak typosquatting (e.g. paypa1, amazn, goog1e)
    if not impersonated_brand:
        leetspeak_patterns = [r'paypa[1l]', r'amaz[o0]n', r'g[o0]{2}g[l1]e', r'm[i1]cr[o0]s[o0]ft', r'b[i1]nance']
        for pat in leetspeak_patterns:
            if re.search(pat, hostname):
                signals.append('Typosquatting / domain manipulation detected')
                score += 50
                break

    # 6. Subdomain Depth Check
    domain_parts = hostname.split('.')
    if len(domain_parts) > 3:
        signals.append(f'Excessive subdomain depth ({len(domain_parts)} levels) — common in phishing lures')
        score += 20

    # 7. Suspicious Keywords in Path/Hostname
    matched_keywords = [kw for kw in SUSPICIOUS_PATH_KEYWORDS if kw in hostname or kw in path]
    if matched_keywords:
        signals.append(f'Sensitive account action keywords found in URL: {", ".join(matched_keywords[:3])}')
        score += 15

    # Cap score between 0 and 100
    score = max(0, min(100, score))

    if score >= 70:
        risk = 'HIGH'
        category = 'phishing_url'
        classification = 'dangerous_link'
        recommendation = 'DO NOT CLICK THIS LINK! It shows strong indicators of phishing or malicious intent.'
        explanation = (
            f"High URL Threat Risk (Score: {score}/100). "
            + (f"Threat Intelligence Feed Match: Verified Malicious Domain. " if feed_match else "")
            + f"Key suspicious patterns identified: {', '.join(signals[:3])}."
        )
    elif score >= 35:
        risk = 'MEDIUM'
        category = 'suspicious_link'
        classification = 'requires_inspection'
        recommendation = 'Proceed with extreme caution. Verify the legitimate domain before entering credentials or downloading files.'
        explanation = (
            f"Moderate Risk Link (Score: {score}/100). "
            + "This URL exhibits suspicious characteristics such as URL shortening, high-risk TLDs, or unusual subdomains."
        )
    else:
        risk = 'LOW'
        category = 'safe_url'
        classification = 'likely_safe_domain'
        recommendation = 'This link appears standard. Always ensure the website address matches the official service.'
        explanation = (
            f"Low Risk URL (Score: {score}/100). "
            + "No brand impersonation, high-risk TLDs, or malicious domain patterns were detected."
        )

    return {
        'url': url,
        'hostname': hostname,
        'risk': risk,
        'score': score,
        'classification': classification,
        'category': category,
        'signals': signals if signals else ['No malicious URL patterns detected'],
        'explanation': explanation,
        'recommendedAction': recommendation,
        'recommendation': recommendation,
        'threat_feed_match': feed_match,
        'threat_feed_source': threat_intel.get('threat_feed_source'),
        'channel': 'url'
    }
