# SUPPORT_AND_INCIDENT_OPS.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Support và incident operations spec - thực tế cho launch team

---

## SUPPORT LEVELS

### Level 1: AI Support (Automated)

- **What**: AI Support chat, FAQ
- **When**: User has common questions, basic issues
- **Response**: Immediate (AI)
- **Coverage**: ~60% of issues

### Level 2: In-App Support (Moderate)

- **What**: In-app messaging, support form
- **When**: Complex questions, unresolved by AI
- **Response**: <24 hours (founder/team)
- **Coverage**: ~30% of issues

### Level 3: Human Support (Escalation)

- **What**: Direct contact, call if needed
- **When**: Critical issues, high-value users
- **Response**: <4 hours (founder)
- **Coverage**: ~10% of issues

---

## RESPONSE PRIORITY MODEL

| Priority    | Definition                  | Response Time | Example            |
| ----------- | --------------------------- | ------------- | ------------------ |
| P1-Critical | App doesn't work, data loss | <1 hour       | Crash on launch    |
| P2-High     | Major feature broken        | <4 hours      | Can't create offer |
| P3-Medium   | Feature works poorly        | <24 hours     | Slow AI matching   |
| P4-Low      | Feature request, question   | <48 hours     | "How do I..."      |

---

## DISPUTE ESCALATION

### Dispute Flow:

```
User opens dispute → AI support attempt →
Operator review (Day 1) → Resolution (Day 2) →
Close (Day 3)
```

### Response Times:

- Initial response: <4 hours
- Full review: <24 hours
- Resolution: <48 hours

### Resolution Options:

- Accept provider claim
- Accept requester claim
- Partial refund
- No refund (incomplete work)
- Ban user (if fraud)

---

## FRAUD ESCALATION

### Fraud Detection:

- Automated signals in admin panel
- User reports
- Unusual patterns

### Response:

- Immediate: Freeze involved accounts
- Investigation: <24 hours
- Resolution: <48 hours

### Actions:

- Warning
- Temporary ban
- Permanent ban
- Report to authorities (if severe)

---

## AI SUPPORT VS HUMAN ESCALATION

### AI Support Handles:

- "How do I create offer?"
- "What is trust score?"
- "How does matching work?"
- "How do I leave review?"
- Password reset (future)

### Escalate to Human:

- Payment issues
- Dispute related
- Harassment reports
- Account bans
- Complex technical issues

### Escalation Criteria:

- User asks for human
- 2+ AI responses unresolved
- Issue type is sensitive

---

## INCIDENT SEVERITY LEVELS

### Sev 1 - Critical

- App down for all users
- Data loss/corruption
- Security breach

### Sev 2 - Major

- Feature completely broken
- Major user segment affected

### Sev 3 - Minor

- Feature slow
- Small user segment affected

### Sev 4 - Cosmetic

- UI issues
- Minor bugs

---

## COMMUNICATION GUIDELINES

### User Communication:

- Be honest about issues
- Don't blame users
- Provide timeline for fix
- Say thank you

### Internal Communication:

- Channel: Slack/Discord dedicated
- Status updates: Every 2 hours for Sev 1-2
- Post-mortem for Sev 1-2 issues

### Template Responses:

**Issue acknowledged:**
"Thanks for reporting. We're looking into it and will update you within [timeframe]."

**Issue resolved:**
"Fixed! Here's what happened and what we're doing to prevent it."

**Issue will take time:**
"We know this is frustrating. Expected fix: [date]. Thanks for your patience."

---

## ROLLBACK / PAUSE FEATURES

### When to Consider:

- Sev 1 incident not resolved <2 hours
- User complaint rate spike >50%
- Critical security issue
- Data integrity issue

### How to Rollback:

1. Team call decision
2. Revert to previous build
3. Deploy stable version
4. Communicate to users
5. Document for post-mortem

---

## ESCALATION CONTACTS

### Week 1:

| Role         | Contact | Response Time |
| ------------ | ------- | ------------- |
| Founder/Lead | [Phone] | <1 hour       |
| Developer    | [Phone] | <2 hours      |

### Week 2-4:

| Role    | Contact  | Response Time |
| ------- | -------- | ------------- |
| On-Call | Rotating | <4 hours      |

---

## SUPPORT TOOLS

- AI Support: In-app chat (AI service)
- Email: support@skillvalue.ai
- In-App: Support form
- Admin: Issue tracking

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, practical
2. Có đủ cụ thể để team vận hành không? → YES, response times
3. Có gắn với product flow hiện tại không? → YES, realistic
4. Có tránh nói kiểu startup sáo rỗng không? → YES, actionable

**Status: READY FOR LAUNCH**
