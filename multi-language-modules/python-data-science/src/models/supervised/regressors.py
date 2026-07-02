import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, AdaBoostRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import json
from datetime import datetime

class ModelRegistry:
    MODELS = {
        'linear_regression': LinearRegression,
        'ridge': Ridge,
        'lasso': Lasso,
        'elastic_net': ElasticNet,
        'random_forest': RandomForestRegressor,
        'gradient_boosting': GradientBoostingRegressor,
        'adaboost': AdaBoostRegressor,
        'decision_tree': DecisionTreeRegressor,
        'svr': SVR,
        'knn': KNeighborsRegressor
    }

    @classmethod
    def get_model(cls, model_name: str, **kwargs):
        model_class = cls.MODELS.get(model_name)
        if not model_class:
            raise ValueError(f"Unknown model: {model_name}")
        return model_class(**kwargs)

class RegressorTrainer:
    def __init__(self, model_name: str, hyperparams: Optional[Dict] = None):
        self.model_name = model_name
        self.hyperparams = hyperparams or {}
        self.model = ModelRegistry.get_model(model_name, **self.hyperparams)
        self.training_history = []
        self.metrics = {}
        self.is_fitted = False

    def train(self, X_train: np.ndarray, y_train: np.ndarray, 
              X_val: Optional[np.ndarray] = None, y_val: Optional[np.ndarray] = None):
        
        if X_val is not None and y_val is not None:
            self._train_with_validation(X_train, y_train, X_val, y_val)
        else:
            self.model.fit(X_train, y_train)
            train_metrics = self._compute_metrics(X_train, y_train)
            self.training_history.append({
                'epoch': 1,
                'train_metrics': train_metrics,
                'timestamp': datetime.now().isoformat()
            })

        self.is_fitted = True
        return self

    def _train_with_validation(self, X_train, y_train, X_val, y_val):
        if self.model_name in ['random_forest', 'gradient_boosting', 'adaboost']:
            self.model.fit(X_train, y_train)
            train_metrics = self._compute_metrics(X_train, y_train)
            val_metrics = self._compute_metrics(X_val, y_val)
            self.training_history.append({
                'epoch': 1,
                'train_metrics': train_metrics,
                'val_metrics': val_metrics,
                'timestamp': datetime.now().isoformat()
            })
            self.metrics = val_metrics
        else:
            self.model.fit(X_train, y_train)
            train_metrics = self._compute_metrics(X_train, y_train)
            self.training_history.append({
                'epoch': 1,
                'train_metrics': train_metrics,
                'timestamp': datetime.now().isoformat()
            })
            self.metrics = train_metrics

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict(X)

    def _compute_metrics(self, X: np.ndarray, y_true: np.ndarray) -> Dict[str, float]:
        y_pred = self.model.predict(X)
        return {
            'mse': float(mean_squared_error(y_true, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
            'mae': float(mean_absolute_error(y_true, y_pred)),
            'r2': float(r2_score(y_true, y_pred))
        }

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        if not self.is_fitted:
            raise ValueError("Model must be trained first")
        
        metrics = self._compute_metrics(X_test, y_test)
        self.metrics = metrics
        return metrics

    def save(self, path: str):
        if not self.is_fitted:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model_name': self.model_name,
            'hyperparams': self.hyperparams,
            'training_history': self.training_history,
            'metrics': self.metrics,
            'is_fitted': self.is_fitted
        }

        with open(f"{path}.json", 'w') as f:
            json.dump(model_data, f, indent=2)

        joblib.dump(self.model, f"{path}.pkl")

    @staticmethod
    def load(path: str) -> 'RegressorTrainer':
        with open(f"{path}.json", 'r') as f:
            model_data = json.load(f)

        trainer = RegressorTrainer(model_data['model_name'], model_data['hyperparams'])
        trainer.model = joblib.load(f"{path}.pkl")
        trainer.training_history = model_data['training_history']
        trainer.metrics = model_data['metrics']
        trainer.is_fitted = model_data['is_fitted']

        return trainer

class CrossValidator:
    def __init__(self, n_splits: int = 5, shuffle: bool = True, random_state: int = 42):
        self.n_splits = n_splits
        self.shuffle = shuffle
        self.random_state = random_state

    def cross_validate(self, X: np.ndarray, y: np.ndarray, trainer: RegressorTrainer) -> Dict:
        from sklearn.model_selection import KFold
        
        kfold = KFold(n_splits=self.n_splits, shuffle=self.shuffle, random_state=self.random_state)
        
        fold_results = []
        for fold, (train_idx, val_idx) in enumerate(kfold.split(X)):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]

            fold_trainer = RegressorTrainer(trainer.model_name, trainer.hyperparams)
            fold_trainer.train(X_train, y_train, X_val, y_val)
            
            fold_results.append(fold_trainer.metrics)

        return self._aggregate_results(fold_results)

    def _aggregate_results(self, fold_results: List[Dict]) -> Dict:
        aggregated = {}
        for key in fold_results[0].keys():
            values = [fold[key] for fold in fold_results]
            aggregated[f'{key}_mean'] = float(np.mean(values))
            aggregated[f'{key}_std'] = float(np.std(values))
            aggregated[f'{key}_min'] = float(np.min(values))
            aggregated[f'{key}_max'] = float(np.max(values))
        return aggregated

class HyperparameterTuner:
    def __init__(self, param_grid: Dict, scoring: str = 'r2'):
        self.param_grid = param_grid
        self.scoring = scoring
        self.best_params = None
        self.best_score = None
        self.results = []

    def grid_search(self, X_train: np.ndarray, y_train: np.ndarray, 
                    model_name: str, cv: int = 3) -> Dict:
        from sklearn.model_selection import GridSearchCV
        
        model = ModelRegistry.get_model(model_name)
        
        grid_search = GridSearchCV(
            model, self.param_grid, cv=cv, scoring=self.scoring, n_jobs=-1, verbose=1
        )
        grid_search.fit(X_train, y_train)
        
        self.best_params = grid_search.best_params_
        self.best_score = grid_search.best_score_
        
        return {
            'best_params': self.best_params,
            'best_score': float(self.best_score),
            'cv_results': grid_search.cv_results_
        }

class ModelSelector:
    @staticmethod
    def compare_models(X_train: np.ndarray, y_train: np.ndarray,
                       X_val: np.ndarray, y_val: np.ndarray,
                       model_names: List[str]) -> pd.DataFrame:
        results = []

        for model_name in model_names:
            trainer = RegressorTrainer(model_name)
            trainer.train(X_train, y_train)
            
            metrics = trainer.evaluate(X_val, y_val)
            metrics['model'] = model_name
            results.append(metrics)

        df = pd.DataFrame(results)
        df = df.sort_values('r2', ascending=False)
        return df