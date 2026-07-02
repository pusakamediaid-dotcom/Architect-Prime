import numpy as np
from typing import List, Dict, Tuple, Optional, Callable
from dataclasses import dataclass

@dataclass
class Layer:
    input_dim: int
    output_dim: int
    activation: str = 'relu'
    weights: np.ndarray = None
    bias: np.ndarray = None

class NeuralNetwork:
    def __init__(self, layers: List[int], activations: List[str] = None):
        self.layers = layers
        self.activations = activations or ['relu'] * (len(layers) - 1)
        self.layer_objects = []
        self.is_compiled = False
        
        if len(self.activations) < len(layers) - 1:
            self.activations.extend(['relu'] * (len(layers) - len(self.activations) - 1))

    def initialize_weights(self):
        self.layer_objects = []
        
        for i in range(len(self.layers) - 1):
            input_dim = self.layers[i]
            output_dim = self.layers[i + 1]
            
            if self.activations[i] == 'relu':
                scale = np.sqrt(2.0 / input_dim)
            else:
                scale = np.sqrt(1.0 / input_dim)
            
            weights = np.random.randn(input_dim, output_dim) * scale
            bias = np.zeros((1, output_dim))
            
            self.layer_objects.append({
                'weights': weights,
                'bias': bias,
                'activation': self.activations[i]
            })
        
        self.is_compiled = True

    def forward(self, X: np.ndarray) -> Tuple[np.ndarray, List]:
        activations = [X]
        current_input = X
        
        for layer in self.layer_objects:
            z = current_input @ layer['weights'] + layer['bias']
            
            a = self._apply_activation(z, layer['activation'])
            activations.append(a)
            current_input = a
        
        return activations[-1], activations

    def backward(self, y_true: np.ndarray, activations: List[np.ndarray], learning_rate: float = 0.01):
        m = y_true.shape[0]
        delta = activations[-1] - y_true
        
        for i in reversed(range(len(self.layer_objects))):
            layer = self.layer_objects[i]
            a_prev = activations[i]
            
            dW = (a_prev.T @ delta) / m
            dB = np.sum(delta, axis=0, keepdims=True) / m
            
            layer['weights'] -= learning_rate * dW
            layer['bias'] -= learning_rate * dB
            
            if i > 0:
                delta = (delta @ layer['weights'].T) * self._apply_activation_derivative(a_prev, layer['activation'])

    def fit(self, X: np.ndarray, y: np.ndarray, epochs: int = 100, learning_rate: float = 0.01, 
            batch_size: int = 32, verbose: bool = True) -> Dict:
        if not self.is_compiled:
            self.initialize_weights()
        
        history = {'loss': [], 'accuracy': []}
        
        for epoch in range(epochs):
            indices = np.random.permutation(len(X))
            X_shuffled = X[indices]
            y_shuffled = y[indices]
            
            epoch_loss = 0
            epoch_accuracy = 0
            num_batches = 0
            
            for start in range(0, len(X), batch_size):
                end = min(start + batch_size, len(X))
                X_batch = X_shuffled[start:end]
                y_batch = y_shuffled[start:end]
                
                predictions, activations = self.forward(X_batch)
                
                loss = self._compute_loss(predictions, y_batch)
                accuracy = self._compute_accuracy(predictions, y_batch)
                
                self.backward(y_batch, activations, learning_rate)
                
                epoch_loss += loss
                epoch_accuracy += accuracy
                num_batches += 1
            
            avg_loss = epoch_loss / num_batches
            avg_accuracy = epoch_accuracy / num_batches
            
            history['loss'].append(avg_loss)
            history['accuracy'].append(avg_accuracy)
            
            if verbose and (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch + 1}/{epochs} - Loss: {avg_loss:.4f} - Accuracy: {avg_accuracy:.4f}")
        
        return history

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_compiled:
            self.initialize_weights()
        predictions, _ = self.forward(X)
        return predictions

    def _apply_activation(self, z: np.ndarray, activation: str) -> np.ndarray:
        if activation == 'relu':
            return np.maximum(0, z)
        elif activation == 'sigmoid':
            return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
        elif activation == 'tanh':
            return np.tanh(z)
        elif activation == 'softmax':
            exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
            return exp_z / np.sum(exp_z, axis=1, keepdims=True)
        else:
            return z

    def _apply_activation_derivative(self, a: np.ndarray, activation: str) -> np.ndarray:
        if activation == 'relu':
            return (a > 0).astype(float)
        elif activation == 'sigmoid':
            return a * (1 - a)
        elif activation == 'tanh':
            return 1 - a ** 2
        else:
            return np.ones_like(a)

    def _compute_loss(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        m = y_true.shape[0]
        epsilon = 1e-15
        y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
        loss = -np.sum(y_true * np.log(y_pred)) / m
        return loss

    def _compute_accuracy(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        predictions = np.argmax(y_pred, axis=1)
        labels = np.argmax(y_true, axis=1)
        return np.mean(predictions == labels)

    def get_weights(self) -> List[Dict]:
        return [{'weights': l['weights'].copy(), 'bias': l['bias'].copy()} 
                for l in self.layer_objects]

    def set_weights(self, weights: List[Dict]):
        for i, w in enumerate(weights):
            if i < len(self.layer_objects):
                self.layer_objects[i]['weights'] = w['weights'].copy()
                self.layer_objects[i]['bias'] = w['bias'].copy()

class ConvolutionalLayer:
    def __init__(self, num_filters: int, filter_size: int, input_channels: int = 1):
        self.num_filters = num_filters
        self.filter_size = filter_size
        self.input_channels = input_channels
        self.filters = np.random.randn(num_filters, filter_size, filter_size) * 0.1

    def forward(self, input_data: np.ndarray) -> np.ndarray:
        h, w = input_data.shape
        out_h = h - self.filter_size + 1
        out_w = w - self.filter_size + 1
        
        output = np.zeros((self.num_filters, out_h, out_w))
        
        for f in range(self.num_filters):
            for i in range(out_h):
                for j in range(out_w):
                    output[f, i, j] = np.sum(
                        input_data[i:i+self.filter_size, j:j+self.filter_size] * self.filters[f]
                    )
        
        return output

class PoolingLayer:
    def __init__(self, pool_size: int = 2, mode: str = 'max'):
        self.pool_size = pool_size
        self.mode = mode

    def forward(self, input_data: np.ndarray) -> np.ndarray:
        channels, h, w = input_data.shape
        out_h = h // self.pool_size
        out_w = w // self.pool_size
        
        output = np.zeros((channels, out_h, out_w))
        
        for c in range(channels):
            for i in range(out_h):
                for j in range(out_w):
                    h_start = i * self.pool_size
                    w_start = j * self.pool_size
                    pool_region = input_data[c, h_start:h_start+self.pool_size, w_start:w_start+self.pool_size]
                    
                    if self.mode == 'max':
                        output[c, i, j] = np.max(pool_region)
                    else:
                        output[c, i, j] = np.mean(pool_region)
        
        return output

class DropoutLayer:
    def __init__(self, dropout_rate: float = 0.5):
        self.dropout_rate = dropout_rate
        self.mask = None
        self.training = True

    def forward(self, input_data: np.ndarray) -> np.ndarray:
        if self.training:
            self.mask = np.random.binomial(1, 1 - self.dropout_rate, input_data.shape)
            return input_data * self.mask / (1 - self.dropout_rate)
        return input_data

    def eval(self):
        self.training = False

    def train(self):
        self.training = True