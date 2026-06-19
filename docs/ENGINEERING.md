# Engineering Practices

A summary of the software engineering practices followed in this project.

## Version Control & Collaboration

- All work is done on named feature branches — nothing is committed directly to `main`
- Every change goes through a pull request with a description covering what changed and why
- At least one approval is required before a PR can be merged
- Commit messages are descriptive and scoped to the change being made

## CI/CD

- GitHub Actions runs automatically on every pull request
- Ruff is enforced on all Python code — PRs with linting errors will not pass
- Pytest unit tests run on every PR
- All checks must pass before a branch can be merged

## Code Quality

- A `Makefile` provides standardized commands: `make lint`, `make fix`, `make ci`, `make test`
- Ruff handles both linting and formatting for Python
- Secrets (API keys, tokens) are managed via `.env` files and `python-dotenv` — nothing hardcoded
- `requirements.txt` pins dependencies for a reproducible Python environment

## Project Management

- All work items are tracked as GitHub Issues before any code is written
- No work is started without a corresponding issue
- Feature issues follow a structured format: Overview, Technical Requirements, Acceptance Criteria, Notes, Branch
- Enhancement issues follow: Overview, Current Behavior, Proposed Behavior, Technical Requirements, Acceptance Criteria, Benefit/Impact, Branch
- Bug issues follow: Overview, Acceptance Criteria, Steps to Reproduce, Impact, Screenshots/Logs (optional), Branch

## Data Engineering

- Data flows through a bronze → silver → gold pipeline, with each layer progressively cleaner and more aggregated
- API responses are cached locally to avoid redundant calls and stay within rate limits
- Raw, processed, and aggregated data are kept in separate directories (`data/bronze/`, `data/silver/`, `data/gold/`)

## Reproducibility

- Gold data files are publicly available in `data/gold/` for replication
- The full pipeline is documented in `docs/DATA.md`
- A random sample of OpenAlex topic assignments was manually validated and documented in `docs/LIMITATIONS.md`
