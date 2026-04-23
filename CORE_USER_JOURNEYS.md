# CORE_USER_JOURNEYS.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Core user journeys cho launch - step-by-step cho team

---

## JOURNEY 1: User Tạo Offer Đầu Tiên

### Actor: Provider (Freelancer)

### Goal: Tạo offer đầu tiên để get clients

| Step | User Action               | System Response                        | Possible Failure                            | Recovery   |
| ---- | ------------------------- | -------------------------------------- | ------------------------------------------- | ---------- |
| 1    | Open app                  | Home screen loads                      | App crash → restart                         | Check logs |
| 2    | Tap "+" or "Create Offer" | Navigate to offer create               | Route broken → check navigation             | Fix route  |
| 3    | Enter title               | Real-time validation                   | Title too short (min 10) → show error       | Re-enter   |
| 4    | Enter description         | Real-time validation                   | Description too short (min 50) → show error | Re-enter   |
| 5    | Select skill(s)           | Skills multi-select                    | No skill selected → show error              | Select ≥1  |
| 6    | Enter price               | Number input                           | Price = 0 → show error                      | Enter >0   |
| 7    | Select pricingType        | Dropdown: fixed/hourly/negotiable      | None → default fixed                        | Save       |
| 8    | Tap "Create"              | POST /api/v1/offers                    | 500 → show error toast                      | Retry      |
| 9    | Success                   | Navigate to offer detail, show success | 400 → show validation error                 | Fix fields |
| 10   | View in list              | Offer appears in offers list           | Not appearing → check list API              | Refresh    |

### Success Criteria:

- Offer status: "active"
- Offer appears in own list
- Offer searchable

---

## JOURNEY 2: User Đăng Request Đầu Tiên

### Actor: Requester (Client)

### Goal: Post request đầu tiên để tìm người

| Step | User Action               | System Response                  | Possible Failure                   | Recovery   |
| ---- | ------------------------- | -------------------------------- | ---------------------------------- | ---------- |
| 1    | Open app                  | Home screen loads                | App crash → restart                | Check logs |
| 2    | Tap "+" or "Post Request" | Navigate to request create       | Route broken → check navigation    | Fix route  |
| 3    | Enter title               | Real-time validation             | Title too short → show error       | Re-enter   |
| 4    | Enter description         | Real-time validation             | Description too short → show error | Re-enter   |
| 5    | Select skill(s) needed    | Skills multi-select              | No skill → show error              | Select ≥1  |
| 6    | Enter budget min          | Number input                     | 0 → show error                     | Enter >0   |
| 7    | Enter budget max          | Number input                     | < min → show error                 | Fix        |
| 8    | Select urgency            | Dropdown: low/medium/high/urgent | None → default medium              | Save       |
| 9    | Tap "Post"                | POST /api/v1/requests            | 500 → show error toast             | Retry      |
| 10   | Success                   | Navigate to request detail       | 400 → show validation              | Fix fields |
| 11   | View in list              | Request appears in requests list | Not appearing → check list API     | Refresh    |

### Success Criteria:

- Request status: "open"
- Request visible in public list
- Request searchable

---

## JOURNEY 3: Requester Nhận Proposal

### Actor: Requester

### Goal: Review và accept proposal từ provider

| Step | User Action           | System Response                | Possible Failure               | Recovery      |
| ---- | --------------------- | ------------------------------ | ------------------------------ | ------------- |
| 1    | View own request      | Request detail shows           | Request not found → check auth | Re-login      |
| 2    | View proposals tab    | List of proposals              | Empty → no proposal yet        | N/A           |
| 3    | Tap proposal          | Proposal detail view           | Slow load → check API          | Optimize      |
| 4    | View provider profile | Trust score + reviews          | API error → show error         | Retry         |
| 5    | View match score      | AI match % displayed           | Broken → check AI service      | Manual review |
| 6    | Tap "Accept"          | Confirm dialog                 | Provider not found → error     | Re-check      |
| 7    | Confirm               | POST accept proposal           | Already accepted → show error  | Find another  |
| 8    | Success               | Deal created, navigate to deal | 500 → show error               | Retry         |

### Success Criteria:

- Proposal status: "accepted"
- Deal created with status: "pending_funding"

---

## JOURNEY 4: Proposal Thành Deal

### Actor: Provider + Requester

### Goal: Proposal accepted → deal created

| Step | User Action                | System Response              | Possible Failure         | Recovery   |
| ---- | -------------------------- | ---------------------------- | ------------------------ | ---------- |
| 1    | Accept proposal            | Deal created                 | Already accepted → error | N/A        |
| 2    | Deal detail page           | Shows deal info              | Not found → check ID     | Verify     |
| 3    | Both see deal              | Deal status: pending_funding | Status wrong → check DB  | Manual fix |
| 4    | Requester sees "Fund Deal" | Payment simulation           | Payment failed → error   | Retry      |

### Deal Milestone Flow:

```
pending_funding → funded → in_progress → submitted → approved → completed
```

### Success Criteria:

- Deal exists in deals list
- Both parties can view deal
- Status transitions work

---

## JOURNEY 5: Deal Funded → Submitted → Released

### Actor: Provider → Requester

### Goal: Deal complete, payment released

| Step | User Action                  | System Response             | Possible Failure                 | Recovery            |
| ---- | ---------------------------- | --------------------------- | -------------------------------- | ------------------- |
| 1    | Deal status: funded          | Provider notified           | Notification failed → check push | N/A (in-app)        |
| 2    | Provider works               | Work in progress            | Provider bỏ → dispute            | Operator alert      |
| 3    | Provider submits deliverable | Deliverable uploaded        | Upload failed → check storage    | Retry               |
| 4    | Requester sees submit        | Notification sent           | In-app only                      | Check inbox         |
| 5    | Requester reviews            | Approve OR request revision | No response >7 days → nudge      | Operator follow     |
| 6    | Requester approves           | Status: completed           | Wait >14 days → auto-nudge       | Check notifications |
| 7    | Payment released             | Simulated payment           | Manual override                  | Operator confirm    |
| 8    | Both see deal complete       | Status: completed           | Display error → check UI         | Refresh             |

### Success Criteria:

- Deal status: "completed"
- Payment released (simulated)
- Provider receives release notification

---

## JOURNEY 6: User Để Lại Review

### Actor: Provider + Requester (either party)

### Goal: Leave review after deal completed

| Step | User Action    | System Response       | Possible Failure              | Recovery     |
| ---- | -------------- | --------------------- | ----------------------------- | ------------ |
| 1    | Deal completed | Review prompt appears | Prompt not showing → check UI | Via activity |
| 2    | Select rating  | 1-5 stars             | 0 → show error                | Select       |
| 3    | Enter comment  | Text input            | Empty → show suggestion       | Min 10 chars |
| 4    | Select tags    | Multi-select tags     | None required                 | Skip OK      |
| 5    | Tap "Submit"   | POST /api/v1/reviews  | 500 → show error              | Retry        |
| 6    | Success        | Review on profile     | Not showing → check list      | Refresh      |

### Success Criteria:

- Review visible on provider's profile
- Review shows in user's reviews list
- Average rating recalculated

---

## JOURNEY 7: Operator Xử Lý Dispute

### Actor: Operator/Admin

### Goal: Resolve dispute between provider và requester

| Step | User Action                       | System Response               | Possible Failure                | Recovery     |
| ---- | --------------------------------- | ----------------------------- | ------------------------------- | ------------ |
| 1    | Provider/requester raises dispute | Dispute created via app       | Submit failed → show error      | Retry        |
| 2    | Admin sees dispute list           | Admin disputes screen         | List empty → check DB query     | Check        |
| 3    | Admin views dispute               | Dispute detail shows all      | Data missing → check            | Fix          |
| 4    | Admin reviews evidence            | Chat history + deal info      | Loading slow → optimize         | Wait         |
| 5    | Admin decides                     | Resolution options            | Decision stuck → timeout        | Force        |
| 6    | Admin resolves                    | Both parties notified         | Notification failed → check     | Email backup |
| 7    | Resolution applied                | Deal status updated + payment | Payment stuck → manual override | Retry        |

### Dispute Status Flow:

```
open → under_review → resolved → closed
```

### Success Criteria:

- Dispute resolved <24 hours
- Both parties notified
- Deal status correct

---

## JOURNEY 8: Admin Xem Risk/Fraud Signals

### Actor: Admin

### Goal: Review risk và fraud signals

| Step | User Action        | System Response                  | Possible Failure             | Recovery  |
| ---- | ------------------ | -------------------------------- | ---------------------------- | --------- |
| 1    | Login as admin     | Dashboard loads                  | Auth fail → check role       | Verify    |
| 2    | Navigate to risk   | Risk signals list                | List empty → check detection | N/A OK    |
| 3    | View signal detail | User profile + activities        | Loading slow → optimize      | Wait      |
| 4    | Check history      | All user activities              | Data missing → check         | Fix       |
| 5    | Take action        | Flag/approve/warn/ban            | Action fail → check          | Retry     |
| 6    | Action applied     | User status updated + alert user | Update fail → check          | Manual DB |

### Risk Actions:

- Flag for review
- Warn user
- Freeze account
- Ban user

### Fraud Actions:

- Mark as fraud
- Ban user permanently
- Report to authorities (if severe)

---

## JOURNEY FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    SKILLVALUE FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Signup] → [Onboard] → [Home]                            │
│       │         │          │                               │
│       │         │          ├──→ [Create Offer] ──→ [List] │
│       │         │          ├──→ [Create Request] ──→ [List] │
│       │         │          │                               │
│       │         │          ├──→ [Browse Requests] ──→ [Send Proposal] │
│       │         │          ├──→ [Browse Offers] ────→ [Send Proposal] │
│       │         │          │                    │         │
│       │         │          │                    ▼         │
│       │         │          │              [Proposal Detail] │
│       │         │          │                    │         │
│       │         │          │              [Accept]       │
│       │         │          │                    │         │
│       │         │          └───────────────► [Deal Created] │
│       │         │                              │           │
│       │         │                     ┌──────┴──────┐  │
│       │         │                     │             │      │
│       │         │                  [Fund]      [Submit]   │
│       │         │                     │             │        │
│       │         │                     │      ┌─────┴────┐  │
│       │         │                     │      │          │   │
│       │         │                   [In] [Delivered]     │
│       │         │                     │    [Approve]     │
│       │         │                     │         │         │
│       │         │                  [Work in Progress] ────→ [Review]
│       │         │                              │         │
│       │         │                         [Complete]      │
│       ───────────────────────────────────────────────     │
│                          │                              │
│                    [Dispute?] ──→ [Admin Resolve]       │
└─────────────────────────────────────────────────────────────┘
```

---

## TESTING CHECKLIST

- [ ] All 8 journeys work end-to-end
- [ ] Error states show correctly
- [ ] Loading states show correctly
- [ ] Navigation works in all flows
- [ ] Data persists correctly
- [ ] Notifications fire correctly

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, step-by-step cụ thể
2. Có đủ cụ thể để team vận hành không? → YES, mỗi journey có failure + recovery
3. Có gắn với product flow hiện tại không? → YES, gắn với app routes có sẵn
4. Có tránh nói kiểu startup sáo rỗng không? → YES, technical cụ thể

**Status: READY FOR QA**
