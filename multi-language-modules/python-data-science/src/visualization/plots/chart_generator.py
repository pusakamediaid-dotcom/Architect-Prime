import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from typing import Optional, List, Tuple, Dict, Any

class ChartGenerator:
    def __init__(self, style: str = 'seaborn-v0_8-darkgrid', figsize: Tuple[int, int] = (10, 6)):
        self.style = style
        self.figsize = figsize
        plt.style.use(style)
        sns.set_palette("husl")

    def bar_chart(self, x: List, y: List, title: str = '', xlabel: str = '', ylabel: str = '',
                  color: Optional[str] = None, save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        bars = ax.bar(x, y, color=color or sns.color_palette()[0])
        
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.2f}', xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3), textcoords="offset points", ha='center', va='bottom')

        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def line_chart(self, x: List, y: List, title: str = '', xlabel: str = '', ylabel: str = '',
                   color: Optional[str] = None, marker: Optional[str] = None,
                   save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        ax.plot(x, y, color=color or sns.color_palette()[0], marker=marker, linewidth=2, markersize=8)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def scatter_plot(self, x: np.ndarray, y: np.ndarray, title: str = '', xlabel: str = '',
                     ylabel: str = '', hue: Optional[np.ndarray] = None, size: Optional[np.ndarray] = None,
                     save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        
        if hue is not None:
            scatter = ax.scatter(x, y, c=hue, s=size if size is not None else 50, cmap='viridis', alpha=0.7)
            plt.colorbar(scatter, ax=ax, label='Category')
        else:
            ax.scatter(x, y, s=size if size is not None else 50, alpha=0.7)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def histogram(self, data: np.ndarray, bins: int = 30, title: str = '', xlabel: str = '',
                  ylabel: str = 'Frequency', color: Optional[str] = None,
                  save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        ax.hist(data, bins=bins, color=color or sns.color_palette()[0], edgecolor='black', alpha=0.7)
        
        mean = np.mean(data)
        ax.axvline(mean, color='red', linestyle='--', linewidth=2, label=f'Mean: {mean:.2f}')
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.legend()
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def box_plot(self, data: pd.DataFrame, x: str, y: str, title: str = '',
                 save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        sns.boxplot(data=data, x=x, y=y, ax=ax, palette='Set2')
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def heatmap(self, data: np.ndarray, labels: Optional[List[str]] = None, title: str = '',
                cmap: str = 'coolwarm', annot: bool = True, fmt: str = '.2f',
                save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=(10, 8))
        
        sns.heatmap(data, annot=annot, fmt=fmt, cmap=cmap, ax=ax,
                   xticklabels=labels, yticklabels=labels,
                   linewidths=0.5, cbar_kws={'label': 'Value'})
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def pie_chart(self, labels: List, sizes: List, title: str = '',
                  colors: Optional[List[str]] = None, explode: Optional[List[float]] = None,
                  save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        
        wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, explode=explode,
                                          autopct='%1.1f%%', shadow=True, startangle=90)
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def correlation_matrix(self, df: pd.DataFrame, title: str = 'Correlation Matrix',
                           save_path: Optional[str] = None) -> plt.Figure:
        corr = df.corr()
        
        fig, ax = plt.subplots(figsize=(12, 10))
        mask = np.triu(np.ones_like(corr, dtype=bool))
        sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', cmap='coolwarm',
                   square=True, linewidths=0.5, ax=ax)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def multi_line_chart(self, data: Dict[str, List], xlabel: str = '', ylabel: str = '',
                         title: str = '', save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        
        for label, values in data.items():
            ax.plot(values, label=label, linewidth=2, marker='o', markersize=6)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.legend(loc='best')
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig

    def stacked_bar_chart(self, categories: List, data: Dict[str, List], title: str = '',
                          xlabel: str = '', ylabel: str = '', save_path: Optional[str] = None) -> plt.Figure:
        fig, ax = plt.subplots(figsize=self.figsize)
        
        bottom = np.zeros(len(categories))
        colors = sns.color_palette('Set2', len(data))
        
        for i, (label, values) in enumerate(data.items()):
            ax.bar(categories, values, bottom=bottom, label=label, color=colors[i])
            bottom += np.array(values)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.legend(loc='upper right')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        return fig