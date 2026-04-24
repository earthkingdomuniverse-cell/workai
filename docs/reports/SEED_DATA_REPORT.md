# WorkAI Seed Data Report

## Purpose

Report for WorkAI seed-data scripts and staging/demo data readiness.

## Files referenced

- `scripts/seed-production-data.ts`
- `scripts/production-seed.ts`

## Seed script capabilities

- Creates users with realistic profiles.
- Generates skill taxonomy.
- Creates offers.
- Creates requests.
- Creates proposals.
- Uses backend API endpoints.
- Handles existing users where supported.
- Supports configurable counts through CLI args.

## Data quality notes

- Professional bio templates.
- Realistic pricing ranges.
- Skill distribution across categories.
- Location diversity.
- Trust score examples.

## Requirements

- Backend server running.
- Supabase/service credentials if using persistent database mode.
- OpenAI API key optional for AI-generated content.
- Payment provider keys optional if payment seeding is enabled.

## Example commands

```bash
npm run build
npm start
```

```bash
npx tsx scripts/seed-production-data.ts
npx tsx scripts/seed-production-data.ts --users=50 --offers=75 --requests=30 --proposals=40
```

## Verification

```bash
curl http://localhost:3000/api/v1/offers
curl http://localhost:3000/api/v1/requests
curl http://localhost:3000/api/v1/deals
```

## Historical note

This report was moved from the repository root into `docs/reports/` during the WorkAI documentation organization batch. The original detailed SkillValue AI seed report remains available in git history.
