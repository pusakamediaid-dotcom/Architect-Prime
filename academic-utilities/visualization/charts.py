#!/usr/bin/env python3
"""
Statistical Visualization for Academic Presentations
Generates charts and graphs ready for thesis/lab reports
"""

import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

import numpy as np
from pathlib import Path

class AcademicChart:
    """Generate publication-quality charts."""
    
    def __init__(self, style='seaborn-v0_8-darkgrid'):
        try:
            plt.style.use(style)
        except:
            pass
    
    def bar_chart(self, categories, values, title, xlabel, ylabel, output_path):
        """Create a bar chart."""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        bars = ax.bar(categories, values, color='#2E86AB')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.1f}', ha='center', va='bottom')
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"Chart saved: {output_path}")
    
    def line_chart(self, x_data, y_data, title, xlabel, ylabel, output_path):
        """Create a line chart with multiple series."""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        for y in y_data:
            ax.plot(x_data, y['values'], marker='o', label=y['label'])
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"Chart saved: {output_path}")
    
    def pie_chart(self, labels, values, title, output_path):
        """Create a pie chart."""
        fig, ax = plt.subplots(figsize=(8, 8))
        
        colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3B1F2B']
        
        ax.pie(values, labels=labels, autopct='%1.1f%%', 
               colors=colors[:len(labels)], startangle=90)
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        print(f"Chart saved: {output_path}")

if __name__ == '__main__':
    chart = AcademicChart()
    
    # Example: Research results
    categories = ['Q1', 'Q2', 'Q3', 'Q4']
    values = [75, 82, 68, 91]
    chart.bar_chart(categories, values, 
                    'Quarterly Performance', 
                    'Quarter', 'Score (%)',
                    'quarterly_performance.png')
    
    print("Charts generated successfully!")
