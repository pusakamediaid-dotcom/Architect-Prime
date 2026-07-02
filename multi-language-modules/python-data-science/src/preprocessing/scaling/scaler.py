import numpy as np
from typing import Tuple, Optional, List, Dict
from sklearn.preprocessing import StandardScaler, MinMaxScaler, MaxAbsScaler, RobustScaler
import joblib

class ScalerFactory:
    SCALERS = {
        'standard': StandardScaler,
        'minmax': MinMaxScaler,
        'maxabs': MaxAbsScaler,
        'robust': RobustScaler
    }
    
    @staticmethod
    def create(scaler_type: str = 'standard', **kwargs):
        scaler_class = ScalerFactory.SCALERS.get(scaler_type, StandardScaler)
        return scaler_class(**kwargs)

class CustomStandardScaler:
    def __init__(self, with_mean: bool = True, with_std: bool = True):
        self.with_mean = with_mean
        self.with_std = with_std
        self.mean_ = None
        self.std_ = None
        self.scale_ = None
    
    def fit(self, X: np.ndarray) -> 'CustomStandardScaler':
        self.mean_ = np.mean(X, axis=0) if self.with_mean else 0
        self.std_ = np.std(X, axis=0) if self.with_std else 1
        self.scale_ = self.std_
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        return (X - self.mean_) / self.scale_
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)
    
    def inverse_transform(self, X: np.ndarray) -> np.ndarray:
        return X * self.scale_ + self.mean_
    
    def save(self, path: str):
        joblib.dump({
            'mean': self.mean_,
            'scale': self.scale_
        }, path)
    
    @staticmethod
    def load(path: str):
        data = joblib.load(path)
        scaler = CustomStandardScaler()
        scaler.mean_ = data['mean']
        scaler.scale_ = data['scale']
        return scaler

class LogTransformer:
    def __init__(self, base: float = np.e, shift: float = 1.0):
        self.base = base
        self.shift = shift
        self._min_value = None
    
    def fit(self, X: np.ndarray) -> 'LogTransformer':
        self._min_value = np.min(X) + self.shift
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        return np.log(X + self.shift - self._min_value + 1) / np.log(self.base)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)
    
    def inverse_transform(self, X: np.ndarray) -> np.ndarray:
        return np.power(self.base, X) - 1 + self._min_value - self.shift

class PowerTransformer:
    def __init__(self, power: float = 0.5, standardize: bool = True):
        self.power = power
        self.standardize = standardize
        self.lambdas_ = None
    
    def fit(self, X: np.ndarray) -> 'PowerTransformer':
        self.lambdas_ = self._estimate_lambda(X)
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        if self.power == 0.5:
            return np.sqrt(np.maximum(X + abs(np.min(X)) + 1, 0))
        elif self.power == -0.5:
            return 1 / np.sqrt(np.maximum(X + abs(np.min(X)) + 1, 1))
        else:
            return np.power(np.maximum(X + abs(np.min(X)) + 1, 0), self.power)
    
    def _estimate_lambda(self, X: np.ndarray) -> float:
        return self.power
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)

class WinsorizationScaler:
    def __init__(self, lower_percentile: float = 0.05, upper_percentile: float = 0.95):
        self.lower_percentile = lower_percentile
        self.upper_percentile = upper_percentile
        self.lower_bounds_ = None
        self.upper_bounds_ = None
    
    def fit(self, X: np.ndarray) -> 'WinsorizationScaler':
        self.lower_bounds_ = np.percentile(X, self.lower_percentile * 100, axis=0)
        self.upper_bounds_ = np.percentile(X, self.upper_percentile * 100, axis=0)
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        return np.clip(X, self.lower_bounds_, self.upper_bounds_)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)

class Normalizer:
    def __init__(self, norm: str = 'l2'):
        self.norm = norm
        self.norms_ = None
    
    def fit(self, X: np.ndarray) -> 'Normalizer':
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        if self.norm == 'l1':
            norms = np.abs(X).sum(axis=1, keepdims=True)
        elif self.norm == 'l2':
            norms = np.sqrt(np.sum(X**2, axis=1, keepdims=True))
        elif self.norm == 'max':
            norms = np.max(np.abs(X), axis=1, keepdims=True)
        else:
            raise ValueError(f"Unknown norm: {self.norm}")
        return X / (norms + 1e-8)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)

class QuantileTransformer:
    def __init__(self, n_quantiles: int = 1000, output_distribution: str = 'uniform'):
        self.n_quantiles = n_quantiles
        self.output_distribution = output_distribution
        self.quantiles_ = None
        self.target_quantiles_ = None
    
    def fit(self, X: np.ndarray) -> 'QuantileTransformer':
        self.quantiles_ = np.linspace(0, 100, self.n_quantiles)
        if self.output_distribution == 'uniform':
            self.target_quantiles_ = np.linspace(0, 100, self.n_quantiles)
        else:
            from scipy.stats import norm
            self.target_quantiles_ = norm.ppf(self.quantiles_ / 100) * 100
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        percentiles = np.percentile(X.flatten(), self.quantiles_)
        return np.interp(X.flatten(), percentiles, self.target_quantiles_).reshape(X.shape)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)