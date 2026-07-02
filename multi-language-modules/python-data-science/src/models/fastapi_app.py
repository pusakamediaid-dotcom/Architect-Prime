"""
FastAPI Model Serving
REST API for ML model predictions
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import joblib
import numpy as np

app = FastAPI(title="ML Model API", version="1.0.0")

# Load model at startup
try:
    model = joblib.load('models/trained_model.pkl')
    label_encoder = joblib.load('models/label_encoder.pkl')
except FileNotFoundError:
    model = None
    label_encoder = None


class PredictionRequest(BaseModel):
    features: List[float] = Field(..., min_length=1)
    threshold: Optional[float] = 0.5


class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    confidence: str


@app.on_event("startup")
async def startup_event():
    if model is None:
        print("Warning: Model not loaded!")


@app.get("/")
async def root():
    return {"message": "ML Model API", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0].max()
        
        confidence = "high" if probability > 0.8 else "medium" if probability > 0.5 else "low"
        
        return PredictionResponse(
            prediction=str(prediction),
            probability=float(probability),
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/batch-predict")
async def batch_predict(features_list: List[List[float]]):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    predictions = []
    for features in features_list:
        features_array = np.array(features).reshape(1, -1)
        pred = model.predict(features_array)[0]
        prob = model.predict_proba(features_array)[0].max()
        predictions.append({"prediction": str(pred), "probability": float(prob)})
    
    return {"predictions": predictions}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
