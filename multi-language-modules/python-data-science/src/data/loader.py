"""
Data Loading Module
Handles loading and initial preprocessing of datasets
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Union, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class DataLoader:
    """Data loader with support for multiple formats."""
    
    SUPPORTED_FORMATS = ['.csv', '.xlsx', '.json', '.parquet']
    
    def __init__(self, data_dir: Union[str, Path] = 'data'):
        self.data_dir = Path(data_dir)
        
    def load(self, filename: str) -> pd.DataFrame:
        """Load data from file."""
        filepath = self.data_dir / filename
        
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")
        
        suffix = filepath.suffix.lower()
        
        if suffix == '.csv':
            return pd.read_csv(filepath)
        elif suffix == '.xlsx':
            return pd.read_excel(filepath)
        elif suffix == '.json':
            return pd.read_json(filepath)
        elif suffix == '.parquet':
            return pd.read_parquet(filepath)
        else:
            raise ValueError(f"Unsupported format: {suffix}")
    
    def split_train_test(
        self, 
        df: pd.DataFrame, 
        target_col: str,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, np.ndarray]:
        """Split data into train and test sets."""
        from sklearn.model_selection import train_test_split
        
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        logger.info(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
        
        return X_train, X_test, y_train, y_test
    
    def handle_missing(self, df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
        """Handle missing values."""
        if strategy == 'mean':
            return df.fillna(df.mean())
        elif strategy == 'median':
            return df.fillna(df.median())
        elif strategy == 'mode':
            return df.fillna(df.mode().iloc[0])
        elif strategy == 'drop':
            return df.dropna()
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
    
    def detect_outliers(self, df: pd.DataFrame, n_std: float = 3) -> pd.DataFrame:
        """Detect outliers using standard deviation method."""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            mean = df[col].mean()
            std = df[col].std()
            df[f'{col}_outlier'] = np.abs(df[col] - mean) > n_std * std
        
        return df
