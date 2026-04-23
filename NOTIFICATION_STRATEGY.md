# NOTIFICATION_STRATEGY.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22  
**Purpose**: Notification strategy cho activation và retention

---

## NOTIFICATION TYPES

### 1. ACTIVATION NOTIFICATIONS

| Trigger             | Message Intent                    | User Value     | Spam Risk | Priority |
| ------------------- | --------------------------------- | -------------- | --------- | -------- |
| Onboarding complete | "Complete profile to get matched" | Get discovered | LOW       | HIGH     |
| Profile incomplete  | "Add skills to get matched"       | Get discovered | LOW       | MEDIUM   |

### 2. TRANSACTION NOTIFICATIONS

| Trigger           | Message Intent                  | User Value   | Spam Risk | Priority |
| ----------------- | ------------------------------- | ------------ | --------- | -------- |
| Proposal received | "New proposal for your request" | Get service  | NONE      | HIGH     |
| Proposal accepted | "Your proposal was accepted!"   | Get deal     | NONE      | HIGH     |
| Deal funded       | "Deal funded - start working!"  | Start work   | NONE      | HIGH     |
| Work submitted    | "Work submitted for review"     | Get approval | NONE      | HIGH     |
| Deal completed    | "Deal completed!"               | Get payment  | NONE      | HIGH     |

### 3. PROPOSAL NOTIFICATIONS

| Trigger         | Message Intent             | User Value     | Spam Risk | Priority |
| --------------- | -------------------------- | -------------- | --------- | -------- |
| Proposal sent   | "Proposal sent"            | Acknowledgment | NONE      | LOW      |
| Proposal viewed | "Your proposal was viewed" | Attention      | NONE      | LOW      |

### 4. DEAL MILESTONE NOTIFICATIONS

| Trigger         | Message Intent           | User Value | Spam Risk | Priority |
| --------------- | ------------------------ | ---------- | --------- | -------- |
| Fund reminder   | "Fund deal to start"     | Action     | NONE      | HIGH     |
| Submit reminder | "Submit work"            | Action     | NONE      | MEDIUM   |
| Review reminder | "Review submitted work"  | Action     | NONE      | MEDIUM   |
| Dispute opened  | "Dispute opened on deal" | Action     | NONE      | HIGH     |

### 5. REVIEW NOTIFICATIONS

| Trigger         | Message Intent | User Value | Spam Risk | Priority |
| --------------- | -------------- | ---------- | --------- | -------- |
| Review received | "New review"   | Trust      | NONE      | MEDIUM   |
| Review reminder | "Leave review" | Trust      | LOW       | LOW      |

### 6. RISK/OPERATOR NOTIFICATIONS

| Trigger         | Message Intent          | User Value | Spam Risk | Priority |
| --------------- | ----------------------- | ---------- | --------- | -------- |
| Dispute created | "New dispute"           | Action     | NONE      | HIGH     |
| Risk signal     | "Risk signal detected"  | Action     | NONE      | HIGH     |
| Fraud signal    | "Fraud signal detected" | Action     | CRITICAL  |

### 7. RETENTION NUDGES

| Trigger                  | Message Intent                 | User Value | Spam Risk | Priority |
| ------------------------ | ------------------------------ | ---------- | --------- | -------- |
| No login 7 days          | "We miss you!"                 | Re-engage  | MEDIUM    | LOW      |
| Has offer, no proposal   | "3 requests match your skills" | Value      | LOW       | MEDIUM   |
| Has request, no proposal | "5 providers available"        | Value      | LOW       | MEDIUM   |

---

## CHANNEL PLACEMENT

| Type          | In-App | Push | Email    |
| ------------- | ------ | ---- | -------- |
| Activation    | YES    | NO   | NO       |
| Transaction   | YES    | NO\* | NO       |
| Deal          | YES    | NO\* | NO       |
| Review        | YES    | NO   | NO       |
| Risk/Operator | YES    | YES  | NO       |
| Retention     | YES    | NO   | OPTIONAL |

\*Push notifications to be implemented in Phase 1.1

---

## SELF-ASSESSMENT

- [x] Gắn với product flow? → **CÓ**
- [x] Có priority levels? → **CÓ**
- [x] Usable cho team? → **CÓ**

**Status: READY FOR IMPLEMENTATION**
