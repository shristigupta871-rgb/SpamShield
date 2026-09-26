import os
import joblib
import numpy as np
from typing import Tuple, Dict, Any, Optional

# Global cache for loaded model pipeline
_PIPELINE = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'models', 'spam_pipeline.pkl')

def load_ml_model():
    """Loads the trained TF-IDF + LogisticRegression pipeline if available."""
    global _PIPELINE
    if _PIPELINE is not None:
        return _PIPELINE

    abs_path = os.path.abspath(_MODEL_PATH)
    if os.path.exists(abs_path):
        try:
            _PIPELINE = joblib.load(abs_path)
            print(f"[ML Service] Successfully loaded ML pipeline from {abs_path}")
            return _PIPELINE
        except Exception as exc:
            print(f"[ML Service] Error loading ML pipeline from {abs_path}: {exc}")
            return None
    else:
        print(f"[ML Service] Model artifact not found at {abs_path}. Fallback to rule engine.")
        return None

def predict_spam_ml(message: str) -> Optional[Dict[str, Any]]:
    """
    Predicts spam probability and confidence using the ML model pipeline.
    Returns None if model is unavailable.
    """
    pipeline = load_ml_model()
    if pipeline is None:
        return None

    try:
        # Get spam probability (class 1)
        proba = pipeline.predict_proba([message])[0]
        spam_probability = float(proba[1]) # probability of spam class
        pred_class = int(np.argmax(proba))
        
        # Calculate model confidence (margin between highest and second highest probability)
        confidence = float(np.max(proba))

        return {
            'ml_probability': round(spam_probability * 100, 2),
            'ml_class': 'spam' if pred_class == 1 else 'ham',
            'ml_confidence': round(confidence * 100, 2),
            'model_used': 'TF-IDF + Logistic Regression'
        }
    except Exception as exc:
        print(f"[ML Service] Prediction failed: {exc}")
        return None
