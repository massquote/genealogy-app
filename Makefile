SHELL := /bin/bash

# --- Lifecycle ---
.PHONY: up down stop start restart build rebuild logs ps

up:           ## Start the full stack (build if needed)
	docker compose up -d --build

down:         ## Stop and remove containers, networks (keeps volumes)
	docker compose down

stop:         ## Stop containers without removing them
	docker compose stop

start:        ## Start previously stopped containers
	docker compose start

restart:      ## Restart all services
	docker compose restart

build:        ## Build images
	docker compose build

rebuild:      ## Rebuild without cache
	docker compose build --no-cache

logs:         ## Tail logs from all services
	docker compose logs -f --tail=200

ps:           ## List running services
	docker compose ps

# --- Shells ---
.PHONY: shell-app shell-front shell-db

shell-app:    ## Bash into the PHP/Laravel container
	docker compose exec app sh

shell-front:  ## Shell into the Vite frontend container
	docker compose exec frontend sh

shell-db:     ## MySQL CLI inside the db container
	docker compose exec mysql mysql -u familyknot -psecret familyknot

# --- Laravel utilities ---
.PHONY: migrate fresh seed key tinker

migrate:      ## Run pending migrations
	docker compose exec app php artisan migrate

fresh:        ## Drop all tables and re-migrate
	docker compose exec app php artisan migrate:fresh

seed:         ## Run database seeders
	docker compose exec app php artisan db:seed

key:          ## Generate a new APP_KEY
	docker compose exec app php artisan key:generate

tinker:       ## Open Laravel Tinker REPL
	docker compose exec app php artisan tinker

# --- Tests ---
.PHONY: test test-back test-front

test: test-back test-front  ## Run all tests (backend + frontend)

test-back:    ## Run Laravel/Pest tests
	docker compose exec app php artisan test

test-front:   ## Run Vitest suite
	docker compose exec frontend npm test

# --- Help ---
.PHONY: help
help:         ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
