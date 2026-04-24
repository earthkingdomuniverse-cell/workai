#!/bin/bash
# ============================================
# Setup GitHub Secrets and Variables
# This script configures all required secrets for production deployment
# ============================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO="${GITHUB_REPO:-earthkingdomuniverse-cell/workai}"
ENVIRONMENT="${DEPLOY_ENV:-production}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GitHub Secrets & Variables Setup${NC}"
echo -e "${BLUE}  Repository: $REPO${NC}"
echo -e "${BLUE}  Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
echo ""

# Function to prompt for secret
prompt_secret() {
    local name=$1
    local description=$2
    local required=${3:-false}
    local sensitive=${4:-true}

    echo -e "${YELLOW}$description${NC}"
    if [ "$sensitive" = true ]; then
        read -rsp "Enter $name (press Enter to skip${required:+ [REQUIRED]}): " value
    else
        read -rp "Enter $name (press Enter to skip${required:+ [REQUIRED]}): " value
    fi
    echo ""

    if [ -z "$value" ] && [ "$required" = true ]; then
        echo -e "${RED}❌ $name is required${NC}"
        exit 1
    fi

    echo "$value"
}

# Function to set repository secret
set_repo_secret() {
    local name=$1
    local value=$2

    if [ -n "$value" ]; then
        if gh secret set "$name" -b "$value" --repo "$REPO" 2>/dev/null; then
            echo -e "${GREEN}✅ Set repository secret: $name${NC}"
        else
            echo -e "${RED}❌ Failed to set: $name${NC}"
        fi
    fi
}

# Function to set environment secret
set_env_secret() {
    local name=$1
    local value=$2

    if [ -n "$value" ]; then
        if gh secret set "$name" -b "$value" --env "$ENVIRONMENT" --repo "$REPO" 2>/dev/null; then
            echo -e "${GREEN}✅ Set environment secret: $name${NC}"
        else
            echo -e "${RED}❌ Failed to set: $name${NC}"
        fi
    fi
}

# Function to set repository variable
set_repo_variable() {
    local name=$1
    local value=$2

    if [ -n "$value" ]; then
        if gh variable set "$name" -b "$value" --repo "$REPO" 2>/dev/null; then
            echo -e "${GREEN}✅ Set repository variable: $name${NC}"
        else
            echo -e "${RED}❌ Failed to set: $name${NC}"
        fi
    fi
}

# Function to set environment variable
set_env_variable() {
    local name=$1
    local value=$2

    if [ -n "$value" ]; then
        if gh variable set "$name" -b "$value" --env "$ENVIRONMENT" --repo "$REPO" 2>/dev/null; then
            echo -e "${GREEN}✅ Set environment variable: $name${NC}"
        else
            echo -e "${RED}❌ Failed to set: $name${NC}"
        fi
    fi
}

# ============================================
# SSH DEPLOYMENT SECRETS (Required)
# ============================================
echo -e "${BLUE}🔐 SSH Deployment Configuration${NC}"
echo "----------------------------------------"

PROD_HOST=$(prompt_secret "PROD_HOST" "Production server IP or hostname" true false)
PROD_USER=$(prompt_secret "PROD_USER" "SSH username (e.g., ubuntu, root)" true false)
PROD_SSH_KEY=$(prompt_secret "PROD_SSH_KEY" "SSH private key (paste entire key)" true)
PROD_SSH_PORT=$(prompt_secret "PROD_SSH_PORT" "SSH port (default: 22)" false false)
PROD_SSH_PORT=${PROD_SSH_PORT:-22}

set_env_secret "PROD_HOST" "$PROD_HOST"
set_env_secret "PROD_USER" "$PROD_USER"
set_env_secret "PROD_SSH_KEY" "$PROD_SSH_KEY"
set_env_secret "PROD_SSH_PORT" "$PROD_SSH_PORT"

echo ""

# ============================================
# APPLICATION SECRETS
# ============================================
echo -e "${BLUE}🔑 Application Secrets${NC}"
echo "----------------------------------------"

JWT_SECRET=$(prompt_secret "JWT_SECRET" "JWT Secret Key (generate with: openssl rand -base64 32)" true)
DATABASE_URL=$(prompt_secret "DATABASE_URL" "Database connection string (e.g., postgresql://user:pass@host/db)" true)
REDIS_URL=$(prompt_secret "REDIS_URL" "Redis connection URL (optional)" false)

set_env_secret "JWT_SECRET" "$JWT_SECRET"
set_env_secret "DATABASE_URL" "$DATABASE_URL"
set_env_secret "REDIS_URL" "$REDIS_URL"

echo ""

# ============================================
# SUPABASE SECRETS
# ============================================
echo -e "${BLUE}📊 Supabase Configuration${NC}"
echo "----------------------------------------"

SUPABASE_URL=$(prompt_secret "SUPABASE_URL" "Supabase Project URL" false false)
SUPABASE_ANON_KEY=$(prompt_secret "SUPABASE_ANON_KEY" "Supabase Anon Key" false)
SUPABASE_SERVICE_ROLE_KEY=$(prompt_secret "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role Key" false)

set_env_secret "SUPABASE_URL" "$SUPABASE_URL"
set_env_secret "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
set_env_secret "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"

echo ""

# ============================================
# AI/ML API KEYS
# ============================================
echo -e "${BLUE}🤖 AI/ML API Configuration${NC}"
echo "----------------------------------------"

OPENAI_API_KEY=$(prompt_secret "OPENAI_API_KEY" "OpenAI API Key (sk-...)" false)

set_env_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"

echo ""

# ============================================
# PAYMENT SECRETS (Optional)
# ============================================
echo -e "${BLUE}💳 Payment Configuration (Optional)${NC}"
echo "----------------------------------------"

STRIPE_SECRET_KEY=$(prompt_secret "STRIPE_SECRET_KEY" "Stripe Secret Key (sk_...)" false)
STRIPE_WEBHOOK_SECRET=$(prompt_secret "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret (whsec_...)" false)

set_env_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
set_env_secret "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

echo ""

# ============================================
# EMAIL SECRETS (Optional)
# ============================================
echo -e "${BLUE}📧 Email Configuration (Optional)${NC}"
echo "----------------------------------------"

SMTP_HOST=$(prompt_secret "SMTP_HOST" "SMTP Host (e.g., smtp.gmail.com)" false false)
SMTP_PORT=$(prompt_secret "SMTP_PORT" "SMTP Port (e.g., 587)" false false)
SMTP_USER=$(prompt_secret "SMTP_USER" "SMTP Username" false false)
SMTP_PASS=$(prompt_secret "SMTP_PASS" "SMTP Password" false)

set_env_secret "SMTP_HOST" "$SMTP_HOST"
set_env_secret "SMTP_PORT" "$SMTP_PORT"
set_env_secret "SMTP_USER" "$SMTP_USER"
set_env_secret "SMTP_PASS" "$SMTP_PASS"

echo ""

# ============================================
# MONITORING SECRETS (Optional)
# ============================================
echo -e "${BLUE}📈 Monitoring Configuration (Optional)${NC}"
echo "----------------------------------------"

SENTRY_DSN=$(prompt_secret "SENTRY_DSN" "Sentry DSN URL" false false)

set_env_secret "SENTRY_DSN" "$SENTRY_DSN"

echo ""

# ============================================
# ENVIRONMENT VARIABLES
# ============================================
echo -e "${BLUE}⚙️ Environment Variables${NC}"
echo "----------------------------------------"

APP_URL=$(prompt_secret "APP_URL" "Application public URL (e.g., https://api.skillvalue.ai)" false false)
APP_PORT=$(prompt_secret "APP_PORT" "Application port (default: 3000)" false false)
APP_PORT=${APP_PORT:-3000}
CORS_ORIGIN=$(prompt_secret "CORS_ORIGIN" "CORS allowed origins (e.g., https://skillvalue.ai)" false false)
LOG_LEVEL=$(prompt_secret "LOG_LEVEL" "Log level (debug|info|warn|error, default: info)" false false)
LOG_LEVEL=${LOG_LEVEL:-info}
JWT_EXPIRES_IN=$(prompt_secret "JWT_EXPIRES_IN" "JWT expiration (e.g., 7d, 24h)" false false)
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
APP_NAME=$(prompt_secret "APP_NAME" "Application name" false false)
APP_NAME=${APP_NAME:-"SkillValue AI"}

set_env_variable "APP_URL" "$APP_URL"
set_env_variable "APP_PORT" "$APP_PORT"
set_env_variable "CORS_ORIGIN" "$CORS_ORIGIN"
set_env_variable "LOG_LEVEL" "$LOG_LEVEL"
set_env_variable "JWT_EXPIRES_IN" "$JWT_EXPIRES_IN"
set_env_variable "APP_NAME" "$APP_NAME"

echo ""

# ============================================
# REPOSITORY VARIABLES
# ============================================
echo -e "${BLUE}📋 Repository Variables${NC}"
echo "----------------------------------------"

# Set repository-level variables (available to all workflows)
set_repo_variable "DEFAULT_NODE_VERSION" "20.19.0"
set_repo_variable "REGISTRY" "ghcr.io"

echo ""

# ============================================
# Summary
# ============================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "The following have been configured:"
echo "  - SSH Deployment Secrets"
echo "  - Application Secrets (JWT, Database)"
echo "  - Supabase Configuration"
echo "  - AI API Keys"
echo "  - Payment Configuration (if provided)"
echo "  - Email Configuration (if provided)"
echo "  - Monitoring Configuration (if provided)"
echo "  - Environment Variables"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Verify secrets: gh secret list --env $ENVIRONMENT --repo $REPO"
echo "  2. Verify variables: gh variable list --env $ENVIRONMENT --repo $REPO"
echo "  3. Test deployment: Trigger the 'Deploy to Production' workflow"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  - GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets"
echo "  - GitHub Variables: https://docs.github.com/en/actions/learn-github-actions/variables"
