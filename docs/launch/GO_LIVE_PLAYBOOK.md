# WorkAI Go-Live Playbook

## Purpose

Step-by-step playbook for the WorkAI 1.0 launch team.

## T-7 days checklist

### Launch blocker verification

- All must-have readiness items are confirmed.
- No high-severity bugs are open.
- Performance thresholds are acceptable.
- Security-sensitive flows have been checked.

### Infrastructure

- Production or staging database is ready, or mock mode is intentionally enabled.
- Environment variables are configured.
- Logging and health checks are enabled.
- Backup or rollback procedure is documented if persistence is enabled.

### Communication preparation

- Launch announcement drafted.
- Internal team notified.
- Support escalation path defined.
- Rollback procedure documented.

### Demo and test

- End-to-end user flow tested.
- Admin/operator flow tested.
- AI features tested.
- Payment or pseudo-payment flow tested.

## T-3 days checklist

- Full functional test passed.
- Crash-free smoke test passed.
- Critical screens verified.
- Critical API endpoints verified.
- Version finalized.
- Changelog prepared.
- First 100 users contact list ready.
- Analytics and error monitoring accessible.

## T-1 day checklist

- Final build deployed to staging.
- Final sanity check passed.
- Launch team has app installed.
- Issue reporting channel confirmed.
- On-call schedule confirmed.

## Launch day checklist

| Time | Action | Owner |
| --- | --- | --- |
| T-1h | Final build check | Dev |
| T-30m | Deploy and verify | Dev |
| T-0 | App available | Dev |
| T+1h | Monitor signup rate | Founder |
| T+2h | Monitor errors | Dev |
| T+4h | First feedback check | Founder |
| T+12h | Day 0 summary | Team |

## Metrics to watch

- Signups
- App crashes
- API errors
- App load time
- First offers
- First requests
- Proposals
- Deals

## T+1 review

- Total signups
- App opens
- First actions
- Crash count
- API error count
- User feedback
- Bugs fixed

## T+3 review

- Signups
- Active offers
- Active requests
- D1 retention
- Onboarding completion
- Manual invite progress
- User feedback themes

## T+7 review

- Signups
- First offers
- First requests
- Proposals
- Deals
- Reviews
- Marketplace activity quality

## Escalation levels

| Issue level | Response target | Example |
| --- | --- | --- |
| Critical | Immediate | Crash, data loss, security issue |
| High | Same day | Broken core flow |
| Medium | Next day | UX issue or non-critical bug |
| Low | Backlog | Polish or copy issue |

## Rollback conditions

Rollback or pause launch if:

- Crash rate becomes unacceptable.
- Critical security bug is found.
- Core deal/payment flow breaks.
- Data loss is observed.
- Admin/operator cannot manage risk or disputes.

## Historical note

This playbook was moved from the repository root into `docs/launch/` during the WorkAI documentation organization batch. The original detailed playbook remains available in git history.
