# Navigation QA Checklist

Date: 2026-04-22

Scope:

- Expo Router layouts
- Auth routes
- Onboarding routes
- Tab routes
- Nested offers / requests / proposals / deals routes
- AI routes
- Settings routes
- Admin routes
- Deep links / path params / access handling

## Verification Method

- Static route tree audit against actual `mobile/app/**` files
- Code-path audit for `router.push`, `router.replace`, `Redirect`, role guard, and route constants
- Route-loadability fixes applied where paths/imports/layouts were broken

## 1. Auth Routes

- [x] `/(auth)/login` exists
- [x] `/(auth)/signup` exists
- [x] `/(auth)/forgot-password` exists
- [x] Auth group has dedicated stack layout: `mobile/app/(auth)/_layout.tsx`
- [x] Entry redirect from `mobile/app/index.tsx` goes to `/(auth)/login` for guest
- [x] Back navigation is available through root stack configuration for screens outside hidden groups

Notes:

- Auth group layout hides its own header intentionally
- Root stack no longer disables headers globally

## 2. Onboarding Routes

- [x] `/(onboarding)/intro` exists
- [x] `/(onboarding)/role-select` exists
- [x] `/(onboarding)/profile-setup` exists
- [x] `/(onboarding)/skills-setup` exists
- [x] `/(onboarding)/goals-setup` exists
- [x] Onboarding group has proper stack layout
- [x] Step-to-step navigation paths are valid
- [x] Final onboarding route redirects to `/(tabs)/home`

Notes:

- Onboarding draft state is persisted; route resume logic is not broken by refresh/reopen from a navigation perspective

## 3. Tab Routes

- [x] `/(tabs)/home` exists
- [x] `/(tabs)/explore` exists
- [x] `/(tabs)/offers` exists
- [x] `/(tabs)/requests` exists
- [x] `/(tabs)/proposals` exists
- [x] `/(tabs)/deals` exists
- [x] `/(tabs)/ai` exists
- [x] `/(tabs)/inbox` exists
- [x] `/(tabs)/activity` exists
- [x] `/(tabs)/profile` exists
- [x] `/(tabs)/admin` exists
- [x] Tabs layout exists and is mounted by root stack

Role visibility:

- [x] Admin tab hidden for non-operator/non-admin via `href: null`
- [x] Admin tab visible for operator/admin

## 4. Nested Offer Routes

- [x] `/offers/[id]` exists
- [x] `/offers/create` exists
- [x] `/offers/manage` exists
- [x] `/offers/edit` exists
- [x] Offer cards push to `/offers/:id`
- [x] Offer detail CTA no longer points to a missing route; `/deals/create` route added

Back navigation:

- [x] Root stack now leaves detail screens with native header/back by default

## 5. Nested Request Routes

- [x] `/requests/[id]` exists
- [x] `/requests/create` exists
- [x] `/requests/manage` exists
- [x] `/requests/edit` exists
- [x] Request cards push to `/requests/:id`
- [x] Request detail CTA to `/proposals/create?requestId=...` points to existing route

## 6. Nested Proposal Routes

- [x] `/proposals/[id]` exists
- [x] `/proposals/create` exists
- [x] `/proposals/mine` exists
- [x] Proposal list pushes to `/proposals/:id`
- [x] Query param path for proposal creation from request detail is valid

## 7. Nested Deal Routes

- [x] `/deals/[id]` exists
- [x] `/deals/create` added to resolve broken CTA from offer detail
- [x] `/deals/timeline` exists
- [x] `/deals/payment` exists
- [x] `/deals/dispute` exists
- [x] `/deals/receipts` exists

Deep link/path param checks:

- [x] `DEALS_DETAIL(id)` points to real `[id]` route
- [x] `DEALS_TIMELINE(id)` fixed to `/deals/timeline?dealId=...`
- [x] `DEALS_PAYMENT(id)` fixed to `/deals/payment?dealId=...`
- [x] `DEALS_DISPUTE(id)` fixed to `/deals/dispute?id=...`
- [x] `DEALS_RECEIPTS(id)` fixed to `/deals/receipts?dealId=...`
- [x] `deals/timeline` screen now tolerates `dealId` param instead of requiring only serialized timeline payload

## 8. AI Routes

- [x] `/ai/match` exists
- [x] `/ai/price` exists
- [x] `/ai/support` exists
- [x] `/ai/next-action` exists
- [x] Tab AI route exists at `/(tabs)/ai`

## 9. Settings Routes

- [x] `/settings` exists
- [x] `/settings/account` exists
- [x] `/settings/notifications` exists
- [x] `/settings/appearance` exists
- [x] `/settings/privacy` exists

Broken route fixes:

- [x] Removed/replaced broken settings links that pointed to missing routes:
  - `/settings/language`
  - `/settings/currency`
  - `/settings/help`
  - `/settings/contact`
  - `/settings/about`
  - `/settings/terms`
  - `/settings/policy`

Replacement routes now point only to existing screens.

## 10. Admin Routes

- [x] `/admin/overview` exists
- [x] `/admin/disputes` exists
- [x] `/admin/risk` exists
- [x] `/admin/fraud` exists
- [x] `/admin/reviews` exists

Role/access checks:

- [x] `/(tabs)/admin` shows access denied for member
- [x] `/(tabs)/admin` redirects operator/admin to `/admin/overview`
- [x] Direct admin screens guard member access using access denied UI

## 11. Route Import / Layout Integrity

- [x] Added `mobile/theme.ts` adapter so `../../theme` imports resolve
- [x] Added `mobile/components/*` adapters so route screens importing `../../components/...` resolve
- [x] Root layout now renders router tree instead of static placeholder view
- [x] `mobile/app/index.tsx` import path for `useAuth` fixed
- [x] Home/explore screen import paths fixed from broken `../src/...` to `../../src/...`

## 12. Deep Link / Param Routes Added To Stop Breakage

- [x] `/messages/[id]` added for inbox thread navigation
- [x] `/transactions/[id]` added for transaction history detail navigation
- [x] `/deals/create` added for offer detail CTA

## 13. Back Navigation

- [x] Root stack no longer suppresses header on every route
- [x] Auth group hides header intentionally
- [x] Onboarding group hides header intentionally
- [x] Tabs group hides root header intentionally
- [x] Detail routes outside groups now inherit stack header/back behavior

## Bugs Found

### Bug 1

- Root layout rendered a static placeholder instead of router stack
- Impact: app navigation tree could not mount correctly

### Bug 2

- Root stack had `headerShown: false` globally
- Impact: nested detail routes had no native back navigation

### Bug 3

- Admin tab always visible regardless of role
- Impact: member could see admin tab entry

### Bug 4

- Admin screens had no local access-denied guard for direct deep link access
- Impact: member could navigate directly to admin routes

### Bug 5

- Multiple route pushes pointed to missing routes:
  - `/messages/:id`
  - `/transactions/:id`
  - `/deals/create`
  - multiple settings routes
  - `/profile/:slug`

### Bug 6

- Many screens imported `../../theme` and `../../components/...` but `mobile/` had no adapter files
- Impact: route load failure from broken imports

### Bug 7

- Home and Explore imported from broken relative paths `../src/...`
- Impact: route load failure

### Bug 8

- Several route screens had duplicate `export default` lines
- Impact: syntax / bundling failure for those routes

### Bug 9

- Deal route constants did not match actual file-system routes
- Impact: deep links and helper navigation to deal nested screens would break

## Fixed Now

- Added real root Expo Router stack in `mobile/app/_layout.tsx`
- Preserved native back navigation for detail screens by scoping header hiding to route groups only
- Hid admin tab for non-operator users
- Added access denied UI + guards for admin tab and admin screens
- Added missing route files for:
  - `messages/[id]`
  - `transactions/[id]`
  - `deals/create`
- Replaced broken settings links with existing routes only
- Repointed broken profile pushes to existing `/(tabs)/profile`
- Added theme/components adapter files under `mobile/`
- Fixed wrong home/explore import paths
- Removed duplicate default exports from broken screens
- Fixed deal route constants to match actual route structure
- Made `deals/timeline` accept `dealId` deep-link param

## Still Open

- No full device/simulator runtime pass was executed because this repo snapshot does not currently include a complete Expo runtime package setup
- Some screens still contain minimal content, but their routes now resolve and no longer break navigation structure
- Gesture-based native back behavior was validated structurally via stack config, not on-device manually

## How to verify

### Static route audit

- Open `mobile/app/`
- Confirm these files exist:
  - `messages/[id].tsx`
  - `transactions/[id].tsx`
  - `deals/create.tsx`
  - all auth/onboarding/tab/admin/settings/ai nested files

### Layout audit

- Open `mobile/app/_layout.tsx`
- Confirm only `(auth)`, `(onboarding)`, `(tabs)` have `headerShown: false`
- Confirm root no longer renders a static placeholder view

### Role visibility audit

- Open `mobile/app/(tabs)/_layout.tsx`
- Confirm admin tab uses `href: isOperator ? undefined : null`

### Deep link/path param audit

- Open `mobile/src/constants/routes.ts`
- Confirm deal nested routes use query param paths matching actual files

### Broken route target audit

- Confirm there are no remaining pushes to:
  - `/profile/:slug`
  - removed settings routes
  - missing deal nested paths

### Direct file checks

- `mobile/app/(tabs)/admin.tsx`
- `mobile/app/admin/*.tsx`
- `mobile/app/(tabs)/inbox.tsx`
- `mobile/app/transactions/history.tsx`
- `mobile/app/offers/[id].tsx`
