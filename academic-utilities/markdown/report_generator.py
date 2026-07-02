# Report Generator Script
import os
from datetime import datetime

TEMPLATE = """
# {title}

**Date:** {date}
**Author:** {author}

## Executive Summary
{summary}

## Introduction
{introduction}

## Methodology
{methodology}

## Results
{results}

## Discussion
{discussion}

## Conclusion
{conclusion}

## References
{references}
"""

def generate_report(data: dict, output_path: str):
    """Generate a markdown report from data dictionary."""
    
    report = TEMPLATE.format(
        title=data.get('title', 'Untitled Report'),
        date=data.get('date', datetime.now().strftime('%Y-%m-%d')),
        author=data.get('author', 'Anonymous'),
        summary=data.get('summary', ''),
        introduction=data.get('introduction', ''),
        methodology=data.get('methodology', ''),
        results=data.get('results', ''),
        discussion=data.get('discussion', ''),
        conclusion=data.get('conclusion', ''),
        references=data.get('references', '')
    )
    
    with open(output_path, 'w') as f:
        f.write(report)
    
    print(f"Report generated: {output_path}")

if __name__ == '__main__':
    sample_data = {
        'title': 'Sample Research Report',
        'author': 'John Doe',
        'summary': 'This report summarizes the research findings.',
        'introduction': 'Introduction text here...',
        'methodology': 'Methodology description...',
        'results': 'Results analysis...',
        'discussion': 'Discussion of findings...',
        'conclusion': 'Final conclusions...',
        'references': '- Reference 1\n- Reference 2'
    }
    
    generate_report(sample_data, 'report.md')
