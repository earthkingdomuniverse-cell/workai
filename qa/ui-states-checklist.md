# UI States QA Checklist

Date: 2026-04-22

Scope:

- offers
- requests
- proposals
- deals
- AI
- inbox
- activity
- admin

Method:

- Static screen audit of route screens and shared UI state components
- Code-path verification for loading/error/empty/refresh logic
- Targeted fixes applied where screens were obviously broken or too incomplete to QA
- Small-screen and keyboard-overlap assessed by code structure, not simulator runtime, because Expo runtime is not fully wired in this repo snapshot

---

## Offers

### Checked

- [x] Loading state on list screen exists: `mobile/app/(tabs)/offers.tsx`
- [x] Error state on list screen exists
- [x] Empty state on list screen exists
- [x] Pull to refresh on list screen exists
- [x] Create screen form validation exists
- [x] Keyboard tap persistence added on create screen

### Result

- List screen: PASS
- Create screen: PARTIAL

### Notes

- Submit failure on create screen still uses `Alert` rather than persistent inline submit error UI
- Small-screen layout looks acceptable from code audit; filter chips and fields stack vertically where needed

---

## Requests

### Checked

- [x] Loading state on list screen exists: `mobile/app/(tabs)/requests.tsx`
- [x] Error state on list screen exists
- [x] Empty state on list screen exists
- [x] Pull to refresh on list screen exists
- [x] Detail screen has loading and error states
- [x] Create screen has inline validation
- [x] Keyboard tap persistence added on create screen

### Result

- Requests module: PASS

### Notes

- Create screen submit failure still uses `Alert` after async failure

---

## Proposals

### Checked

- [x] My proposals list has loading state
- [x] My proposals list has error state
- [x] My proposals list has empty state
- [x] My proposals list has pull to refresh
- [x] Proposal detail has loading and not-found/error state
- [x] Proposal create screen has inline validation
- [x] Keyboard tap persistence added on create screen

### Result

- Proposals module: PASS

### Notes

- Accept/reject/withdraw actions use alert feedback, which is acceptable but not a dedicated inline async banner

---

## Deals

### Checked

- [x] Deals tab now renders actual list instead of placeholder
- [x] Deals tab now has loading state
- [x] Deals tab now has error state
- [x] Deals tab now has empty state
- [x] Deals tab now has pull to refresh
- [x] Deal detail has loading state
- [x] Deal detail has minimal not-found error state
- [x] Payment screen now has inline error message and loading indicator
- [x] Dispute screen now has inline error message and loading indicator
- [x] Keyboard tap persistence added on payment screen
- [x] Keyboard tap persistence added on dispute screen

### Result

- Deals module: PASS with minor gaps

### Notes

- Deal detail error state is still minimal text-based instead of shared `ErrorState`
- `timeline` and `receipts` screens are usable but still relatively light on error handling

---

## AI

### Checked

- [x] AI tab is now a usable hub screen instead of dead placeholder
- [x] AI Match screen now has loading state
- [x] AI Match screen now has inline error state
- [x] AI Match screen now has empty state before results
- [x] AI Price screen now has loading state
- [x] AI Price screen now has inline error state
- [x] AI Price screen now has empty state before estimate
- [x] AI Support screen has loading state
- [x] AI Support screen now has inline error state
- [x] AI Support screen now has empty state before answer
- [x] AI Next Action screen now has loading state
- [x] AI Next Action screen now has error state
- [x] AI Next Action screen now has empty state
- [x] AI Next Action screen now has pull to refresh
- [x] Keyboard tap persistence added on AI Match / AI Price / AI Support

### Result

- AI module: PASS

### Notes

- AI result data is still mock-backed, but UI states are now present and usable

---

## Inbox

### Checked

- [x] Loading state exists
- [x] Error state exists
- [x] Empty state exists
- [x] Pull to refresh exists
- [x] Message thread route now exists so tapping a conversation no longer breaks navigation

### Result

- Inbox module: PASS

### Notes

- No keyboard overlap issue in inbox list screen itself
- Message thread detail route is minimal but no longer broken

---

## Activity

### Checked

- [x] Loading state exists
- [x] Error state exists
- [x] Empty state exists
- [x] Pull to refresh exists

### Result

- Activity module: PASS

### Notes

- Small-screen layout looks acceptable from code audit: cards are stacked vertically and text wraps safely

---

## Admin

### Checked

- [x] Admin overview now has loading state
- [x] Admin overview now has error state
- [x] Admin overview now has empty fallback
- [x] Admin overview now has pull to refresh
- [x] Admin disputes now has loading/error/empty/refresh
- [x] Admin risk now has loading/error/empty/refresh
- [x] Admin fraud now has loading/error/empty/refresh
- [x] Admin reviews now has loading/error/empty/refresh
- [x] Admin screens show access denied for non-operator roles

### Result

- Admin module: PASS

### Notes

- Fraud and review screens were previously placeholders and are now at least scanable/QA-able

---

## Keyboard Overlap Summary

### Added / verified

- [x] `mobile/app/offers/create.tsx`
- [x] `mobile/app/requests/create.tsx`
- [x] `mobile/app/proposals/create.tsx`
- [x] `mobile/app/deals/payment.tsx`
- [x] `mobile/app/deals/dispute.tsx`
- [x] `mobile/app/ai/match.tsx`
- [x] `mobile/app/ai/price.tsx`
- [x] `mobile/app/ai/support.tsx`

### Notes

- Fix applied via `keyboardShouldPersistTaps="handled"`
- Full device-level keyboard overlap verification is still open because simulator/runtime execution was not available in this task

---

## Small Screen Layout Summary

### Checked by code audit

- [x] Offers list/cards: wrap/stack acceptable
- [x] Requests list/cards: wrap/stack acceptable
- [x] Proposals list/detail: stack acceptable
- [x] Deals list/detail: stack acceptable after list rewrite
- [x] AI forms use scrollable containers
- [x] Admin cards are vertically stacked and scrollable

### Still open

- No simulator/device screenshot verification done in this task

---

## Bugs Found

### Bug 1

- `mobile/app/(tabs)/deals.tsx` was effectively broken
- Impact:
  - no actual list UI rendered
  - no error state
  - no empty state
  - no refresh path

### Bug 2

- `mobile/app/ai/match.tsx` was not even a screen component
- Impact:
  - AI Match route was not QA-able

### Bug 3

- `mobile/app/ai/price.tsx` and `mobile/app/ai/next-action.tsx` were placeholders with no states
- Impact:
  - AI module failed loading/error/empty state expectations

### Bug 4

- Admin overview/disputes/risk/fraud/reviews were missing or weak on loading/error/empty states
- Impact:
  - operator flows not realistically testable

### Bug 5

- `deals/[id].tsx` used `radius` without import
- Impact:
  - potential runtime crash opening deal detail

### Bug 6

- Several create/input screens lacked `keyboardShouldPersistTaps`
- Impact:
  - higher risk of keyboard interaction issues in forms

## Fixed Now

- Rebuilt deals tab list with loading/error/empty/refresh
- Replaced broken AI Match route with usable screen
- Replaced AI Price placeholder with usable form + result state
- Replaced AI Next Action placeholder with loading/error/empty/list state
- Improved AI tab into usable module hub
- Added inline error/loading behavior to AI Support
- Rebuilt admin overview/disputes/risk/fraud/reviews screens with loading/error/empty/refresh
- Fixed `deals/[id].tsx` missing `radius` import
- Added `keyboardShouldPersistTaps="handled"` to key create/input forms
- Improved deal payment/dispute forms with inline error/loading feedback

## Still Open

- Full simulator/device verification for keyboard overlap is not completed
- Full simulator/device verification for small-screen breakpoints is not completed
- Offer/request create screens still use alert-based submit failure feedback after async submit instead of persistent inline async banners
- Deal detail uses a minimal text error state rather than the shared `ErrorState` component

## How to verify

Open these files and confirm state handlers exist:

- Offers
  - `mobile/app/(tabs)/offers.tsx`
  - `mobile/app/offers/create.tsx`
- Requests
  - `mobile/app/(tabs)/requests.tsx`
  - `mobile/app/requests/create.tsx`
  - `mobile/app/requests/[id].tsx`
- Proposals
  - `mobile/app/proposals/mine.tsx`
  - `mobile/app/proposals/create.tsx`
  - `mobile/app/proposals/[id].tsx`
- Deals
  - `mobile/app/(tabs)/deals.tsx`
  - `mobile/app/deals/[id].tsx`
  - `mobile/app/deals/payment.tsx`
  - `mobile/app/deals/dispute.tsx`
- AI
  - `mobile/app/(tabs)/ai.tsx`
  - `mobile/app/ai/match.tsx`
  - `mobile/app/ai/price.tsx`
  - `mobile/app/ai/support.tsx`
  - `mobile/app/ai/next-action.tsx`
- Inbox / Activity
  - `mobile/app/(tabs)/inbox.tsx`
  - `mobile/app/(tabs)/activity.tsx`
- Admin
  - `mobile/app/admin/overview.tsx`
  - `mobile/app/admin/disputes.tsx`
  - `mobile/app/admin/risk.tsx`
  - `mobile/app/admin/fraud.tsx`
  - `mobile/app/admin/reviews.tsx`

Specific checks:

- Search for `LoadingState`, `ErrorState`, `EmptyState`
- Search for `RefreshControl` on list-like screens
- Search for `keyboardShouldPersistTaps="handled"` on form-like screens
- Confirm deals/AI/admin screens no longer remain trivial placeholders for state handling
