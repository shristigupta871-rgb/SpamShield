# SpamShield AI — Machine Learning Model Evaluation Report

## 1. Executive Summary

This document provides a transparent, honest, and unrounded audit of the machine learning classifier model used in SpamShield AI. 

Rather than reporting artificially inflated 100% metrics on contaminated or small splits, this evaluation measures model performance on a strictly deduplicated, holdout test set with balanced class distribution.

---

## 2. Dataset Overview & Source Composition

- **Dataset Size**: 72 unique samples
- **Class Balance**: 
  - Spam / Phishing: 38 samples (52.78%)
  - Legitimate / Safe: 34 samples (47.22%)
- **Data Categories**:
  - Financial & Banking Phishing (Chase, PayPal, Wells Fargo, Bank of America)
  - Package Delivery Alerts (USPS, FedEx, DHL, Amazon, UPS)
  - Crypto / Web3 Wallet Security Lures (Binance, Metamask, Coinbase, TrustWallet)
  - Remote Work & High-Pay Job Scams (Telegram, WhatsApp lures)
  - Government & Tax Refund Scams (IRS, SSN warnings)
  - Legitimate 2FA/OTP codes, flight & delivery updates, calendar reminders, and everyday conversational texts.

---

## 3. Preprocessing & Split Methodology

1. **Deduplication**: All input messages were deduplicated prior to splitting to eliminate train/test data leakage.
2. **Train/Test Split**: 75% Training Split (54 samples) / 25% Holdout Test Split (18 samples).
3. **Stratification**: `stratify=y` was enforced to guarantee equal class balance between train and test sets.
4. **Reproducibility**: Fixed seed `random_state=42`.

---

## 4. Exact Model Evaluation Metrics

Evaluated on the 18-sample holdout test set (9 Legitimate, 9 Spam):

| Metric | Unrounded Score | Percentage |
| :--- | :--- | :--- |
| **Accuracy** | 0.8888888888888888 | 88.89% |
| **Precision (Spam)** | 0.8181818181818182 | 81.82% |
| **Recall (Spam)** | 1.0000000000000000 | 100.00% |
| **F1 Score (Spam)** | 0.9000000000000001 | 90.00% |

### Classification Report Details

```text
              precision    recall  f1-score   support

  Legitimate       1.00      0.78      0.88         9
        Spam       0.82      1.00      0.90         9

    accuracy                           0.89        18
   macro avg       0.91      0.89      0.89        18
weighted avg       0.91      0.89      0.89        18
```

---

## 5. Observations & Insights

- **High Recall (1.00)**: The model successfully catches 100% of malicious spam messages in the holdout set, preventing high-risk scams from slipping past undetected.
- **Precision (0.82)**: A slight trade-off where a small fraction of borderline legitimate notifications (e.g. notifications containing external URLs or high-urgency keywords) are conservatively classified as requiring review.
- **Hybrid System Role**: Because the ML model operates in an ensemble with heuristic rule triggers (60% ML + 40% Rules), borderline cases receive nuanced hybrid scoring rather than binary block decisions.
