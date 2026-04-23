# RETENTION_STRATEGY_1_0.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22  
**Purpose**: Retention strategy cho 1.0

---

## D1 RETENTION STRATEGY

### What

User quay lại sau ngày đầu tiên signup

### Strategy

| Tactic            | Implementation                         |
| ----------------- | -------------------------------------- |
| Push notification | "Complete your profile to get matched" |
| AI next-action    | Home shows "Add skills"                |
| In-app message    | Welcome banner                         |

### Success Criteria

- Target: ≥40% D1 retention

---

## D7 RETENTION STRATEGY

### What

User quay lại sau 7 ngày

### Strategy

| Tactic                | Implementation                                   |
| --------------------- | ------------------------------------------------ |
| Push notification     | "3 new requests match your skills" (if provider) |
| AI match notification | "5 new providers available" (if requester)       |
| Deal reminder         | "Your deal is in progress"                       |
| Email (optional)      | Weekly digest                                    |

### Success Criteria

- Target: ≥20% D7 retention

---

## D30 RETENTION STRATEGY

### What

User quay lại sau 30 ngày

### Strategy

| Tactic            | Implementation                 |
| ----------------- | ------------------------------ |
| Push notification | "Deals this week: X completed" |
| Trust display     | Show trust score growth        |
| Review highlight  | "You have X reviews"           |
| Email (optional)  | Monthly summary                |

### Success Criteria

- Target: ≥10% D30 retention

---

## REACTIVATION STRATEGY

### Dormant User Recovery

| User State       | Signal     | Recovery Action                           |
| ---------------- | ---------- | ----------------------------------------- |
| 14 days no login | Dormant    | Push: "We miss you! X new requests match" |
| 30 days no login | Churn risk | Push: "Your profile has X views"          |
| 60 days no login | Churned    | Email: Special offer                      |

### Incomplete-Deal Recovery

| Trigger                 | Action                   |
| ----------------------- | ------------------------ |
| Deal pending >7 days    | Push: "Complete deal #X" |
| Deal revision requested | Push: "Address feedback" |

### Abandoned-Proposal Recovery

| Trigger                       | Action                        |
| ----------------------------- | ----------------------------- |
| Proposal not accepted >7 days | Push: "Check proposal status" |

---

## GOMEK: AI NEXT-ACTION

### How AI Drives Retention

| Context            | Next Action Shown                        |
| ------------------ | ---------------------------------------- |
| No offer           | "Create your first offer to get clients" |
| No proposal        | "Browse requests to submit proposal"     |
| Deal in progress   | "Submit work to complete deal"           |
| Deal completed     | "Leave review to build trust"            |
| Profile incomplete | "Complete profile to get discovered"     |

---

## SELF-ASSESSMENT

- [x] Gắn với product flow? → **CÓ**
- [x] Có specific metrics? → **CÓ**
- [x] Usable cho team? → **CÓ**

**Status: READY FOR IMPLEMENTATION**
