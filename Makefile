lint:
	ruff check src/

format:
	ruff format src/

ci:
	ruff check src/
	ruff format --check src/
