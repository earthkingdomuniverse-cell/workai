# GROWTH_LOOPS.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Growth loops chính thức - vòng lặp tăng trưởng

---

## 1. SUPPLY GROWTH LOOP

> Providers có việc → giới thiệu thêm providers

### Trigger:

Provider hoàn thành deal thành công

### Action:

- Notification: "Deal hoàn thành! Bạn có muốn giới thiệu không?"
- Share nút trên app
- Referral code display

### Reward:

- Provider mới được voucher giảm phí (post-1.0)
- Provider giới thiệu được-badge "Recruiter"
- Referral link tracking

### Feedback Data:

- Số lượng invite sent
- Conversion từ invite → signup
- Số lượng invite → offers

### KPI:

- providers_per_referral: target >0.5
- invite_to_signup_rate: target >20%

### Risk nếu loop bị gãy:

- Providers không có việc → không share
- Solution: Đảm bảo deal flow hoạt động

---

## 2. DEMAND GROWTH LOOP

> Requesters có deals tốt → giới thiệu thêm requesters

### Trigger:

Requester hoàn thành deal tốt đẹp

### Action:

- "Happy with the result? Tell other founders!"
- Share nút trong deal completed
- LinkedIn/Twitter share button

### Reward:

- Referral link cho bạn bè
- Early access to new features

### Feedback Data:

- Shares count
- Signups từ share
- Deals từ referrer

### KPI:

- social_shares_per_deal: target >0.3
- referrer_signup_to_deal: target >0.1

### Risk nếu loop bị gãy:

- Deals không hoàn thành → no share
- Solution: Ensure deal completion

---

## 3. PROPOSAL/DEAL CONVERSION LOOP

> Nhiều proposals → nhiều deals → nhiều proposals

### Trigger:

Proposal được accept thành deal

### Action:

- Provider: Thêm proposal mới
- Requester: Đăng request mới
- AI: Nudge cả hai

### Reward:

- Provider: Confidence, reviews
- Requester: Work done, reviews

### Feedback Data:

- Proposals per offer/request
- Conversion rates
- Time to accept

### KPI:

- proposal_to_deal_rate: target >30%
- avg_time_to_accept: target <7 days

### Risk nếu loop bị gãy:

- Proposals bị reject nhiều → providers hết motivation
- Solution: Improve matching

---

## 4. REVIEW/TRUST LOOP

> Reviews tốt → trust cao → nhiều deals hơn

### Trigger:

Deal completed

### Action:

- Prompt both to leave review
- Send notification for reviews

### Reward:

- Provider: Higher trust score, more visibility
- Requester: Good reference for future

### Feedback Data:

- Review completion rate
- Trust score changes
- Deal conversion by trust

### KPI:

- review_completion_rate: target >50%
- avg_trust_score_change: target +5 per review

### Risk nếu loop bị gãy:

- No reviews → low trust → no deals
- Solution: Nudge hard after deal

---

## 5. AI UTILITY LOOP

> AI hữu ích → user dùng nhiều AI hơn → AI tốt hơn

### Trigger:

User sử dụng AI feature (match, price, next-action)

### Action:

- AI: Collect feedback on suggestion
- User: Rate AI quality

### Reward:

- User: Better matches
- System: Training data

### Feedback Data:

- AI usage rates
- AI response ratings
- Click-through on AI suggestions

### KPI:

- ai_match_usage_rate: target >40%
- ai_match_click_rate: target >30%

### Risk nếu loop bị gãy:

- AI not useful → no adoption
- Solution: Manual matching backup

---

## 6. OPERATOR SAFETY LOOP

> Operator xử lý issue → user happy → user stay

### Trigger:

User reports issue or dispute

### Action:

- Operator resolves
- User gets notification of resolution

### Reward:

- User: Platform trust
- Operator: Learning

### Feedback Data:

- Resolution time
- User satisfaction after resolution
- Repeat issues

### KPI:

- resolution_time: target <24h
- user_retention_after_issue: target >60%

### Risk nếu loop bị gãy:

- Issues not resolved → users churn
- Solution: Fast escalation

---

## LOOP VISUALIZATION

```
┌─────────────────┐
│  SUPPLY LOOP     │
│  Provider deals │
│        ↓        │
│  "Invite friends"│
│        ↓        │
│  New providers  │
│   → More offers │
└─────────────────┘

┌─────────────────┐
│  DEMAND LOOP    │
│  Requester deal │
│        ↓       │
│ "Share result" │
│        ↓       │
│ New requesters │
│  → More needs │
└─────────────────┘

┌─────────────────┐
│ CONVERSION LOOP │
│   Proposal     │
│      ↓        │
│   Deal (✅)   │
│      ↓        │
│ Review (⭐)   │
│      ↓        │
│ Trust (↑)     │
│      ↓        │
│ More deals   │
└─────────────────┘
```

---

## LOOP PRIORITIES

| Loop         | Priority | Why                  |
| ------------ | -------- | -------------------- |
| AI Utility   | HIGH     | Core differentiation |
| Conversion   | HIGH     | Survival             |
| Trust/Review | HIGH     | Marketplace health   |
| Supply       | MEDIUM   | Growth               |
| Demand       | MEDIUM   | Growth               |
| Operator     | HIGH     | Retention            |

---

## IMPLEMENTATION NOTES

### Pre-launch:

- Build AI features strong
- Build review prompts

### Week 1-2:

- Monitor loop health
- Manual intervention if needed

### Week 3-4:

- Optimize loops based on data
- Remove broken loops

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, 6 loops defined
2. Có đủ cụ thể để team vận hành không? → YES, trigger/action/reward/KPI
3. Có gắn với product flow hiện tại không? → YES, real features
4. Có tránh nói kiểu startup sáo rỗng không? → YES, actionable loops

**Status: READY TO IMPLEMENT**
