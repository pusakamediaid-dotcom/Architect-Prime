import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from dataclasses import dataclass
import json
import joblib
from pathlib import Path

@dataclass
class PipelineConfig:
    test_size: float = 0.2
    random_state: int = 42
    stratify: Optional[str] = None
    scaler_type: str = 'standard'
    handle_missing: str = 'drop'
    handle_outliers: bool = False
    feature_selection: Optional[str] = None
    cv_folds: int = 5

class DataPipeline:
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.scaler = None
        self.label_encoders = {}
        self.feature_transformer = None
        self.is_fitted = False
        self.metadata = {
            'features': [],
            'target': None,
            'categorical_features': [],
            'numerical_features': [],
            'scaler_type': None
        }

    def load_data(self, file_path: str, target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
            df = pd.read_excel(file_path)
        elif file_path.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path}")

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in data")

        X = df.drop(columns=[target_column])
        y = df[target_column]

        self.metadata['target'] = target_column
        self.metadata['features'] = list(X.columns)
        self.metadata['shape'] = {'rows': len(df), 'columns': len(df.columns)}

        return X, y

    def preprocess(self, X: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        X_processed = X.copy()

        numerical_cols = X_processed.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = X_processed.select_dtypes(include=['object', 'category']).columns.tolist()

        self.metadata['numerical_features'] = numerical_cols
        self.metadata['categorical_features'] = categorical_cols

        if fit:
            if self.config.scaler_type == 'standard':
                self.scaler = StandardScaler()
            elif self.config.scaler_type == 'minmax':
                self.scaler = MinMaxScaler()
            else:
                self.scaler = StandardScaler()

            self.metadata['scaler_type'] = self.config.scaler_type

        if numerical_cols:
            if fit:
                X_processed[numerical_cols] = self.scaler.fit_transform(X_processed[numerical_cols])
            else:
                X_processed[numerical_cols] = self.scaler.transform(X_processed[numerical_cols])

        for col in categorical_cols:
            if fit:
                le = LabelEncoder()
                X_processed[col] = le.fit_transform(X_processed[col].astype(str))
                self.label_encoders[col] = le
            else:
                le = self.label_encoders.get(col)
                if le:
                    X_processed[col] = X_processed[col].map(
                        lambda x: le.transform([str(x)])[0] if str(x) in le.classes_ else -1
                    )

        return X_processed

    def split_data(self, X: pd.DataFrame, y: pd.Series) -> Tuple:
        return train_test_split(
            X, y,
            test_size=self.config.test_size,
            random_state=self.config.random_state,
            stratify=y if self.config.stratify else None
        )

    def cross_validate(self, model, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        scores = cross_val_score(model, X, y, cv=self.config.cv_folds, scoring='accuracy')
        
        return {
            'mean': float(np.mean(scores)),
            'std': float(np.std(scores)),
            'min': float(np.min(scores)),
            'max': float(np.max(scores)),
            'scores': scores.tolist()
        }

    def grid_search(self, model, param_grid: Dict, X: pd.DataFrame, y: pd.Series) -> GridSearchCV:
        grid_search = GridSearchCV(
            model, param_grid,
            cv=self.config.cv_folds,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        grid_search.fit(X, y)
        
        self.metadata['best_params'] = grid_search.best_params_
        self.metadata['best_score'] = float(grid_search.best_score_)
        
        return grid_search

    def create_pipeline(self, model, preprocessor: ColumnTransformer = None) -> Pipeline:
        if preprocessor:
            return Pipeline([
                ('preprocessor', preprocessor),
                ('classifier', model)
            ])
        
        return Pipeline([
            ('classifier', model)
        ])

    def fit_pipeline(self, X: pd.DataFrame, y: pd.Series, model=None) -> 'DataPipeline':
        X_processed = self.preprocess(X, fit=True)
        X_train, X_test, y_train, y_test = self.split_data(X_processed, y)
        
        if model:
            model.fit(X_train, y_train)
            self.metadata['model_fitted'] = True
        
        self.metadata['train_size'] = len(X_train)
        self.metadata['test_size'] = len(X_test)
        self.is_fitted = True
        
        return self

    def save(self, path: str):
        if not self.is_fitted:
            raise ValueError("Pipeline must be fitted before saving")

        artifacts = {
            'config': {
                'test_size': self.config.test_size,
                'random_state': self.config.random_state,
                'scaler_type': self.config.scaler_type
            },
            'metadata': self.metadata,
            'scaler': self.scaler,
            'label_encoders': {k: v for k, v in self.label_encoders.items()}
        }

        joblib.dump(artifacts, f"{path}.pkl")

        with open(f"{path}_metadata.json", 'w') as f:
            json.dump(self.metadata, f, indent=2, default=str)

    @staticmethod
    def load(path: str) -> 'DataPipeline':
        artifacts = joblib.load(f"{path}.pkl")
        
        pipeline = DataPipeline(PipelineConfig(**artifacts['config']))
        pipeline.scaler = artifacts['scaler']
        pipeline.label_encoders = artifacts['label_encoders']
        pipeline.metadata = artifacts['metadata']
        pipeline.is_fitted = True
        
        return pipeline

class FeatureEngineeringPipeline:
    def __init__(self):
        self.transformations = []

    def add_polynomial_features(self, degree: int = 2, interaction_only: bool = True):
        from sklearn.preprocessing import PolynomialFeatures
        self.transformations.append(('poly', PolynomialFeatures(degree, interaction_only)))
        return self

    def add_interaction_features(self, columns: List[str]):
        self.transformations.append(('interaction', columns))
        return self

    def add_rolling_features(self, window: int = 7):
        self.transformations.append(('rolling', window))
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X_transformed = X.copy()
        
        for name, params in self.transformations:
            if name == 'poly':
                poly = PolynomialFeatures(params, True)
                poly_features = poly.fit_transform(X_transformed)
                X_transformed = pd.DataFrame(
                    poly_features, 
                    columns=[f'poly_{i}' for i in range(poly_features.shape[1])]
                )
            elif name == 'interaction':
                for i, col1 in enumerate(params):
                    for col2 in params[i+1:]:
                        X_transformed[f'{col1}_x_{col2}'] = X_transformed[col1] * X_transformed[col2]
            elif name == 'rolling':
                for col in X_transformed.select_dtypes(include=[np.number]).columns:
                    X_transformed[f'{col}_rolling_mean_{params}'] = X_transformed[col].rolling(params).mean()

        return X_transformed

class ProductionPipeline:
    def __init__(self, model, preprocessor=None):
        self.model = model
        self.preprocessor = preprocessor
        self.pipeline = None

    def create(self) -> Pipeline:
        steps = []
        
        if self.preprocessor:
            steps.append(('preprocessor', self.preprocessor))
        
        steps.append(('model', self.model))
        
        self.pipeline = Pipeline(steps)
        return self.pipeline

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if not self.pipeline:
            raise ValueError("Pipeline not created")
        return self.pipeline.predict(X)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        if not self.pipeline:
            raise ValueError("Pipeline not created")
        if hasattr(self.model, 'predict_proba'):
            return self.pipeline.predict_proba(X)
        raise ValueError("Model does not support probability predictions")