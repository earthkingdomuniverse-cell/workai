# GO_LIVE_PLAYBOOK.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Go-live playbook chính thức - step-by-step cho launch team

---

## T-7 DAYS CHECKLIST (Day before go)

### Launch Blockers Verification:

- [ ] All items in GO_LIVE_MASTER_CHECKLIST in "Must-have" status = DONE
- [ ] No HIGH severity bugs open
- [ ] Performance: API <500ms, App load <3s on 3G
- [ ] Security: No XSS, SQL injection, auth bypass

### Infrastructure:

- [ ] Production database ready (or mock mode confirmed working)
- [ ] Production env variables configured
- [ ] Logging enabled (errors captured)
- [ ] Health check endpoint working
- [ ] Backup verification (if DB exists)

### Communication Prep:

- [ ] Launch announcement drafted (Task 20)
- [ ] Internal team notified
- [ ] Support escalation path defined (Task 19)
- [ ] Rollback procedure documented

### Demo/Test:

- [ ] End-to-end user flow tested
- [ ] Admin/dashboard tested
- [ ] AI features tested
- [ ] Payment simulation tested

---

## T-3 DAYS CHECKLIST

### Final QA:

- [ ] Full functional test passed
- [ ] Crash-free test passed
- [ ] All screens verified
- [ ] All API endpoints verified

### Prepare for Deploy:

- [ ] Build version finalized
- [ ] Version number incremented
- [ ] Changelog prepared

### User Acquisition Ready:

- [ ] First 100 users contacts ready (Task 24)
- [ ] Invitation system ready
- [ ] Warm user list prepared

### Monitoring Ready:

- [ ] Analytics event tracking verified
- [ ] Dashboard accessible
- [ ] Error monitoring accessible

---

## T-1 DAY CHECKLIST

### Pre-launch Night:

- [ ] Final build deployed to staging
- [ ] Final sanity check passed
- [ ] All leads have app installed
- [ ] All leads know how to report issues
- [ ] On-call schedule confirmed

### Communication:

- [ ] Tweet announcing tomorrow ready
- [ ] Email to contacts ready(in)
- [ ] Slack/Discord announcement ready

---

## LAUNCH DAY CHECKLIST

### Hour by Hour:

| Time    | Action                   | Owner   |
| ------- | ------------------------ | ------- |
| T-1h    | Final app build check    | Dev     |
| T-30min | Deploy + verify          | Dev     |
| T-0     | App available            | Dev     |
| T+1h    | Monitor signup rate      | Founder |
| T+2h    | Monitor errors           | Dev     |
| T+4h    | First check-in           | Founder |
| T+8h    | First feedback collected | Founder |
| T+12h   | Day 0 summary            | Team    |

### What to Watch:

| Metric        | Expected         | Action if Wrong      |
| ------------- | ---------------- | -------------------- |
| Signups       | >50 in first 24h | Reach out to network |
| App crashes   | 0                | Hotfix if any        |
| API errors    | <1%              | Check logs           |
| App load time | <3s              | Optimize             |

### First-day Team:

- Founder: Monitor metrics + user feedback
- Dev: Monitor errors + fix critical
- Support: Be available for issues

---

## T+1 REVIEW (Day after launch)

### Metrics to Review:

| Metric        | Target | Actual | Notes |
| ------------- | ------ | ------ | ----- |
| Total signups | 50+    | [ ]    |       |
| App opens     | 40+    | [ ]    |       |
| First actions | 20+    | [ ]    |       |
| Crash count   | 0      | [ ]    |       |
| API errors    | <5     | [ ]    |       |

### Issues Fixed:

- [ ] Bug #1: [Description] → Fixed
- [ ] Bug #2: [Description] → Fixed

### User Feedback:

- Positive: []
- Constructive: []

---

## T+3 REVIEW (3 days post-launch)

### Metrics to Review:

| Metric                | Target | Actual | Notes |
| --------------------- | ------ | ------ | ----- |
| Signups               | 100+   | [ ]    |       |
| Active offers         | 30+    | [ ]    |       |
| Active requests       | 15+    | [ ]    |       |
| D1 retention          | >50%   | [ ]    |       |
| Onboarding completion | >70%   | [ ]    |       |

### Issues Fixed:

- [ ] All Day 1 issues fixed

### Growth Check:

- [ ] Manual invites sent
- [ ] User feedback collected
- [ ] AI nudges working

---

## T+7 REVIEW (7 days post-launch)

### Metrics to Review:

| Metric         | Target | Actual | Notes |
| -------------- | ------ | ------ | ----- |
| Signups        | 200+   | [ ]    |       |
| First offers   | 50+    | [ ]    |       |
| First requests | 25+    | [ ]    |       |
| Proposals      | 30+    | [ ]    |       |
| Deals          | 5+     | [ ]    |       |
| Reviews        | 5+     | [ ]    |       |

### Health Check:

- [ ] Marketplace showing activity
- [ ] AI matching working
- [ ] Retention okay
- [ ] No major issues

### Decisions:

- [ ] Continue as-is
- [ ] Adjust [area]
- [ ] Fix [issue]

---

## MONITORING RESPONSIBILITIES

### Founder/Lead Responsibilities:

| Time   | What to Monitor        |
| ------ | ---------------------- |
| Daily  | Signups (new users)    |
| Daily  | Active offers/requests |
| Daily  | Proposals              |
| Daily  | Errors/crashes         |
| Weekly | Deal flow              |
| Weekly | Retention              |

### On-call Coverage:

| Time     | Who                |
| -------- | ------------------ |
| Week 1   | Founder            |
| Week 2-4 | Founder + Rotating |

### What to Escalate:

| Issue Level           | Response Time | Who       |
| --------------------- | ------------- | --------- |
| Critical (crash)      | <1 hour       | Immediate |
| High (broken feature) | <4 hours      | Day time  |
| Medium (UX issue)     | <24 hours     | Next day  |

---

## ROLLBACK CONDITIONS

### When to Rollback:

| Condition             | Action               |
| --------------------- | -------------------- |
| Crash rate >5%        | Rollback immediately |
| Critical security bug | Rollback immediately |
| Major feature broken  | Hotfix or rollback   |
| Data loss             | Immediate rollback   |

### Rollback Procedure:

1. Team call + agreement
2. Cancel any pending deploys
3. Revert to previous build
4. Deploy previous version
5. Verify fix
6. Communicate to users

### Rollback Communication:

- Email to affected: "We've temporarily rolled back..."
- Tweet: "Quick fix in progress..."
- No detailed explanation of root cause (security)

---

## COMMS PLAN REFERENCE

See: LAUNCH_COMMUNICATION_PLAN.md (Task 20)

---

## SUPPORT ESCALATION REFERENCE

See: SUPPORT_AND_INCIDENT_OPS.md (Task 19)

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, step-by-step checklists
2. Có đủ cụ thể để team vận hành không? → YES, hour-by-hour checklists
3. Có gắn với product flow hiện tại không? → YES, realistic setup
4. Có tránh nói kiểu startup sáo rỗng không? → YES, actionable

**Status: READY FOR LAUNCH DAY**
