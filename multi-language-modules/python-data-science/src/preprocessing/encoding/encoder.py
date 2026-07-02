import numpy as np
import pandas as pd
from typing import List, Dict, Union, Optional
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

class EncoderFactory:
    @staticmethod
    def create_encoder(encoder_type: str):
        encoders = {
            'label': LabelEncoderWrapper,
            'onehot': OneHotEncoderWrapper,
            'ordinal': OrdinalEncoderWrapper,
            'target': TargetEncoder,
            'binary': BinaryEncoder
        }
        return encoders.get(encoder_type, LabelEncoderWrapper)()

class LabelEncoderWrapper:
    def __init__(self):
        self.encoder = LabelEncoder()
        self.classes_ = None
        self.fitted = False
    
    def fit(self, data: np.ndarray):
        self.encoder.fit(data)
        self.classes_ = self.encoder.classes_
        self.fitted = True
        return self
    
    def transform(self, data: np.ndarray) -> np.ndarray:
        if not self.fitted:
            raise ValueError("Encoder must be fitted first")
        return self.encoder.transform(data)
    
    def fit_transform(self, data: np.ndarray) -> np.ndarray:
        return self.fit(data).transform(data)
    
    def inverse_transform(self, data: np.ndarray) -> np.ndarray:
        return self.encoder.inverse_transform(data)
    
    def save(self, path: str):
        joblib.dump(self, path)
    
    @staticmethod
    def load(path: str):
        return joblib.load(path)

class OneHotEncoderWrapper:
    def __init__(self, sparse: bool = False, handle_unknown: str = 'ignore'):
        self.encoder = OneHotEncoder(sparse=sparse, handle_unknown=handle_unknown)
        self.feature_names_ = None
        self.fitted = False
    
    def fit(self, data: pd.DataFrame, columns: List[str] = None):
        target_cols = columns if columns else data.columns.tolist()
        self.encoder.fit(data[target_cols])
        self.fitted = True
        return self
    
    def transform(self, data: pd.DataFrame, columns: List[str] = None) -> np.ndarray:
        if not self.fitted:
            raise ValueError("Encoder must be fitted first")
        target_cols = columns if columns else data.columns.tolist()
        return self.encoder.transform(data[target_cols])
    
    def fit_transform(self, data: pd.DataFrame, columns: List[str] = None) -> np.ndarray:
        return self.fit(data, columns).transform(data, columns)
    
    def get_feature_names(self, input_features: List[str] = None) -> List[str]:
        return self.encoder.get_feature_names_out(input_features)

class OrdinalEncoderWrapper:
    def __init__(self, categories: Union[List, str] = 'auto', handle_unknown: str = 'use_encoded_value', unknown_value: int = -1):
        self.encoder = OrdinalEncoder(
            categories=categories,
            handle_unknown=handle_unknown,
            unknown_value=unknown_value
        )
        self.fitted = False
    
    def fit(self, data: np.ndarray):
        self.encoder.fit(data)
        self.fitted = True
        return self
    
    def transform(self, data: np.ndarray) -> np.ndarray:
        if not self.fitted:
            raise ValueError("Encoder must be fitted first")
        return self.encoder.transform(data)
    
    def fit_transform(self, data: np.ndarray) -> np.ndarray:
        return self.fit(data).transform(data)

class TargetEncoder:
    def __init__(self, smoothing: float = 1.0):
        self.smoothing = smoothing
        self.global_mean = None
        self.encoding_map = {}
        self.fitted = False
    
    def fit(self, X: pd.DataFrame, y: pd.Series, columns: List[str] = None):
        self.global_mean = y.mean()
        target_cols = columns if columns else X.columns.tolist()
        
        for col in target_cols:
            stats = y.groupby(X[col]).agg(['mean', 'count'])
            smooth_mean = (stats['mean'] * stats['count'] + self.global_mean * self.smoothing) / (stats['count'] + self.smoothing)
            self.encoding_map[col] = smooth_mean.to_dict()
        
        self.fitted = True
        return self
    
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        if not self.fitted:
            raise ValueError("Encoder must be fitted first")
        
        result = X.copy()
        for col, encoding in self.encoding_map.items():
            result[col] = X[col].map(encoding).fillna(self.global_mean)
        return result
    
    def fit_transform(self, X: pd.DataFrame, y: pd.Series, columns: List[str] = None) -> pd.DataFrame:
        return self.fit(X, y, columns).transform(X)

class BinaryEncoder:
    def __init__(self):
        self.categories = {}
        self.fitted = False
    
    def fit(self, data: np.ndarray):
        unique_values = np.unique(data)
        self.categories = {val: i for i, val in enumerate(unique_values)}
        self.fitted = True
        return self
    
    def transform(self, data: np.ndarray) -> np.ndarray:
        if not self.fitted:
            raise ValueError("Encoder must be fitted first")
        
        indices = np.array([self.categories.get(v, -1) for v in data])
        return np.array([self._int_to_binary(i) for i in indices])
    
    def _int_to_binary(self, n: int) -> np.ndarray:
        if n < 0:
            return np.array([])
        binary = []
        while n > 0:
            binary.append(n % 2)
            n //= 2
        return np.array(binary[::-1] if binary else [0])
    
    def fit_transform(self, data: np.ndarray) -> np.ndarray:
        return self.fit(data).transform(data)

class ColumnTransformerPipeline:
    def __init__(self):
        self.transformers = []
        self.pipeline = None
    
    def add_transformer(self, name: str, encoder, columns: List[str]):
        self.transformers.append((name, encoder, columns))
        return self
    
    def fit(self, data: pd.DataFrame):
        self.pipeline = ColumnTransformer(
            transformers=self.transformers,
            remainder='passthrough'
        )
        self.pipeline.fit(data)
        return self
    
    def transform(self, data: pd.DataFrame) -> np.ndarray:
        if not self.pipeline:
            raise ValueError("Pipeline must be fitted first")
        return self.pipeline.transform(data)
    
    def fit_transform(self, data: pd.DataFrame) -> np.ndarray:
        return self.fit(data).transform(data)