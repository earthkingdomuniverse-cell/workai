# Auth QA Checklist

Date: 2026-04-22

Scope:

- Backend auth endpoints
- Mobile auth service/store/hook code paths
- Mock fallback behavior in auth service

## Runtime Checks

### 1. Signup thành công

- Status: PASS
- Method: runtime backend check via `POST /api/v1/auth/signup`
- Payload:

```json
{
  "email": "qa-auth@example.com",
  "password": "Aa1!aaaa",
  "role": "member"
}
```

- Result:
  - HTTP 201
  - response có `user`, `token`, `refreshToken`, `expiresAt`, `refreshTokenExpiresAt`

### 2. Signup lỗi validation

- Status: PASS
- Method: runtime backend check via invalid payload
- Payload:

```json
{
  "email": "bad-email",
  "password": "123"
}
```

- Result:
  - HTTP 400
  - error code: `VALIDATION_ERROR`

### 3. Login thành công

- Status: PASS
- Method: runtime backend check via `POST /api/v1/auth/login`
- Preconditions:
  - user đã signup trước đó trong cùng process
- Result:
  - HTTP 200
  - trả đúng token/refreshToken
  - không còn lộ `passwordHash` / `passwordSalt`

### 4. Login sai password

- Status: PASS
- Method: runtime backend check
- Result:
  - HTTP 401
  - error code: `AUTHENTICATION_ERROR`
  - message: `Invalid credentials`

### 5. Operator/Admin role load đúng

- Status: PASS
- Method: runtime backend signup check
- Cases checked:
  - signup role `operator`
  - signup role `admin`
- Result:
  - operator response trả `role: operator`
  - admin response trả `role: admin`
  - admin response permissions có `admin`

### 6. Auth me với token đúng

- Status: PASS
- Method: runtime backend check
- Flow:
  - signup operator
  - lấy token
  - gọi `GET /api/v1/auth/me` với bearer token
- Result:
  - HTTP 200
  - role trả về đúng `operator`

### 7. Guest redirect / guest access đúng ở backend

- Status: PASS
- Method: runtime backend check for guest auth state
- Flow:
  - gọi `GET /api/v1/auth/me` không có token
- Result:
  - HTTP 401
  - `AUTHENTICATION_ERROR`

### 8. Refresh session đúng

- Status: PASS
- Method: runtime backend check
- Flow:
  - signup user
  - lấy `refreshToken`
  - gọi `POST /api/v1/auth/refresh`
- Result:
  - HTTP 200
  - có token mới

### 9. Logout đúng

- Status: PASS
- Method: runtime backend check
- Flow:
  - gọi `POST /api/v1/auth/logout`
- Result:
  - HTTP 200
  - trả message `Logout successful`

## Mobile Code-Path Checks

### 10. Token lưu đúng

- Status: PASS
- Method: code-path verification
- Verified in:
  - `mobile/src/services/authService.ts`
- Result:
  - `persistAuth()` set:
    - `apiClient.setToken(response.token)`
    - `storage.setToken(response.token)`
    - `storage.setRefreshToken(response.refreshToken)`
    - `storage.setUserData(response.user)`

### 11. Restore session đúng

- Status: PASS
- Method: code-path verification
- Verified in:
  - `mobile/src/store/auth-store.ts`
- Result:
  - restore session set lại token vào `apiClient`
  - thử `getCurrentUser()` trước
  - nếu fail thì fallback sang `refreshToken()`
  - nếu refresh fail thì logout

### 12. Guest redirect đúng

- Status: PASS
- Method: code-path verification
- Verified in:
  - `mobile/src/hooks/useAuthRedirect.ts`
- Result:
  - hook không còn dùng field `isAuthenticated` không tồn tại
  - derive auth state từ `user + token`
  - guest route về `/(auth)/login`
  - onboarding chưa xong route về `/(onboarding)/intro`

### 13. Mock mode auth đúng khi backend fail

- Status: PASS (code-path)
- Method: code-path verification
- Verified in:
  - `mobile/src/services/authService.ts`
- Result:
  - `login()` fallback mock khi request fail và `ENABLE_MOCK_MODE=true`
  - `signup()` fallback mock khi request fail và `ENABLE_MOCK_MODE=true`
  - `refreshToken()` fallback mock khi request fail và `ENABLE_MOCK_MODE=true`
  - `getCurrentUser()` fallback user mock/storage khi backend fail và `ENABLE_MOCK_MODE=true`

## Bugs Found

### Bug 1

- Title: Auth routes đang là placeholder mock, không dùng auth module thật
- Impact:
  - không có validation thật
  - thiếu `refresh` route
  - response shape không khớp mobile auth service
- Root cause likely:
  - top-level route bị thay bằng mock route đơn giản

### Bug 2

- Title: Login response làm lộ `passwordHash` và `passwordSalt`
- Impact:
  - rò rỉ dữ liệu nhạy cảm trong response auth
- Root cause likely:
  - `login()` trả trực tiếp user record từ repository `findByEmail()`

### Bug 3

- Title: `useAuthRedirect` dùng `isAuthenticated` không có trong store
- Impact:
  - mobile auth redirect logic lỗi compile/runtime
- Root cause likely:
  - hook lệch với shape thật của `auth-store`

### Bug 4

- Title: Auth mobile không đồng bộ token vào `apiClient` khi restore session
- Impact:
  - app có token persisted nhưng request `/auth/me` không gửi Authorization đúng
- Root cause likely:
  - restore flow quên `apiClient.setToken(token)`

### Bug 5

- Title: Mobile auth service parse sai response shape API
- Impact:
  - service mong `AuthResponse` trực tiếp trong khi API trả `{ data: ... }`
- Root cause likely:
  - mismatch giữa `apiClient` và auth service contract

## Fixed Now

- Replaced placeholder auth route with real auth flow in `src/routes/auth.ts`
- Added validation for signup/login/refresh payloads
- Added `/auth/refresh`
- Fixed global backend error handler to respect `AppError` status/code
- Removed password hash leak from login/refresh responses
- Fixed auth service to unwrap `{ data }` response shape correctly
- Added token persistence + `apiClient.setToken()` sync
- Fixed restore session to re-attach token into API client
- Fixed `useAuthRedirect` to derive auth state from `user` and `token`
- Added mock auth fallback in mobile auth service when backend fails and mock mode is enabled

## Still Open

- `mobile/app/(auth)/login.tsx` is still a minimal placeholder screen, not a fully usable form
- `mobile/app/(auth)/signup.tsx` is still a minimal placeholder screen, not a fully usable form
- Runtime mobile-device verification for AsyncStorage persistence was not executed here because Expo/mobile runtime is not wired for direct CLI execution in this repo snapshot

## Verification Commands

### Backend

```bash
npm run typecheck
npm run build
node dist/server.js
```

### Signup success

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa-auth@example.com","password":"Aa1!aaaa","role":"member"}'
```

### Signup validation failure

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"bad-email","password":"123"}'
```

### Login success

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa-auth@example.com","password":"Aa1!aaaa"}'
```

### Login wrong password

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa-auth@example.com","password":"wrongpass"}'
```

### Auth me / refresh / logout

Use the token and refresh token from signup/login response.

```bash
curl http://localhost:3000/api/v1/auth/me -H 'Authorization: Bearer <TOKEN>'
curl -X POST http://localhost:3000/api/v1/auth/refresh -H 'Content-Type: application/json' -d '{"refreshToken":"<REFRESH_TOKEN>"}'
curl -X POST http://localhost:3000/api/v1/auth/logout
```
