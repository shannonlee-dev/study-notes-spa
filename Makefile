PYTHON ?= python3
.PHONY: setup check format test build run

setup:
	npm ci

check:
	$(PYTHON) scripts/check.py
	npm run lint
	npm run format:check

format:
	npm run format

test:
	npm test

build:
	npm run build

run:
	npm run dev -- --host 127.0.0.1
