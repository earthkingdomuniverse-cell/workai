# WorkAI Go-Live Readiness Master Checklist

## Purpose

This is the master launch readiness checklist for WorkAI 1.0.

## Launch readiness categories

1. App readiness
2. Backend readiness
3. Schema readiness
4. Environment and configuration readiness
5. Auth readiness
6. Onboarding readiness
7. Offers / requests / proposals / deals readiness
8. AI readiness
9. Trust / risk / fraud readiness
10. Admin readiness
11. Analytics readiness
12. Monetization readiness
13. Support readiness
14. Incident readiness
15. Rollback readiness

## Status legend

- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`

## Current launch posture

Recommended launch mode: soft launch / limited release.

Rationale:

- Core app and backend foundation exist.
- Several modules remain mock-first or need production hardening.
- Payment, persistent moderation, real-time messaging, and mobile runtime packaging still need production work.

## Must-have before broader launch

- Confirm backend build and typecheck pass.
- Confirm mobile package/runtime can boot with Expo.
- Confirm auth and role guards are stable.
- Confirm offers, requests, proposals, and deals are usable end-to-end.
- Confirm mock mode flags are documented and intentional.
- Confirm admin/operator access is protected.
- Confirm AI endpoints have safe fallback behavior.
- Confirm incident and rollback notes exist.

## Historical note

This checklist was moved from the repository root into `docs/launch/` during the WorkAI documentation organization batch. The original detailed checklist remains available in git history.
