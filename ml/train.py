import os
import json
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

# Expanded benchmark dataset covering diverse Spam/Phishing and Legitimate messages
SPAM_MESSAGES = [
    # Urgent Financial & Bank Scams
    "URGENT: Your bank account has been temporarily locked due to suspicious activity. Click http://bit.ly/verify-bank immediately to restore access.",
    "ALERT: Unusual login attempt detected on your Chase account. Verify your identity right now at https://chase-security-update.com",
    "Final Warning: Your PayPal account will be closed in 24 hours. Login here to update your security questions: http://paypal-update-info.net",
    "Wells Fargo Security Alert: Card blocked. Unblock now by providing your SSN and card pin at http://wellsfargo-unblock.cc",
    "Bank of America notice: Your online access is restricted. Click http://boa-support-login.com to confirm your details.",
    "Your debit card was used for $499.99 at Walmart. If this was not you, call 1-800-555-0199 or verify at http://fraud-verify-card.org",
    "Capital One alert: Suspicious purchase of $892 at Best Buy. Click http://capone-fraud-alert.site to confirm transaction.",
    "Citi Security: Unauthorized attempt to transfer $1,200 to unknown account. Cancel transfer at http://citi-cancel-transfer.net",
    
    # Courier & Package Delivery Scams
    "USPS: Package delivery failure due to incorrect address. Update your shipping address at http://usps-redelivery-notice.com within 12 hours.",
    "FedEx Alert: Parcel #928172 couldn't be delivered. A redelivery fee of $1.50 is required. Pay now: http://fedex-tracking-pay.com",
    "DHL express notification: Your shipment is on hold at customs. Pay duty fee at http://dhl-customs-fee.com to avoid return.",
    "Amazon Logistics: Driver couldn't access your building. Reschedule delivery at http://amzn-delivery-slot.info",
    "UPS Exception: Package delivery delayed due to unpaid customs tax. Pay fee at http://ups-customs-pay.org",
    
    # Lottery, Prize & Gift Card Scams
    "CONGRATULATIONS! You have won a $1000 Walmart Gift Card! Claim your free reward today: http://claim-giftcard-now.com",
    "You are the lucky winner of our $50,000 international sweepstakes! Reply WINNER to claim your cash payout.",
    "Claim your free iPhone 15 Pro Max now! Only 3 left in stock. Click http://apple-prize-giveaway.site to confirm address.",
    "You've been selected for a free $500 Amazon voucher! Complete quick survey at http://reward-survey-win.xyz",
    "Winner Alert: Your cell phone number was chosen in our annual raffle! Receive $5,000 cash at http://raffle-cash-payout.site",
    
    # Crypto & Wallet Scams
    "Binance Warning: Unauthorized withdrawal request of 0.85 BTC detected. Cancel withdrawal immediately at http://binance-sec-cancel.org",
    "Metamask Alert: Your Web3 wallet requires mandatory security migration. Connect your wallet at http://metamask-sync-wallet.io",
    "TrustWallet Notice: Wallet seed phrase backup required to avoid fund lock. Update at http://trustwallet-restore.net",
    "Coinbase: $2,500 transferred to unknown wallet. If unauthorized, visit http://coinbase-help-refund.com right now.",
    "Kraken Alert: Deposit of 3.5 ETH pending verification. Complete KYC at http://kraken-kyc-auth.net",
    
    # Job Offer & Remote Work Scams
    "Exciting Job Opportunity! Earn $300-$800 daily working 1-2 hours from home. No experience needed! Contact via WhatsApp: +18005550123",
    "Google hiring part-time remote review agents! High hourly pay $45/hr. Apply on Telegram @GoogleRecruiter2026",
    "Immediate opening for Data Entry Specialist! Weekly pay $1500. Send resume and bank info to hr@workfromhome-careers.net",
    "Amazon Remote Task Agent position approved! Earn cash daily. Click http://amzn-task-jobs.com to start training.",
    "Part-time typing job: Earn $50/hour working from home. No interview required. Join Telegram channel t.me/typing_jobs_2026",

    # Tax & Government Fine Scams
    "IRS Urgent Notice: Tax refund of $1,420 is pending. Submit tax verification form at http://irs-tax-refund-gov.com",
    "State Tax Department: Overdue tax payment penalty of $450 assessed. Pay online today at http://tax-penalty-pay.net to avoid warrant.",
    "Social Security Administration: Your SSN has been flagged for fraudulent activity. Call 1-888-555-0912 immediately.",
    
    # Tech Support & Malware Scams
    "Microsoft Security Notification: Computer infected with Trojan virus. Call Windows Support at 1-800-555-0188 immediately.",
    "Geek Squad Renewal: Your annual subscription of $399.99 will auto-renew today. To cancel call 1-888-555-0144.",
    "McAfee Antivirus: Your protection expired today. 5 viruses detected. Renew now for $19.99: http://mcafee-renew-clean.com",
    "AppleCare Warning: Your iCloud storage has been breached. Lock your account at http://applecare-icloud-lock.com",
    
    # Romance & Telegram / WhatsApp Phishing
    "Hey darling, I saw your profile and loved it! Add me on WhatsApp +14155550199 for hot chat and photos.",
    "Hi mom, I lost my phone and this is my new temporary number. Please send $300 via Zelle right now, it's urgent!",
    "Hi friend! I found this picture of you on Instagram, is this really you? http://insta-pic-look.xyz",
]

LEGITIMATE_MESSAGES = [
    # OTP & Two-Factor Authentication
    "Your Google verification code is 849201. Do not share this code with anyone.",
    "Your Uber verification code is 1928. Enter this to complete sign in.",
    "Use 492018 as your login code for GitHub. Valid for 10 minutes.",
    "Your Bank of America passcode is 773019. Never share your passcode over the phone.",
    "Your Amazon security code is 382910.",
    "Your Chase verification code is 491029. It will expire in 5 minutes.",
    "Twilio code: 918234. Use this to verify your mobile number.",

    # Service Updates & Notifications
    "Your order #402-19284-9182 has shipped via UPS. Estimated delivery: Tomorrow by 5 PM.",
    "Your flight AA104 to New York JFK is scheduled for departure at 08:30 AM from Gate B12.",
    "Reminder: Your dentist appointment with Dr. Smith is tomorrow at 2:00 PM. Reply C to confirm.",
    "Your monthly electric bill of $78.40 is now available. View your account statement at energyportal.com",
    "Your table reservation at Bistro Bella is confirmed for tonight at 7:30 PM for 2 guests.",
    "Your prescription #91823 is ready for pickup at Walgreens CVS pharmacy.",
    "Verizon payment received: $65.00 thank you for your payment.",

    # Conversational & Personal Messages
    "Hey! Are we still meeting for lunch at 12:30 today?",
    "Can you pick up milk and bread on your way home?",
    "Happy Birthday Sarah! Hope you have a wonderful day celebrating!",
    "Thanks for sending over the project draft. I'll review it this afternoon and get back to you.",
    "What time does the movie start tonight?",
    "Hey dad, I arrived safely at the station. Heading home now.",
    "Do you want to play tennis this Saturday morning around 9 AM?",
    "Let me know when you get home so I know you made it safely.",

    # Work & Professional Communications
    "Hi team, please find attached the Q3 financial presentation slides for tomorrow's review.",
    "The sprint planning meeting has been rescheduled to Thursday at 10 AM.",
    "Hi Alex, thanks for your job application. We would love to invite you for a 30-min interview next week.",
    "Here is the updated documentation for the API routes. Let me know if you have any questions.",
    "Please submit your timesheet before Friday 5 PM.",
    "The pull request #142 has been approved and merged into main branch.",

    # Standard E-Commerce & Subscriptions
    "Your Spotify Premium receipt for $10.99. Payment method ending in 4821.",
    "Netflix: New movie added to your watchlist! Watch The Irishman now.",
    "Your prescription at CVS Pharmacy #4091 is ready for pickup.",
    "DoorDash: Your order from Taco Bell is being prepared by the restaurant.",
    "Lyft driver David is arriving in a Silver Toyota Camry (License 7XYZ89).",
    "Apple receipt: Your purchase of $0.99 for 50GB iCloud storage was successful."
]


def train_model():
    # 1. Deduplicate inputs to avoid train/test contamination
    clean_spam = list(dict.fromkeys([msg.strip() for msg in SPAM_MESSAGES]))
    clean_legit = list(dict.fromkeys([msg.strip() for msg in LEGITIMATE_MESSAGES]))

    X = clean_spam + clean_legit
    y = [1] * len(clean_spam) + [0] * len(clean_legit)

    print(f"Total Unique Samples: {len(X)} (Spam: {len(clean_spam)}, Legitimate: {len(clean_legit)})")

    # 2. Stratified train/test split with fixed random_state for 100% reproducible honesty
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # 3. Define TF-IDF + Logistic Regression Pipeline
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer(
            ngram_range=(1, 2),
            lowercase=True,
            sublinear_tf=True,
            max_features=5000,
            token_pattern=r'(?u)\b\w+\b|https?://\S+'
        )),
        ('classifier', LogisticRegression(C=2.0, max_iter=1000, random_state=42))
    ])

    # 4. Train pipeline on training split only
    pipeline.fit(X_train, y_train)

    # 5. Evaluate on true holdout test set ONLY
    y_pred = pipeline.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
    precision = float(precision)
    recall = float(recall)
    f1 = float(f1)

    print(f"\nModel Evaluation Metrics (True Holdout Test Set):")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}\n")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Spam']))

    # 6. Save model artifacts
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, 'spam_pipeline.pkl')
    vectorizer_path = os.path.join(model_dir, 'vectorizer.pkl')
    classifier_path = os.path.join(model_dir, 'model.pkl')

    joblib.dump(pipeline, model_path)
    joblib.dump(pipeline.named_steps['vectorizer'], vectorizer_path)
    joblib.dump(pipeline.named_steps['classifier'], classifier_path)

    # Store exact unrounded metrics
    metrics = {
        'accuracy': acc,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'total_samples': len(X),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'test_spam_count': int(sum(y_test)),
        'test_legit_count': int(len(y_test) - sum(y_test)),
        'split_method': 'Stratified 75/25 train/test split after deduplication',
        'random_state': 42
    }

    metrics_path = os.path.join(model_dir, 'evaluation_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"Model pipeline saved to {model_path}")
    print(f"Exact unrounded metrics written to {metrics_path}")

if __name__ == '__main__':
    train_model()
