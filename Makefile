up:
	cd app && npm run dev

lint:
	ruff check src/
	cd app && npm run lint

fix:
	ruff format src/
	cd app && npm run format

test:
	pytest tests/

ci:
	@ruff check src/
	@ruff format --check src/ || (echo "Python files need formatting — run: make fix" && exit 1)
	@cd app && npm run ci || (echo "Frontend lint/format failed — run: make fix" && exit 1)
	@pytest tests/
