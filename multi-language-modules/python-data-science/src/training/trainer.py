"""
Model Training Pipeline
Training and evaluation of ML models
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import logging

logger = logging.getLogger(__name__)


class ModelTrainer:
    """Train and evaluate ML models."""
    
    MODELS = {
        'random_forest': RandomForestClassifier,
        'gradient_boosting': GradientBoostingClassifier,
        'logistic_regression': LogisticRegression
    }
    
    def __init__(self, model_type: str = 'random_forest', **kwargs):
        if model_type not in self.MODELS:
            raise ValueError(f"Unknown model type: {model_type}")
        
        self.model = self.MODELS[model_type](**kwargs)
        self.metrics = {}
        
    def train(self, X_train: np.ndarray, y_train: np.ndarray) -> None:
        """Train the model."""
        logger.info("Training model...")
        self.model.fit(X_train, y_train)
        logger.info("Training complete!")
        
    def evaluate(
        self, 
        X_test: np.ndarray, 
        y_test: np.ndarray
    ) -> Dict[str, float]:
        """Evaluate model performance."""
        y_pred = self.model.predict(X_test)
        
        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1': f1_score(y_test, y_pred, average='weighted')
        }
        
        logger.info(f"Metrics: {self.metrics}")
        return self.metrics
    
    def cross_validate(self, X: np.ndarray, y: np.ndarray, cv: int = 5) -> np.ndarray:
        """Perform cross-validation."""
        scores = cross_val_score(self.model, X, y, cv=cv, scoring='accuracy')
        logger.info(f"CV scores: {scores}, Mean: {scores.mean():.4f}")
        return scores
    
    def hyperparameter_tune(
        self, 
        X: np.ndarray, 
        y: np.ndarray, 
        param_grid: Dict[str, Any],
        cv: int = 5
    ) -> Dict[str, Any]:
        """Hyperparameter tuning with GridSearchCV."""
        grid_search = GridSearchCV(
            self.model, param_grid, cv=cv, scoring='accuracy', n_jobs=-1
        )
        grid_search.fit(X, y)
        
        self.model = grid_search.best_estimator_
        
        return {
            'best_params': grid_search.best_params_,
            'best_score': grid_search.best_score_
        }
    
    def save(self, filepath: str) -> None:
        """Save trained model to file."""
        joblib.dump(self.model, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load(self, filepath: str) -> None:
        """Load model from file."""
        self.model = joblib.load(filepath)
        logger.info(f"Model loaded from {filepath}")
