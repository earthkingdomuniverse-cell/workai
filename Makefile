# SkillValue AI - Development Commands

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
	cd /Users/lha/Documents/workai && npm install
	cd /Users/lha/Documents/workai/mobile && npm install

dev:
	@echo "🔧 Starting development..."
	cd /Users/lha/Documents/workai && npm run dev

backend:
	@echo "🖥️  Starting backend..."
	cd /Users/lha/Documents/workai && npx tsx watch src/server.ts

mobile:
	@echo "📱 Starting mobile app..."
	cd /Users/lha/Documents/workai/mobile && npx expo start

test:
	@echo "🧪 Running tests..."
	cd /Users/lha/Documents/workai && npm test

api-test:
	@echo "🧪 Running API tests..."
	@echo ""
	bash /Users/lha/Documents/workai/scripts/test-api.sh

api-interactive:
	@echo "🧪 Running interactive API simulator..."
	node /Users/lha/Documents/workai/scripts/user-simulator.mjs

lint:
	@echo "🔍 Running linter..."
	cd /Users/lha/Documents/workai && npx eslint src --ext .ts
	cd /Users/lha/Documents/workai/mobile && npx eslint . --ext .ts,.tsx

format:
	@echo "🎨 Formatting code..."
	cd /Users/lha/Documents/workai && npx prettier --write "src/**/*.ts"
	cd /Users/lha/Documents/workai/mobile && npx prettier --write "**/*.{ts,tsx}"

typecheck:
	@echo "🔎 Type checking..."
	cd /Users/lha/Documents/workai && npx tsc --noEmit
	cd /Users/lha/Documents/workai/mobile && npx tsc --noEmit

clean:
	@echo "🧹 Cleaning..."
	rm -rf /Users/lha/Documents/workai/node_modules/.cache
	rm -rf /Users/lha/Documents/workai/mobile/node_modules/.cache

# Quick test shortcuts
tapi: api-test
ti: api-interactive
tc: typecheck