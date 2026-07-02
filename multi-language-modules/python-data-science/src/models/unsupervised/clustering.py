import numpy as np
from typing import Tuple, Optional, List, Dict
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, SpectralClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score

class Clusterer:
    def __init__(self, algorithm: str = 'kmeans', n_clusters: int = 5, **kwargs):
        self.algorithm = algorithm
        self.n_clusters = n_clusters
        self.params = kwargs
        self.model = self._create_model()
        self.labels_ = None
        self.is_fitted = False

    def _create_model(self):
        algorithms = {
            'kmeans': KMeans,
            'dbscan': DBSCAN,
            'agglomerative': AgglomerativeClustering,
            'spectral': SpectralClustering,
            'gmm': GaussianMixture
        }
        
        if self.algorithm == 'kmeans':
            return algorithms[self.algorithm](n_clusters=self.n_clusters, **self.params)
        elif self.algorithm == 'dbscan':
            return algorithms[self.algorithm](**self.params)
        elif self.algorithm == 'gmm':
            return algorithms[self.algorithm](n_components=self.n_clusters, **self.params)
        else:
            return algorithms[self.algorithm](n_clusters=self.n_clusters, **self.params)

    def fit(self, X: np.ndarray) -> 'Clusterer':
        self.model.fit(X)
        self.labels_ = self.model.labels_ if hasattr(self.model, 'labels_') else self.model.predict(X)
        self.is_fitted = True
        return self

    def fit_predict(self, X: np.ndarray) -> np.ndarray:
        self.fit(X)
        return self.labels_

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Model must be fitted first")
        if hasattr(self.model, 'predict'):
            return self.model.predict(X)
        return self.labels_

class OptimalClusterFinder:
    def __init__(self, max_clusters: int = 10, min_clusters: int = 2):
        self.max_clusters = max_clusters
        self.min_clusters = min_clusters
        self.inertia_scores = []
        self.silhouette_scores = []
        self.calinski_scores = []
        self.davies_scores = []

    def find_optimal_k(self, X: np.ndarray, method: str = 'elbow') -> Tuple[int, Dict]:
        if method == 'elbow':
            return self._elbow_method(X)
        elif method == 'silhouette':
            return self._silhouette_method(X)
        elif method == 'calinski':
            return self._calinski_method(X)
        else:
            return self._elbow_method(X)

    def _elbow_method(self, X: np.ndarray) -> Tuple[int, Dict]:
        inertias = []
        
        for k in range(self.min_clusters, self.max_clusters + 1):
            kmeans = KMeans(n_clusters=k, random_state=42)
            kmeans.fit(X)
            inertias.append(kmeans.inertia_)
            self.inertia_scores.append({'k': k, 'inertia': kmeans.inertia_})

        differences = np.diff(inertias)
        second_diff = np.diff(differences)
        elbow_point = np.argmax(second_diff) + 2

        return elbow_point, {
            'method': 'elbow',
            'inertia_scores': self.inertia_scores,
            'elbow_point': elbow_point
        }

    def _silhouette_method(self, X: np.ndarray) -> Tuple[int, Dict]:
        scores = []
        
        for k in range(self.min_clusters, self.max_clusters + 1):
            kmeans = KMeans(n_clusters=k, random_state=42)
            labels = kmeans.fit_predict(X)
            score = silhouette_score(X, labels)
            scores.append({'k': k, 'score': score})
            self.silhouette_scores = scores

        optimal_k = max(scores, key=lambda x: x['score'])['k']

        return optimal_k, {
            'method': 'silhouette',
            'silhouette_scores': self.silhouette_scores,
            'optimal_k': optimal_k
        }

    def _calinski_method(self, X: np.ndarray) -> Tuple[int, Dict]:
        scores = []
        
        for k in range(self.min_clusters, self.max_clusters + 1):
            kmeans = KMeans(n_clusters=k, random_state=42)
            labels = kmeans.fit_predict(X)
            score = calinski_harabasz_score(X, labels)
            scores.append({'k': k, 'score': score})
            self.calinski_scores = scores

        optimal_k = max(scores, key=lambda x: x['score'])['k']

        return optimal_k, {
            'method': 'calinski_harabasz',
            'calinski_scores': self.calinski_scores,
            'optimal_k': optimal_k
        }

class DBSCANClusterer:
    def __init__(self, eps: float = 0.5, min_samples: int = 5):
        self.eps = eps
        self.min_samples = min_samples
        self.model = DBSCAN(eps=eps, min_samples=min_samples)
        self.labels_ = None
        self.core_samples_ = None

    def fit(self, X: np.ndarray) -> 'DBSCANClusterer':
        self.model.fit(X)
        self.labels_ = self.model.labels_
        self.core_sample_indices_ = self.model.core_sample_indices_
        return self

    def get_cluster_info(self) -> Dict:
        n_clusters = len(set(self.labels_)) - (1 if -1 in self.labels_ else 0)
        n_noise = list(self.labels_).count(-1)

        cluster_sizes = {}
        for label in set(self.labels_):
            if label != -1:
                cluster_sizes[label] = list(self.labels_).count(label)

        return {
            'n_clusters': n_clusters,
            'n_noise': n_noise,
            'cluster_sizes': cluster_sizes
        }

class HierarchicalClusterer:
    def __init__(self, n_clusters: int = 5, linkage: str = 'ward', affinity: str = 'euclidean'):
        self.n_clusters = n_clusters
        self.linkage = linkage
        self.affinity = affinity
        self.model = AgglomerativeClustering(n_clusters=n_clusters, linkage=linkage)
        self.labels_ = None
        self.distances_ = None

    def fit(self, X: np.ndarray) -> 'HierarchicalClusterer':
        self.model.fit(X)
        self.labels_ = self.model.labels_
        return self

    def get_dendrogram_data(self) -> Dict:
        from scipy.cluster.hierarchy import linkage, dendrogram
        from scipy.spatial.distance import pdist
        
        if len(X) > 5000:
            sample_size = 5000
            X_sample = X[np.random.choice(len(X), sample_size, replace=False)]
        else:
            X_sample = X
        
        Z = linkage(X_sample, method=self.linkage)
        
        return {'linkage_matrix': Z.tolist()}

class GaussianMixtureModel:
    def __init__(self, n_components: int = 3, covariance_type: str = 'full'):
        self.n_components = n_components
        self.covariance_type = covariance_type
        self.model = GaussianMixture(n_components=n_components, covariance_type=covariance_type)
        self.labels_ = None
        self.probs_ = None

    def fit(self, X: np.ndarray) -> 'GaussianMixtureModel':
        self.model.fit(X)
        self.labels_ = self.model.predict(X)
        self.probs_ = self.model.predict_proba(X)
        return self

    def get_optimal_components(self, X: np.ndarray, max_components: int = 10) -> Dict:
        from sklearn.metrics import silhouette_score

        bic_scores = []
        aic_scores = []
        silhouette_scores = []

        for n in range(2, max_components + 1):
            gmm = GaussianMixture(n_components=n, covariance_type=self.covariance_type, random_state=42)
            gmm.fit(X)
            
            bic_scores.append({'n': n, 'bic': gmm.bic(X)})
            aic_scores.append({'n': n, 'aic': gmm.aic(X)})
            
            labels = gmm.predict(X)
            silhouette_scores.append({'n': n, 'silhouette': silhouette_score(X, labels)})

        optimal_bic = min(bic_scores, key=lambda x: x['bic'])
        optimal_aic = min(aic_scores, key=lambda x: x['aic'])

        return {
            'bic': bic_scores,
            'aic': aic_scores,
            'silhouette': silhouette_scores,
            'optimal_by_bic': optimal_bic['n'],
            'optimal_by_aic': optimal_aic['n']
        }