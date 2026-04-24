#!/bin/bash
# ============================================
# Setup GitHub Secrets and Variables (CI/Non-interactive)
# Usage: source .env && ./scripts/setup-github-secrets-ci.sh
# ============================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO="${GITHUB_REPO:-earthkingdomuniverse-cell/workai}"
ENVIRONMENT="${DEPLOY_ENV:-production}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GitHub Secrets Setup (CI Mode)${NC}"
echo -e "${BLUE}  Repository: $REPO${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    exit 1
fi

# Function to set environment secret from env var
set_secret_from_env() {
    local secret_name=$1
    local env_var_name=$2
    local required=${3:-false}

    local value="${!env_var_name:-}"

    if [ -z "$value" ]; then
        if [ "$required" = true ]; then
            echo -e "${RED}❌ Required secret $secret_name is not set${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️ Skipping optional secret: $secret_name${NC}"
            return 0
        fi
    fi

    if gh secret set "$secret_name" -b "$value" --env "$ENVIRONMENT" --repo "$REPO" 2>/dev/null; then
        echo -e "${GREEN}✅ Set: $secret_name${NC}"
    else
        echo -e "${RED}❌ Failed: $secret_name${NC}"
        return 1
    fi
}

# Function to set environment variable from env var
set_variable_from_env() {
    local var_name=$1
    local env_var_name=$2
    local default_value=${3:-}

    local value="${!env_var_name:-$default_value}"

    if [ -z "$value" ]; then
        echo -e "${YELLOW}⚠️ Skipping variable: $var_name${NC}"
        return 0
    fi

    if gh variable set "$var_name" -b "$value" --env "$ENVIRONMENT" --repo "$REPO" 2>/dev/null; then
        echo -e "${GREEN}✅ Set: $var_name = $value${NC}"
    else
        echo -e "${RED}❌ Failed: $var_name${NC}"
        return 1
    fi
}

echo -e "${BLUE}🔐 Setting up SSH Deployment Secrets...${NC}"
set_secret_from_env "PROD_HOST" "PROD_HOST" true
set_secret_from_env "PROD_USER" "PROD_USER" true
set_secret_from_env "PROD_SSH_KEY" "PROD_SSH_KEY" true
set_secret_from_env "PROD_SSH_PORT" "PROD_SSH_PORT" false

echo ""
echo -e "${BLUE}🔑 Setting up Application Secrets...${NC}"
set_secret_from_env "JWT_SECRET" "JWT_SECRET" true
set_secret_from_env "DATABASE_URL" "DATABASE_URL" true
set_secret_from_env "REDIS_URL" "REDIS_URL" false

echo ""
echo -e "${BLUE}📊 Setting up Supabase Secrets...${NC}"
set_secret_from_env "SUPABASE_URL" "SUPABASE_URL" false
set_secret_from_env "SUPABASE_ANON_KEY" "SUPABASE_ANON_KEY" false
set_secret_from_env "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_SERVICE_ROLE_KEY" false

echo ""
echo -e "${BLUE}🤖 Setting up AI/ML Secrets...${NC}"
set_secret_from_env "OPENAI_API_KEY" "OPENAI_API_KEY" false

echo ""
echo -e "${BLUE}💳 Setting up Payment Secrets...${NC}"
set_secret_from_env "STRIPE_SECRET_KEY" "STRIPE_SECRET_KEY" false
set_secret_from_env "STRIPE_WEBHOOK_SECRET" "STRIPE_WEBHOOK_SECRET" false

echo ""
echo -e "${BLUE}📧 Setting up Email Secrets...${NC}"
set_secret_from_env "SMTP_HOST" "SMTP_HOST" false
set_secret_from_env "SMTP_PORT" "SMTP_PORT" false
set_secret_from_env "SMTP_USER" "SMTP_USER" false
set_secret_from_env "SMTP_PASS" "SMTP_PASS" false

echo ""
echo -e "${BLUE}📈 Setting up Monitoring Secrets...${NC}"
set_secret_from_env "SENTRY_DSN" "SENTRY_DSN" false

echo ""
echo -e "${BLUE}⚙️ Setting up Environment Variables...${NC}"
set_variable_from_env "APP_URL" "APP_URL" ""
set_variable_from_env "APP_PORT" "APP_PORT" "3000"
set_variable_from_env "CORS_ORIGIN" "CORS_ORIGIN" "*"
set_variable_from_env "LOG_LEVEL" "LOG_LEVEL" "info"
set_variable_from_env "JWT_EXPIRES_IN" "JWT_EXPIRES_IN" "7d"
set_variable_from_env "APP_NAME" "APP_NAME" "SkillValue AI"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To verify, run:"
echo "  gh secret list --env $ENVIRONMENT --repo $REPO"
echo "  gh variable list --env $ENVIRONMENT --repo $REPO"
