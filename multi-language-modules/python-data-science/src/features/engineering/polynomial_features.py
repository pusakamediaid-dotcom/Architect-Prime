import numpy as np
import pandas as pd
from typing import List, Tuple, Optional, Dict
from sklearn.preprocessing import PolynomialFeatures as SKPolynomialFeatures

class PolynomialFeatureGenerator:
    def __init__(self, degree: int = 2, interaction_only: bool = False, include_bias: bool = True):
        self.degree = degree
        self.interaction_only = interaction_only
        self.include_bias = include_bias
        self.poly = SKPolynomialFeatures(degree, interaction_only, include_bias)
        self.feature_names_ = None
    
    def fit(self, X: np.ndarray, feature_names: Optional[List[str]] = None):
        self.poly.fit(X)
        if feature_names:
            self.feature_names_ = self.poly.get_feature_names_out(feature_names)
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        return self.poly.transform(X)
    
    def fit_transform(self, X: np.ndarray, feature_names: Optional[List[str]] = None) -> np.ndarray:
        result = self.fit(X, feature_names).transform(X)
        return result
    
    def get_feature_names(self, input_features: List[str]) -> List[str]:
        return self.poly.get_feature_names_out(input_features).tolist()

class FeatureInteraction:
    @staticmethod
    def add_interactions(X: pd.DataFrame, columns: List[str], interaction_type: str = 'multiply') -> pd.DataFrame:
        result = X.copy()
        
        for i, col1 in enumerate(columns):
            for col2 in columns[i+1:]:
                if interaction_type == 'multiply':
                    result[f'{col1}_x_{col2}'] = X[col1] * X[col2]
                elif interaction_type == 'divide':
                    result[f'{col1}_div_{col2}'] = X[col1] / (X[col2] + 1e-10)
                elif interaction_type == 'add':
                    result[f'{col1}_plus_{col2}'] = X[col1] + X[col2]
                elif interaction_type == 'subtract':
                    result[f'{col1}_minus_{col2}'] = X[col1] - X[col2]
        
        return result
    
    @staticmethod
    def create_ratio_features(X: pd.DataFrame, numerator_cols: List[str], denominator_cols: List[str]) -> pd.DataFrame:
        result = X.copy()
        
        for num_col in numerator_cols:
            for den_col in denominator_cols:
                result[f'ratio_{num_col}_over_{den_col}'] = X[num_col] / (X[den_col] + 1e-10)
        
        return result

class StatisticalFeatures:
    @staticmethod
    def rolling_features(df: pd.DataFrame, column: str, windows: List[int] = [3, 7, 14, 30]) -> pd.DataFrame:
        result = df.copy()
        
        for window in windows:
            result[f'{column}_rolling_mean_{window}'] = df[column].rolling(window=window).mean()
            result[f'{column}_rolling_std_{window}'] = df[column].rolling(window=window).std()
            result[f'{column}_rolling_min_{window}'] = df[column].rolling(window=window).min()
            result[f'{column}_rolling_max_{window}'] = df[column].rolling(window=window).max()
        
        return result
    
    @staticmethod
    def lag_features(df: pd.DataFrame, column: str, lags: List[int] = [1, 2, 3, 7, 14]) -> pd.DataFrame:
        result = df.copy()
        
        for lag in lags:
            result[f'{column}_lag_{lag}'] = df[column].shift(lag)
        
        return result
    
    @staticmethod
    def expanding_features(df: pd.DataFrame, column: str) -> pd.DataFrame:
        result = df.copy()
        
        result[f'{column}_expanding_mean'] = df[column].expanding().mean()
        result[f'{column}_expanding_std'] = df[column].expanding().std()
        result[f'{column}_expanding_min'] = df[column].expanding().min()
        result[f'{column}_expanding_max'] = df[column].expanding().max()
        
        return result

class DateTimeFeatures:
    @staticmethod
    def extract_datetime_features(df: pd.DataFrame, datetime_column: str) -> pd.DataFrame:
        result = df.copy()
        
        dt = pd.to_datetime(df[datetime_column])
        
        result[f'{datetime_column}_year'] = dt.dt.year
        result[f'{datetime_column}_month'] = dt.dt.month
        result[f'{datetime_column}_day'] = dt.dt.day
        result[f'{datetime_column}_dayofweek'] = dt.dt.dayofweek
        result[f'{datetime_column}_quarter'] = dt.dt.quarter
        result[f'{datetime_column}_weekofyear'] = dt.dt.isocalendar().week.astype(int)
        result[f'{datetime_column}_is_weekend'] = dt.dt.dayofweek.isin([5, 6]).astype(int)
        result[f'{datetime_column}_hour'] = dt.dt.hour
        result[f'{datetime_column}_minute'] = dt.dt.minute
        result[f'{datetime_column}_dayofyear'] = dt.dt.dayofyear
        
        return result

class BinningFeatures:
    @staticmethod
    def create_bins(data: np.ndarray, n_bins: int, strategy: str = 'quantile') -> Tuple[np.ndarray, np.ndarray]:
        if strategy == 'quantile':
            quantiles = np.linspace(0, 100, n_bins + 1)
            bins = np.percentile(data, quantiles)
        elif strategy == 'uniform':
            bins = np.linspace(data.min(), data.max(), n_bins + 1)
        elif strategy == 'kmeans':
            from sklearn.cluster import KMeans
            km = KMeans(n_clusters=n_bins, random_state=42)
            km.fit(data.reshape(-1, 1))
            bins = sorted(km.cluster_centers_.flatten())
            bins = np.concatenate([[data.min() - 1], bins, [data.max() + 1]])
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        bin_indices = np.digitize(data, bins[1:-1])
        return bin_indices, bins
    
    @staticmethod
    def add_binned_features(df: pd.DataFrame, column: str, n_bins: int = 5, labels: Optional[List[str]] = None) -> pd.DataFrame:
        result = df.copy()
        bin_indices, bins = BinningFeatures.create_bins(df[column].values, n_bins)
        
        result[f'{column}_binned'] = bin_indices
        
        if labels:
            result[f'{column}_binned_label'] = pd.cut(df[column], bins=bins, labels=labels, include_lowest=True)
        else:
            result[f'{column}_binned_label'] = pd.cut(df[column], bins=bins, include_lowest=True)
        
        return result