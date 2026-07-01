import os
import sys
import joblib
import numpy as np

# Resolve paths
models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
model_path = os.path.join(models_dir, "model.joblib")
vectorizer_path = os.path.join(models_dir, "vectorizer.joblib")

def load_prediction_artifacts():
    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        print("Error: Serialized model artifacts not found. Please train the model first.")
        sys.exit(1)
        
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    return model, vectorizer

def predict_symptom(symptoms, model, vectorizer):
    # Vectorize input
    X_vec = vectorizer.transform([symptoms])
    
    # Predict label
    predicted_dept = model.predict(X_vec)[0]
    
    # Compute confidence score
    if hasattr(model, "predict_proba"):
        # Logistic Regression or Naive Bayes
        probs = model.predict_proba(X_vec)[0]
        classes = list(model.classes_)
        dept_index = classes.index(predicted_dept)
        confidence = float(probs[dept_index])
    elif hasattr(model, "decision_function"):
        # Linear SVM
        decision = model.decision_function(X_vec)[0]
        # Apply softmax to get probability mapping
        exp_decision = np.exp(decision - np.max(decision)) # subtract max for numerical stability
        probs = exp_decision / np.sum(exp_decision)
        classes = list(model.classes_)
        dept_index = classes.index(predicted_dept)
        confidence = float(probs[dept_index])
    else:
        confidence = 1.0
        
    return predicted_dept, confidence

def main():
    if len(sys.argv) < 2:
        print("Usage: python predict.py \"your symptom description here\"")
        sys.exit(1)
        
    symptoms = sys.argv[1]
    model, vectorizer = load_prediction_artifacts()
    
    dept, confidence = predict_symptom(symptoms, model, vectorizer)
    print(f"\nSymptom Input: \"{symptoms}\"")
    print(f"Predicted Department: {dept}")
    print(f"Confidence: {confidence:.2%}")

if __name__ == "__main__":
    main()
