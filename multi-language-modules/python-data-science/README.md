# Python Data Science Module

Production-ready data science boilerplate with machine learning workflows.

## Structure

```
python-data-science/
├── src/
│   ├── data/          # Data loading & preprocessing
│   ├── features/      # Feature engineering
│   ├── models/        # ML models
│   ├── training/      # Training pipelines
│   └── evaluation/    # Metrics & evaluation
├── tests/
├── notebooks/         # Jupyter notebooks
├── models/            # Saved models
├── docker/
└── config/
```

## Quick Start

```bash
pip install -r requirements.txt
python src/training/train.py --config config/default.yaml
```

## Features

- Scikit-learn integration
- Pandas data preprocessing
- FastAPI model serving
- Docker containerization
- MLflow experiment tracking
