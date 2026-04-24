# Database Seeding

## Available Scripts

```bash
# Seed development database
npm run db:seed:dev

# Seed test database
npm run db:seed:test

# Reset test database
npm run db:reset:test

# Full database seed (with clear)
npm run db:seed
```

## Scripts

| Script                | Purpose           | Environment |
| --------------------- | ----------------- | ----------- |
| `seed-database.ts`    | Main seed logic   | All         |
| `seed-development.ts` | Development seed  | dev         |
| `seed-test.ts`        | Minimal test seed | test        |

## Data Generated

- **Users**: 25+ (5 standard + 20 random)
- **Assessments**: 15+ (10 published + 5 draft)
- **Results**: 25+ (15 passed + 10 failed)
- **Organizations**: 3 (with members)

## Test Accounts

```
Candidate Free:    candidate_free@example.com    / Test@123456
Candidate Premium: candidate_premium@example.com / Test@123456
Employer:          employer_basic@example.com  / Test@123456
Admin:             admin@example.com            / Admin@Secure789
Super Admin:       super_admin@example.com    / Admin@Secure789
```

## Adding New Seeds

1. Create factory in `/tests/factories/`
2. Add seed function to `seed-database.ts`
3. Run `npm run db:seed:dev`
