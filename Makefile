up:
	cd app && npm run dev

lint:
	ruff check src/

fix:
	ruff format src/

ci:
	ruff check src/
	ruff format --check src/
