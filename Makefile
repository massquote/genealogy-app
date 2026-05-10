SHELL := /bin/bash

# --- Lifecycle ---
.PHONY: up down stop start restart build rebuild logs ps health

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

health:       ## Hit the API health endpoint
	@curl -sS http://localhost:19000/api/v1/health | python3 -m json.tool 2>/dev/null || curl -sS http://localhost:19000/api/v1/health

# --- Shells ---
.PHONY: shell-app shell-front shell-db

shell-app:    ## Bash into the PHP/Laravel container
	docker compose exec app sh

shell-front:  ## Shell into the Vite frontend container
	docker compose exec frontend sh

shell-db:     ## MySQL CLI inside the db container
	docker compose exec mysql mysql -u familyknot -psecret familyknot

# --- Laravel utilities ---
.PHONY: migrate fresh seed demo key tinker fix-perms

migrate:      ## Run pending migrations
	docker compose exec app php artisan migrate

fresh:        ## Drop all tables and re-migrate (destructive)
	docker compose exec app php artisan migrate:fresh

seed:         ## Run database seeders
	docker compose exec app php artisan db:seed

demo:         ## Reset DB to a fresh demo state (migrate:fresh + seed)
	docker compose exec app php artisan migrate:fresh --seed --force

key:          ## Generate a new APP_KEY
	docker compose exec app php artisan key:generate

tinker:       ## Open Laravel Tinker REPL
	docker compose exec app php artisan tinker

fix-perms:    ## Reset ownership of backend files to host user (after artisan make:)
	docker compose exec app chown -R 1000:1000 /var/www/html

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
	@echo "FamilyKnot — available make targets:"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-13s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Quick start:  make up && make seed"
	@echo "Reset demo:   make demo"

.DEFAULT_GOAL := help
