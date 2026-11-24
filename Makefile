.PHONY: help run test test-cov seed lint format migrate makemigrations clean frontend-dev frontend-build

help:
	@echo "MediTrack Healthcare Management Platform"
	@echo "Available commands:"
	@echo "  make run             Start Django development server"
	@echo "  make test            Run test suite with pytest"
	@echo "  make test-cov        Run test suite with coverage report"
	@echo "  make seed            Seed database with realistic clinical data"
	@echo "  make lint            Lint codebase with ruff"
	@echo "  make format          Format codebase with ruff and black"
	@echo "  make migrate         Apply database migrations"
	@echo "  make makemigrations  Generate database migrations"
	@echo "  make frontend-dev    Start Vite React frontend (port 3000)"
	@echo "  make frontend-build  Compile Vite React frontend production build"

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

run:
	python manage.py runserver 0.0.0.0:8000

test:
	pytest

test-cov:
	pytest --cov=apps --cov-report=term-missing --cov-report=html

seed:
	python manage.py seed_demo

lint:
	ruff check .
	black --check .

format:
	ruff check --fix .
	black .

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov
