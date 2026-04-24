# SkillValue AI - Development Commands
ROOT := $(shell pwd)

.PHONY: help install dev backend mobile test lint format clean

help:
	@echo "SkillValue AI - Available Commands:"
	@echo "===================================="
	@echo "make install    - Install dependencies"
	@echo "make dev        - Start development"
	@echo "make backend    - Start backend only"
	@echo "make mobile     - Start mobile (Expo)"
	@echo "make test       - Run tests"
	@echo "make api-test  - Run API tests"
	@echo "make lint      - Run linter"
	@echo "make format    - Format code"

install:
	@echo "📦 Installing dependencies..."
	cd $(ROOT) && npm install
	cd $(ROOT)/mobile && npm install

dev:
	@echo "🔧 Starting development..."
	cd $(ROOT) && npm run dev

backend:
	@echo "🖥️  Starting backend..."
	PORT=3001 npx tsx watch src/server.ts

mobile:
	@echo "📱 Starting mobile app..."
	cd $(ROOT)/mobile && npx expo start

test:
	@echo "🧪 Running tests..."
	cd $(ROOT) && npm test

api-test:
	@echo "🧪 Running API tests..."
	@echo ""
	bash $(ROOT)/scripts/test-api.sh

api-interactive:
	@echo "🧪 Running interactive API simulator..."
	node $(ROOT)/scripts/user-simulator.mjs

lint:
	@echo "🔍 Running linter..."
	cd $(ROOT) && npx eslint src --ext .ts
	cd $(ROOT)/mobile && npx eslint . --ext .ts,.tsx

format:
	@echo "🎨 Formatting code..."
	cd $(ROOT) && npx prettier --write "src/**/*.ts"
	cd $(ROOT)/mobile && npx prettier --write "**/*.{ts,tsx}"

typecheck:
	@echo "🔎 Type checking..."
	cd $(ROOT) && npx tsc --noEmit
	cd $(ROOT)/mobile && npx tsc --noEmit

clean:
	@echo "🧹 Cleaning..."
	rm -rf $(ROOT)/node_modules/.cache
	rm -rf $(ROOT)/mobile/node_modules/.cache

# Quick test shortcuts
tapi: api-test
ti: api-interactive
tc: typecheck
