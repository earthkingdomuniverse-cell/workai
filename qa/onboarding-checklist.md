# Onboarding QA Checklist

Date: 2026-04-22

Scope:

- Onboarding mobile flow
- Onboarding local draft persistence
- Onboarding completion sync with backend auth profile

## Flow Checks

### 1. intro -> role-select -> profile-setup -> skills-setup -> goals-setup đi hết được

- Status: PASS (code-path verification)
- Verified in:
  - `mobile/app/(onboarding)/intro.tsx`
  - `mobile/app/(onboarding)/role-select.tsx`
  - `mobile/app/(onboarding)/profile-setup.tsx`
  - `mobile/app/(onboarding)/skills-setup.tsx`
  - `mobile/app/(onboarding)/goals-setup.tsx`
  - `mobile/app/(onboarding)/_layout.tsx`
- Result:
  - Intro điều hướng đúng sang role select
  - Role select điều hướng đúng sang profile setup
  - Profile setup điều hướng đúng sang skills setup
  - Skills setup điều hướng đúng sang goals setup
  - Goals setup complete/skip điều hướng đúng sang `/(tabs)/home`
  - Onboarding layout không còn là placeholder block screen, đã dùng `Stack`

### 2. Validation mỗi bước

- Status: PASS (partial runtime, partial code-path)
- Checked:
  - role-select: không thể continue nếu chưa chọn role
  - profile-setup: bắt buộc `displayName`
  - skills-setup: nút continue bị disable nếu chưa có skill
  - goals-setup: không bắt buộc goals, cho complete hoặc skip

### 3. State không mất giữa các bước

- Status: PASS (code-path verification)
- Verified in:
  - `mobile/src/store/onboarding-store.ts`
- Result:
  - role/profile/skills/goals đều được persist vào `onboarding-storage`
  - Mỗi step đọc lại dữ liệu từ onboarding store khi mount

### 4. complete onboarding redirect đúng

- Status: PASS (code-path verification)
- Verified in:
  - `mobile/app/(onboarding)/goals-setup.tsx`
- Result:
  - Complete setup redirect về `/(tabs)/home`
  - Skip ở bước cuối cũng redirect về `/(tabs)/home`

### 5. onboardingCompleted sync đúng với backend nếu backend đã nối

- Status: PASS (runtime backend + code-path)
- Backend runtime verified:
  - `PATCH /api/v1/auth/me/onboarding`
  - `GET /api/v1/auth/me`
- Result:
  - signup user mới -> patch onboardingCompleted=true -> `auth/me` trả lại `onboardingCompleted: true`
  - endpoint yêu cầu auth đúng
- Mobile code-path verified:
  - `mobile/src/store/auth-store.ts`
  - `mobile/src/services/authService.ts`
  - `setOnboardingCompleted()` gọi backend trước, fallback local nếu fail

### 6. refresh / reopen app không làm onboarding state sai

- Status: PASS (code-path verification)
- Verified in:
  - `mobile/src/store/onboarding-store.ts`
  - `mobile/src/store/auth-store.ts`
  - `mobile/src/hooks/useAuthRedirect.ts`
  - `mobile/src/hooks/useSession.ts`
- Result:
  - Draft onboarding state được persist qua AsyncStorage
  - Session restore set token lại vào API client
  - Redirect logic dựa trên `user + token + onboardingCompleted`, không còn dùng field sai

### 7. Role sau onboarding đúng

- Status: PASS (code-path verification)
- Verified in:
  - `mobile/app/(onboarding)/role-select.tsx`
  - `mobile/app/(onboarding)/goals-setup.tsx`
  - `mobile/src/store/auth-store.ts`
- Result:
  - Role chọn trong onboarding được giữ trong onboarding store
  - Ở bước cuối, role được sync vào auth user local qua `updateUser`

## Runtime Checks Performed

### Backend onboarding completion sync

- Signup user:
  - HTTP 201
- Patch onboarding status:
  - `PATCH /api/v1/auth/me/onboarding`
  - HTTP 200
  - `onboardingCompleted: true`
- Re-fetch current user:
  - `GET /api/v1/auth/me`
  - HTTP 200
  - `onboardingCompleted: true`
- Guest patch attempt:
  - HTTP 401

## Bugs Found

### Bug 1

- Title: Onboarding screens import sai auth store path
- Impact:
  - onboarding role/profile flow có thể fail import/runtime
- Root cause likely:
  - dùng path cũ `../../store/auth-store` thay vì `../../src/store/auth-store`

### Bug 2

- Title: `setOnboardingCompleted(true)` bị gọi quá sớm ở role/profile/skills steps
- Impact:
  - user chưa xong onboarding nhưng đã bị xem như completed
  - redirect/guard sai
- Root cause likely:
  - onboarding completion flag bị dùng như draft progress flag

### Bug 3

- Title: `skills-setup` dùng `useAuthStore` nhưng không import
- Impact:
  - màn skills không usable
- Root cause likely:
  - import thiếu sau refactor

### Bug 4

- Title: Onboarding layout là placeholder screen, không phải navigator layout
- Impact:
  - route nhóm onboarding không usable đúng kiểu Expo Router
- Root cause likely:
  - `_layout.tsx` bị để ở trạng thái scaffold dở

### Bug 5

- Title: State onboarding không persist giữa steps/reopen app
- Impact:
  - mất role/profile/skills/goals giữa chừng
- Root cause likely:
  - chưa có onboarding draft store riêng

### Bug 6

- Title: Skip ở bước goals không mark onboarding completed
- Impact:
  - user vào home nhưng vẫn có nguy cơ bị redirect onboarding về sau
- Root cause likely:
  - skip flow quên set completion flag

### Bug 7

- Title: Role chọn trong onboarding không sync lại auth user local
- Impact:
  - role sau onboarding có thể không phản ánh lựa chọn cuối
- Root cause likely:
  - role chỉ nằm trong local component state

### Bug 8

- Title: onboardingCompleted chưa sync về backend
- Impact:
  - restore session qua backend có thể trả trạng thái cũ
- Root cause likely:
  - chưa có endpoint update onboarding status

## Fixed Now

- Added persisted onboarding draft store:
  - `mobile/src/store/onboarding-store.ts`
- Fixed onboarding layout to real Expo Router stack
- Fixed wrong store imports in onboarding screens
- Removed premature onboarding completion from intermediate steps
- Persisted role/profile/skills/goals between steps
- Synced selected role back into auth user at final step
- Fixed goals skip flow to also mark onboarding completed
- Fixed `useSession` auth derivation bug for onboarding redirect correctness
- Added backend onboarding sync endpoint:
  - `PATCH /api/v1/auth/me/onboarding`
- Updated `GET /auth/me` to return `onboardingCompleted` from real auth repository
- Updated mobile auth service/store to sync onboarding completion to backend first, then fallback locally

## Still Open

- Runtime mobile-device verification of full screen interaction was not executed here because Expo/mobile runtime is not fully wired for direct CLI execution in this repo snapshot
- No dedicated backend profile/onboarding data model sync yet for role/profile/skills/goals payloads beyond `onboardingCompleted`

## How to verify

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### Verify onboarding completion backend sync

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa-onboarding@example.com","password":"Aa1!aaaa","role":"member"}'
```

Take `token` from response, then:

```bash
curl -X PATCH http://localhost:3000/api/v1/auth/me/onboarding \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TOKEN>' \
  -d '{"onboardingCompleted":true}'

curl http://localhost:3000/api/v1/auth/me \
  -H 'Authorization: Bearer <TOKEN>'
```

### Mobile code-path review

Check these files together:

- `mobile/app/(onboarding)/_layout.tsx`
- `mobile/app/(onboarding)/role-select.tsx`
- `mobile/app/(onboarding)/profile-setup.tsx`
- `mobile/app/(onboarding)/skills-setup.tsx`
- `mobile/app/(onboarding)/goals-setup.tsx`
- `mobile/src/store/onboarding-store.ts`
- `mobile/src/store/auth-store.ts`
- `mobile/src/hooks/useAuthRedirect.ts`
- `mobile/src/hooks/useSession.ts`
