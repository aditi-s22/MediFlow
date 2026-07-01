import os
import sys
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Resolve paths to model artifacts
models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
model_path = os.path.join(models_dir, "model.joblib")
vectorizer_path = os.path.join(models_dir, "vectorizer.joblib")

# Initialize FastAPI App
app = FastAPI(title="MediFlow AI Doctor Recommendation Service", version="1.0.0")

# Enable CORS so the Express gateway can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model and vectorizer references
model = None
vectorizer = None

@app.on_event("startup")
def startup_event():
    global model, vectorizer
    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        print("Error: Serialized model artifacts not found. Please train the model first.", file=sys.stderr)
        # We don't crash the server here to satisfy the requirement that other pages must not break
        # if the ML service is down/unconfigured, but we warn heavily.
        return
        
    try:
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        print("Model and vectorizer loaded successfully at startup.")
    except Exception as e:
        print(f"Error loading model artifacts: {e}", file=sys.stderr)

class SymptomRequest(BaseModel):
    symptoms: str

class PredictionResponse(BaseModel):
    department: str
    confidence: float

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict(payload: SymptomRequest):
    global model, vectorizer
    if model is None or vectorizer is None:
        raise HTTPException(
            status_code=503, 
            detail="ML recommendation model is not loaded or configured on the server."
        )
        
    symptoms_text = payload.symptoms.strip()
    if not symptoms_text:
        raise HTTPException(status_code=400, detail="Symptoms text cannot be empty.")
        
    try:
        # Transform input symptoms
        X_vec = vectorizer.transform([symptoms_text])
        
        # Predict medical department
        predicted_dept = model.predict(X_vec)[0]
        
        # Calculate confidence probability
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_vec)[0]
            classes = list(model.classes_)
            dept_index = classes.index(predicted_dept)
            confidence = float(probs[dept_index])
        elif hasattr(model, "decision_function"):
            decision = model.decision_function(X_vec)[0]
            # Softmax calculation for SVM decision values
            exp_decision = np.exp(decision - np.max(decision))
            probs = exp_decision / np.sum(exp_decision)
            classes = list(model.classes_)
            dept_index = classes.index(predicted_dept)
            confidence = float(probs[dept_index])
        else:
            confidence = 1.0
            
        return PredictionResponse(department=predicted_dept, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
