# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD, security, and automation.

## Workflows

### 🚀 Deploy to Production (`deploy.yml`)

**Purpose**: Build, push, and deploy the application to production server.

**Triggers**:

- Push to `main` branch
- Manual dispatch (workflow_dispatch)

**Jobs**:

1. **Build & Push**: Builds Docker image and pushes to GHCR
2. **Deploy**: SSH into production server and deploy with secret injection
3. **Verify**: Runs health checks and verifies deployment

**Required Secrets** (Environment: `production`):

```
PROD_HOST          # Server IP/hostname
PROD_USER          # SSH username
PROD_SSH_KEY       # SSH private key
PROD_SSH_PORT      # SSH port (default: 22)
JWT_SECRET         # JWT signing secret
DATABASE_URL       # PostgreSQL connection string
SUPABASE_URL       # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY  # Supabase service role key
```

**Optional Secrets**:

```
REDIS_URL, OPENAI_API_KEY, STRIPE_SECRET_KEY,
STRIPE_WEBHOOK_SECRET, SMTP_HOST, SMTP_PORT,
SMTP_USER, SMTP_PASS, SENTRY_DSN
```

**Required Variables** (Environment: `production`):

```
APP_URL            # Public app URL
APP_PORT           # Port (default: 3000)
CORS_ORIGIN        # Allowed CORS origins
LOG_LEVEL          # Logging level
APP_NAME           # Application name
```

### 🐳 Docker Build & Push (`docker-ghcr.yml`)

**Purpose**: Build and push Docker images to GitHub Container Registry.

**Features**:

- Multi-platform builds (AMD64, ARM64)
- Image caching for faster builds
- Security scanning with Trivy
- Build attestations
- Automatic tagging (semver, sha, branch, latest)

**Triggers**:

- Push to `main` or `develop`
- Tags starting with `v`
- Pull requests (build only, no push)
- Manual dispatch

### 🔒 Security Workflows

#### CodeQL (`codeql.yml`)

- Runs security analysis on code
- Triggered on push to main and weekly schedule

#### Dependency Update (`deps-update.yml`)

- Automated dependency updates via Dependabot
- Creates PRs for outdated dependencies

## Setup Instructions

### 1. Configure GitHub Environment

```bash
# Create production environment
gh api repos/:owner/:repo/environments -X POST -f name=production
```

### 2. Set Up Secrets

**Interactive Mode** (Recommended):

```bash
./scripts/setup-github-secrets.sh
```

**CI Mode** (From .env file):

```bash
# Edit .env file with your secrets
source .env
./scripts/setup-github-secrets-ci.sh
```

### 3. Verify Setup

```bash
# List secrets
gh secret list --env production --repo <owner>/<repo>

# List variables
gh variable list --env production --repo <owner>/<repo>
```

### 4. Test Deployment

Trigger manually:

```bash
gh workflow run deploy.yml --repo <owner>/<repo>
```

Or via GitHub UI:

- Go to Actions → Deploy to Production → Run workflow

## Secrets & Variables Reference

### Repository Secrets (Sensitive)

These should NEVER be committed to git. Set via GitHub UI or CLI.

| Secret                      | Required | Description                   |
| --------------------------- | -------- | ----------------------------- |
| `PROD_HOST`                 | ✅       | Production server hostname/IP |
| `PROD_USER`                 | ✅       | SSH username for deployment   |
| `PROD_SSH_KEY`              | ✅       | SSH private key (pem format)  |
| `JWT_SECRET`                | ✅       | JWT signing key               |
| `DATABASE_URL`              | ✅       | Database connection string    |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅       | Supabase admin key            |
| `OPENAI_API_KEY`            | ❌       | OpenAI API access             |
| `STRIPE_SECRET_KEY`         | ❌       | Stripe payments               |
| `SENTRY_DSN`                | ❌       | Error tracking                |

### Repository Variables (Non-sensitive)

| Variable      | Default       | Description            |
| ------------- | ------------- | ---------------------- |
| `APP_URL`     | -             | Public application URL |
| `APP_PORT`    | 3000          | Container port         |
| `CORS_ORIGIN` | \*            | Allowed origins        |
| `LOG_LEVEL`   | info          | Logging level          |
| `APP_NAME`    | SkillValue AI | App name               |

## Troubleshooting

### Deployment Fails

1. Check SSH connectivity:

   ```bash
   ssh -i ~/.ssh/key user@host "docker ps"
   ```

2. Verify secrets are set:

   ```bash
   gh secret list --env production
   ```

3. Check workflow logs in GitHub Actions

### Docker Build Fails

1. Check Dockerfile syntax:

   ```bash
   docker build -t test .
   ```

2. Clear build cache:
   ```bash
   docker builder prune
   ```

### Container Won't Start

1. Check env file on server:

   ```bash
   ssh user@host "cat ~/workai-config/.env"
   ```

2. View container logs:

   ```bash
   docker logs workai-backend
   ```

3. Check health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

## Security Best Practices

1. **Rotate secrets regularly** (every 90 days)
2. **Use environment-specific secrets** (don't share prod/staging)
3. **Never log secrets** in workflow output
4. **Use least-privilege** SSH keys (deploy-only user)
5. **Enable branch protection** on main
6. **Require reviews** before deployment

## Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
