# Gender Representation in SE Research

An analysis of female-presenting authorship across four major software engineering venues — ICSE, ECSA, MSR, and ICSME — from 2008 to 2023. Author gender is inferred from first names using the Genderize.io API. The pipeline collects raw data from DBLP and OpenAlex, processes it through a bronze/silver/gold pipeline, and produces aggregated statistics visualized in an interactive dashboard.

## Prerequisites

- Python 3.11
- Node.js 20
- A [Genderize.io](https://genderize.io) API key

## Setup

```bash
git clone https://github.com/RemainingDelta/se-author-gender-diversity.git
cd se-author-gender-diversity
```

Create a `.env` file at the repo root:

```
GENDERIZE_API_KEY=your_api_key_here
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install frontend dependencies:

```bash
cd app && npm install
```

## Reproducing the Pipeline

Run the following scripts in order from the repo root:

```bash
# Bronze — collect raw data
python src/bronze/fetch_bronze_dblp.py
python src/bronze/fetch_bronze_open_alex.py
python src/bronze/collect_names.py
python src/bronze/fetch_genderize.py

# Silver — process and join data
python src/silver/evaluate_data.py

# Gold — aggregate into visualization-ready files
python src/gold/synthesize_gold.py

# Optional — generate a random validation sample
python src/bronze/random_sample.py
```

Most scripts are incremental — `fetch_bronze_dblp.py`, `fetch_genderize.py`, `evaluate_data.py`, and `synthesize_gold.py` will skip already-cached outputs if re-run.

## Extending to Other Conferences

The pipeline is not limited to the four venues studied. To add a new DBLP-indexed conference, add its venue key to the `VENUES` list at the top of each script in `src/bronze/` and `src/silver/`, then re-run the pipeline from step 1. The rest of the pipeline will pick it up automatically.

## Skipping the Pipeline

The gold data files are already included in `data/gold/`. If you just want to explore the dashboard or verify the results without re-running the pipeline, you can skip straight to running the dashboard.

## Running the Dashboard Locally

```bash
make up
```

The dashboard will be available at `http://localhost:5173`.

## Makefile Commands

| Command | Description |
|---|---|
| `make up` | Start the frontend development server |
| `make lint` | Lint Python (ruff) and frontend (ESLint) |
| `make fix` | Auto-format Python (ruff) and frontend (Prettier) |
| `make test` | Run the pytest test suite |
| `make ci` | Full CI check — lint, format, and tests |

## Live Dashboard

[se-author-gender-diversity.vercel.app](https://se-author-gender-diversity.vercel.app)

## Docs

- [Results](docs/RESULTS.md) — findings, charts, and methodology notes
- [Data](docs/DATA.md) — pipeline overview, data storage structure, and script reference
- [Limitations](docs/LIMITATIONS.md) — known limitations of the analysis
- [Engineering](docs/ENGINEERING.md) — software engineering practices followed in this project
