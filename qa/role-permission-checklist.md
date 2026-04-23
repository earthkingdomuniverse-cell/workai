# Role & Permission QA Checklist

## Scope

- Role system across app and backend
- Route access control
- Action permissions

## QA Tasks

### 1. Role Types

#### 1.1 Guest

- Test: Not logged in
- Expected: Access to public routes only

#### 1.2 Member

- Test: Logged in as member
- Expected: Access to member routes, own data

#### 1.3 Operator

- Test: Logged in as operator
- Expected: Access to admin routes

#### 1.4 Admin

- Test: Logged in as admin
- Expected: Full access

### 2. Route Access

#### 2.1 Public Routes

- /, /home, /explore, /offers, /requests
- Expected: Guest can access

#### 2.2 Protected Routes

- /profile, /offers/manage, /requests/manage
- Expected: Member only

#### 2.3 Admin Routes

- /admin, /admin/\*
- Expected: Operator/Admin only

### 3. Tab Visibility

#### 3.1 Home Tab

- Test: All roles see
- Expected: Yes

#### 3.2 Offers Tab

- Test: All roles see
- Expected: Yes

#### 3.3 Deals Tab

- Test: Member+ see
- Expected: Yes

#### 3.4 Admin Tab

- Test: Operator+ see
- Expected: Guarded

### 4. Action Permissions

#### 4.1 Create Offer

- Test: Member tries
- Expected: Allowed

#### 4.2 Delete Offer (own)

- Test: Owner tries
- Expected: Allowed

#### 4.3 Delete Offer (other)

- Test: Non-owner tries
- Expected: 403 Forbidden

#### 4.4 Approve Review

- Test: Member tries
- Expected: 403 Forbidden (operator only)

### 5. Backend Authorization

#### 5.1 Protected Endpoint

- Test: Request without token
- Expected: 401 Unauthorized

#### 5.2 Role Check

- Test: Operator endpoint with member token
- Expected: 403 Forbidden

### 6. UI + Backend Guard Matching

#### 6.1 UI Guard

- Test: Screen checks role
- Expected: Blocks unauthorized

#### 6.2 Backend Guard

- Test: API checks role
- Expected: Blocks unauthorized

---

## Role Definitions

| Role     | Description    | Access Level         |
| -------- | -------------- | -------------------- |
| guest    | Not logged in  | Public only          |
| member   | Logged in user | Own data, create     |
| operator | Staff          | Admin read, moderate |
| admin    | Administrator  | Full access          |

## Current Role Guards

| Screen          | UI Guard      | Backend Guard |
| --------------- | ------------- | ------------- |
| /admin/overview | ✅ isOperator | -             |
| /admin/disputes | ✅ isOperator | -             |
| /admin/risk     | ✅ isOperator | -             |
| /admin/fraud    | ✅ isOperator | -             |
| /admin/reviews  | ✅ isOperator | -             |
