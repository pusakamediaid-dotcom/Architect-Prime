import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class StatisticalSummary:
    count: int
    mean: float
    std: float
    min: float
    q25: float
    q50: float
    q75: float
    max: float
    missing: int
    unique: int

class EDAAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.summary_cache = {}

    def get_summary_statistics(self, column: str) -> StatisticalSummary:
        col_data = self.df[column].dropna()
        
        return StatisticalSummary(
            count=len(col_data),
            mean=float(col_data.mean()),
            std=float(col_data.std()),
            min=float(col_data.min()),
            q25=float(col_data.quantile(0.25)),
            q50=float(col_data.quantile(0.50)),
            q75=float(col_data.quantile(0.75)),
            max=float(col_data.max()),
            missing=int(self.df[column].isna().sum()),
            unique=int(col_data.nunique())
        )

    def get_all_summaries(self) -> Dict[str, StatisticalSummary]:
        summaries = {}
        for col in self.df.columns:
            if pd.api.types.is_numeric_dtype(self.df[col]):
                summaries[col] = self.get_summary_statistics(col)
        return summaries

    def detect_outliers(self, column: str, method: str = 'iqr') -> Tuple[np.ndarray, Dict]:
        data = self.df[column].dropna()
        
        if method == 'iqr':
            q1 = data.quantile(0.25)
            q3 = data.quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outliers = (data < lower_bound) | (data > upper_bound)
            
            return outliers.values, {
                'method': 'iqr',
                'q1': float(q1),
                'q3': float(q3),
                'iqr': float(iqr),
                'lower_bound': float(lower_bound),
                'upper_bound': float(upper_bound),
                'outlier_count': int(outliers.sum())
            }
        
        elif method == 'zscore':
            z_scores = np.abs((data - data.mean()) / data.std())
            outliers = z_scores > 3
            return outliers.values, {
                'method': 'zscore',
                'threshold': 3,
                'outlier_count': int(outliers.sum()),
                'mean': float(data.mean()),
                'std': float(data.std())
            }

    def analyze_correlations(self, method: str = 'pearson') -> pd.DataFrame:
        numeric_df = self.df.select_dtypes(include=[np.number])
        return numeric_df.corr(method=method)

    def analyze_distribution(self, column: str) -> Dict:
        data = self.df[column].dropna()
        
        from scipy import stats
        
        skewness = stats.skew(data)
        kurtosis = stats.kurtosis(data)
        
        if len(data) >= 20:
            _, p_value = stats.normaltest(data)
            is_normal = p_value > 0.05
        else:
            is_normal = None
            p_value = None

        return {
            'skewness': float(skewness),
            'kurtosis': float(kurtosis),
            'is_normal': is_normal,
            'normality_p_value': float(p_value) if p_value else None,
            'mean': float(data.mean()),
            'median': float(data.median()),
            'mode': float(data.mode()[0]) if len(data.mode()) > 0 else None
        }

    def analyze_categorical(self, column: str) -> Dict:
        value_counts = self.df[column].value_counts()
        total = len(self.df[column])
        
        return {
            'total_count': total,
            'unique_count': len(value_counts),
            'most_common': {
                'value': str(value_counts.index[0]),
                'count': int(value_counts.iloc[0]),
                'percentage': float(value_counts.iloc[0] / total * 100)
            },
            'distribution': {
                str(k): {'count': int(v), 'percentage': float(v / total * 100)}
                for k, v in value_counts.items()
            }
        }

    def analyze_missing_data(self) -> Dict:
        total_rows = len(self.df)
        missing_info = {}
        
        for col in self.df.columns:
            missing_count = self.df[col].isna().sum()
            if missing_count > 0:
                missing_info[col] = {
                    'count': int(missing_count),
                    'percentage': float(missing_count / total_rows * 100),
                    'dtype': str(self.df[col].dtype)
                }
        
        return missing_info

    def generate_profile_report(self) -> Dict:
        return {
            'shape': {'rows': len(self.df), 'columns': len(self.df.columns)},
            'columns': list(self.df.columns),
            'dtypes': {col: str(dtype) for col, dtype in self.df.dtypes.items()},
            'memory_usage': int(self.df.memory_usage(deep=True).sum()),
            'numeric_summary': {
                col: self.get_summary_statistics(col).__dict__
                for col in self.df.columns 
                if pd.api.types.is_numeric_dtype(self.df[col])
            },
            'categorical_summary': {
                col: self.analyze_categorical(col)
                for col in self.df.columns
                if not pd.api.types.is_numeric_dtype(self.df[col])
            },
            'missing_data': self.analyze_missing_data(),
            'correlations': self.analyze_correlations().to_dict()
        }

class DataQualityChecker:
    @staticmethod
    def check_email_format(df: pd.DataFrame, column: str) -> Dict:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        valid_emails = df[column].str.match(email_pattern, na=False)
        
        return {
            'total': len(df),
            'valid': int(valid_emails.sum()),
            'invalid': int((~valid_emails).sum()),
            'invalid_percentage': float((~valid_emails).sum() / len(df) * 100),
            'invalid_examples': df[~valid_emails][column].head(5).tolist()
        }

    @staticmethod
    def check_phone_format(df: pd.DataFrame, column: str) -> Dict:
        phone_pattern = r'^\+?[0-9]{10,15}$'
        valid_phones = df[column].str.match(phone_pattern, na=False)
        
        return {
            'total': len(df),
            'valid': int(valid_phones.sum()),
            'invalid': int((~valid_phones).sum()),
            'invalid_percentage': float((~valid_phones).sum() / len(df) * 100)
        }

    @staticmethod
    def check_date_range(df: pd.DataFrame, column: str, 
                         start_date: str = None, end_date: str = None) -> Dict:
        dates = pd.to_datetime(df[column], errors='coerce')
        
        result = {
            'total': len(df),
            'valid_dates': int(dates.notna().sum()),
            'invalid_dates': int(dates.isna().sum())
        }
        
        if start_date:
            result['before_start'] = int((dates < pd.to_datetime(start_date)).sum())
        if end_date:
            result['after_end'] = int((dates > pd.to_datetime(end_date)).sum())
        
        return result

    @staticmethod
    def check_duplicates(df: pd.DataFrame, columns: List[str] = None) -> Dict:
        if columns:
            duplicates = df.duplicated(subset=columns)
        else:
            duplicates = df.duplicated()
        
        return {
            'total_rows': len(df),
            'duplicate_count': int(duplicates.sum()),
            'duplicate_percentage': float(duplicates.sum() / len(df) * 100),
            'duplicate_rows': df[duplicates].head(10).to_dict('records')
        }

    @staticmethod
    def check_value_ranges(df: pd.DataFrame, column: str, 
                           min_val: float = None, max_val: float = None) -> Dict:
        data = df[column].dropna()
        
        result = {
            'total': len(data),
            'min': float(data.min()),
            'max': float(data.max()),
            'mean': float(data.mean())
        }
        
        if min_val is not None:
            result['below_min'] = int((data < min_val).sum())
        if max_val is not None:
            result['above_max'] = int((data > max_val).sum())
        
        return result