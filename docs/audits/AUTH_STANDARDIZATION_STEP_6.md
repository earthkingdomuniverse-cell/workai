# WorkAI Auth Standardization Audit - Step 6

## Purpose

Document the authentication and authorization standardization work completed after notification, deal, review, withdraw, and admin hardening.

This audit exists to make runtime verification explicit before production hardening.

---

## Summary

Backend auth now has a shared helper:

```ts
requireAuthenticated(request, reply?)
```

This helper provides a single behavior for routes that require a real logged-in user:

- missing token -> `401 AUTHENTICATION_ERROR`
- guest user -> `401 AUTHENTICATION_ERROR`
- valid token -> returns `AuthContext`

Authorization now uses this helper before checking roles:

- missing token -> `401 AUTHENTICATION_ERROR`
- valid token with insufficient role -> `403 ACCESS_DENIED`
- valid operator/admin token -> request continues

---

## Files changed

### `src/lib/auth.ts`

Added:

```ts
export async function requireAuthenticated(request, reply?)
```

Updated:

```ts
authorize(request, reply, roles)
```

Now `authorize()` throws `AppError` instead of calling `reply.status(403).send(...)` without stopping request execution.

### `src/routes/notifications.ts`

Removed route-local auth helper.

Now all notification endpoints use:

```ts
requireAuthenticated(request, reply)
```

Covered endpoints:

- `GET /notifications`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`
- `DELETE /notifications/:id`
- `GET /notifications/unread-count`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`

### `src/routes/deals.ts`

Removed route-local auth helper.

Now deal endpoints use:

```ts
requireAuthenticated(request, reply)
```

Covered endpoints:

- `GET /deals`
- `POST /deals`
- `GET /deals/:id`
- `POST /deals/:id/fund`
- `POST /deals/:id/submit`
- `POST /deals/:id/release`
- `POST /deals/:id/dispute`

### `src/routes/reviews.ts`

Removed route-local auth helper for review creation.

Now `POST /reviews` uses:

```ts
requireAuthenticated(request, reply)
```

Read endpoints remain public where appropriate:

- `GET /reviews`
- `GET /reviews/aggregate/:subjectType/:subjectId`
- `GET /reviews/by-user/:id`
- `GET /reviews/by-offer/:id`

### `src/routes/withdraw.ts`

Removed route-local auth helper and nonstandard `AUTH_ERROR` code.

Now withdraw endpoints use:

```ts
requireAuthenticated(request, reply)
```

Covered endpoints:

- `POST /withdraw`
- `GET /withdraw`

---

## Expected runtime behavior

### Missing token

These endpoints should return `401 AUTHENTICATION_ERROR`:

```bash
curl http://localhost:3000/api/v1/notifications
curl http://localhost:3000/api/v1/deals
curl http://localhost:3000/api/v1/withdraw
```

For review creation:

```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H 'Content-Type: application/json' \
  -d '{"dealId":"deal_test","subjectType":"user","subjectId":"user_test","rating":5,"comment":"Great work and clear communication."}'
```

Expected:

- `401 AUTHENTICATION_ERROR`

### Member accessing admin

```bash
curl http://localhost:3000/api/v1/admin/overview \
  -H "Authorization: Bearer $MEMBER_TOKEN"
```

Expected:

- `403 ACCESS_DENIED`

### Missing token accessing admin

```bash
curl http://localhost:3000/api/v1/admin/overview
```

Expected:

- `401 AUTHENTICATION_ERROR`

### Operator/admin accessing admin

```bash
curl http://localhost:3000/api/v1/admin/overview \
  -H "Authorization: Bearer $OPERATOR_OR_ADMIN_TOKEN"
```

Expected:

- `200`
- normalized `{ data, meta }` response

---

## Pass criteria

Auth standardization is considered passing when:

- backend typecheck passes.
- backend build passes.
- missing-token requests to protected endpoints return `401`.
- insufficient-role requests to admin endpoints return `403`.
- protected endpoints no longer maintain duplicate local auth helpers.
- public read endpoints remain accessible where product intent allows public reads.

---

## Follow-up candidates

1. Replace remaining route-local auth checks in other modules if found.
2. Add automated auth contract tests for `401` vs `403` behavior.
3. Add OpenAPI docs or endpoint comments that classify routes as public, authenticated, or role-protected.
4. Add test fixtures for member/operator/admin tokens.
