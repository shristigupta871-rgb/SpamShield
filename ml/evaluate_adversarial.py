import os
import json
import joblib
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

def evaluate_adversarial_set():
    # 1. Load trained ML pipeline
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'spam_pipeline.pkl')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at {model_path}. Run ml/train.py first.")

    pipeline = joblib.load(model_path)

    # 2. Load adversarial test set
    adv_path = os.path.join(os.path.dirname(__file__), 'adversarial_test_set.json')
    with open(adv_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    X_adv = [item['message'] for item in data]
    y_true = [item['label'] for item in data]

    # 3. Predict using trained pipeline
    y_pred = pipeline.predict(X_adv)

    # 4. Compute Metrics
    acc = float(accuracy_score(y_true, y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary')
    precision = float(precision)
    recall = float(recall)
    f1 = float(f1)

    print("==================================================")
    print(" SpamShield AI — Adversarial Evaluation Report")
    print("==================================================")
    print(f"Total Adversarial Samples: {len(data)}")
    print(f"Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"F1 Score:  {f1:.4f} ({f1*100:.2f}%)\n")
    print(classification_report(y_true, y_pred, target_names=['Legitimate', 'Spam']))

    # Save adversarial evaluation results
    report = {
        'adversarial_samples': len(data),
        'accuracy': acc,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'predictions': [
            {
                'id': item['id'],
                'message': item['message'],
                'true_label': item['label'],
                'pred_label': int(pred),
                'status': 'PASS' if item['label'] == pred else 'FAIL'
            }
            for item, pred in zip(data, y_pred)
        ]
    }

    out_path = os.path.join(os.path.dirname(__file__), 'models', 'adversarial_evaluation_results.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"Adversarial evaluation report saved to {out_path}")
    return report

if __name__ == '__main__':
    evaluate_adversarial_set()
