# MARKETPLACE_LIQUIDITY_PLAN.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Marketplace liquidity plan - thực tế, không nói chung chung

---

## MARKETPLACE LIQUIDITY CHALLENGE

**The Truth**: Marketplace cần có cả BÊN BÁN (offers) VÀ BÊN MUA (requests) cùng lúc. Thiếu một bên = ghost marketplace.

**Common Failure**: Too few offers → no requests convert → users leave → requests drop → offers leave → dead.

---

## TARGET METRICS

### Minimum Viable Marketplace:

| Metric                           | Target                           | Reason                |
| -------------------------------- | -------------------------------- | --------------------- |
| `active_offers`                  | ≥50 unique providers with offers | Need enough to browse |
| `active_requests`                | ≥20 unique requesters            | Need enough to match  |
| `offers_with_complete_profile`   | ≥80%                             | Quality signal        |
| `requests_with_complete_profile` | ≥80%                             | Quality signal        |
| `proposals_per_offer_avg`        | ≥1                               | Match happening       |
| `proposals_per_request_avg`      | ≥2                               | Competition           |

### Healthy Marketplace:

| Metric             | Target | Reason                 |
| ------------------ | ------ | ---------------------- |
| `active_offers`    | ≥200   | Volume to find match   |
| `active_requests`  | ≥100   | Volume to convert      |
| `matches_per_week` | ≥50    | AI is being used       |
| `deals_per_week`   | ≥10    | Transactions happening |

---

## PRIORITY CATEGORIES

### Launch Categories (Week 1-4):

| #   | Category                      | Reason                          | Priority |
| --- | ----------------------------- | ------------------------------- | -------- |
| 1   | **Design (Logo, Banner, UI)** | High demand, provider sẵn có    | WEDGE    |
| 2   | **Video Editing**             | High demand, clear deliverables | HIGH     |
| 3   | **Content Writing**           | Easy to define, low barrier     | HIGH     |
| 4   | **Web Development**           | Higher value, clear scope       | MEDIUM   |
| 5   | **Marketing**                 | Broad, harder to define         | LATER    |

### Categories to AVOID at launch:

- Legal services (too complex)
- Consulting (subjective deliverables)
- Anything requiring domain expertise

---

## SUPPLY STRATEGY (Providers with Offers)

### How to get providers:

| Source           | Method                          | Target       | Notes              |
| ---------------- | ------------------------------- | ------------ | ------------------ |
| Personal network | Invite friends who freelance    | 20 providers | Wedge - quality    |
| Facebook groups  | Post in design/freelance groups | 30 providers | Must provide value |
| Upwork/Fiverr    | Invite from platforms           | 20 providers | Manual outreach    |
| Job boards       | Post "join as provider"         | 10 providers | Build in app       |
| Referral         | Existing user invite            | 20 providers | Task 10            |

**Total Target: 100 providers at launch**

### Quality criteria for offers:

- Title clear (not generic)
- Price defined (not "contact me")
- Description ≥50 chars
- At least 1 skill tag
- Profile quality meets threshold

---

## DEMAND STRATEGY (Requesters with Requests)

### How to get requesters:

| Source           | Method                          | Target        | Notes           |
| ---------------- | ------------------------------- | ------------- | --------------- |
| Personal network | Startup founders, agency owners | 15 requesters | Wedge - quality |
| LinkedIn         | Direct message small businesses | 15 requesters | Manual          |
| Twitter/FB       | Product founders                | 10 requesters | Cold outreach   |
| Referrals        | From providers                  | 10 requesters | Natural         |
| Organic          | App store discovery             | 10 requesters | Low expectation |

**Total Target: 60 requesters at launch**

### Quality criteria for requests:

- Title specific (not "need help")
- Budget min/max defined (even range OK)
- Description ≥100 chars
- Skills defined
- Clear deadline if urgent

---

## AI MATCH FOR LIQUIDITY

### How AI solves cold-start:

**Problem**: New marketplace has no matches.  
**AI Solution**: Use AI to push relevant items to both sides.

| Feature        | How It Helps                                              | Priority |
| -------------- | --------------------------------------------------------- | -------- |
| AI Match       | Auto-suggest offers when request is posted                | MUST     |
| AI Price       | Help providers price correctly, requests budget correctly | MUST     |
| AI Next Action | Nudge users to post Browse                                | SHOULD   |
| AI Support     | Help users understand platform                            | NICE     |

### AI Match Workflow:

```
1. User posts request → AI instant-match to top 5 offers
2. User notified: "We found X providers matching your needs"
3. Provider sees: "New request matches your skills"
```

### AI Threshold:

- Show matches with score ≥60
- At launch: Show matches even if low score (manual matching)
- After 100 users: AI threshold real

---

## GHOST MARKETPLACE PREVENTION

### Warning Signs:

| Metric                          | Warning         | Action            |
| ------------------------------- | --------------- | ----------------- |
| proposals_per_offer < 0.5       | Supply issue    | Get more requests |
| proposals_per_request < 1       | Demand issue    | Get more offers   |
| offers_with_0_views > 50%       | Discoverability | Improve search    |
| requests_with_0_proposals > 70% | Match quality   | Improve AI        |

### Early Warning Dashboard:

- Daily: Active offers count
- Daily: Active requests count
- Daily: Offers with zero views
- Daily: Requests with zero proposals

### Intervention Triggers:

| Trigger                     | Action                     | Owner   |
| --------------------------- | -------------------------- | ------- |
| <30 active offers           | Urgency recruit providers  | Founder |
| <15 active requests         | Urgency recruit requesters | Founder |
| >50% zero-view offers       | Fix discoverability        | Product |
| >70% zero-proposal requests | Fix matching algorithm     | AI      |

---

## LAUNCH LIQUIDITY TARGETS

### Week 1 Targets:

| Metric          | Start | Target | Notes                    |
| --------------- | ----- | ------ | ------------------------ |
| Active Offers   | 0     | 30     | Day 1-7: Network invites |
| Active Requests | 0     | 15     | Day 1-7: Manual outreach |
| Total Users     | 0     | 50     | Signups                  |

### Week 2 Targets:

| Metric          | Start | Target | Notes                  |
| --------------- | ----- | ------ | ---------------------- |
| Active Offers   | 30    | 50     | More invites + organic |
| Active Requests | 15    | 30     | More outreach          |
| Proposals       | 0     | 20     | Should start happening |

### Week 4 Targets:

| Metric          | Start | Target | Notes              |
| --------------- | ----- | ------ | ------------------ |
| Active Offers   | 50    | 80     | Growth             |
| Active Requests | 30    | 50     | Growth             |
| Deals           | 0     | 10     | First transactions |

### Week 8 Targets:

| Metric          | Target | Notes              |
| --------------- | ------ | ------------------ |
| Active Offers   | 150    | Volume             |
| Active Requests | 80     | Volume             |
| Deals           | 30     | Transaction volume |

---

## TRADE-OFFS

| Decision                       | Trade-off                            | Acceptance |
| ------------------------------ | ------------------------------------ | ---------- |
| Focus on design category first | Can't expand to other categories yet | ACCEPT     |
| Manual user recruitment        | No organic growth initially          | ACCEPT     |
| AI matching with low data      | Matching not perfect                 | ACCEPT     |
| Quality over quantity          | Slower provider acquisition          | ACCEPT     |

---

## SUCCESS CRITERIA

### At Launch (Day 0):

- [ ] ≥30 active offers from verified providers
- [ ] ≥15 active requests
- [ ] ≥50 signups
- [ ] AI match working

### At Week 4:

- [ ] ≥80 active offers
- [ ] ≥50 active requests
- [ ] ≥100 signups
- [ ] ≥10 deals completed
- [ ] ≥30 proposals sent

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, specific targets + manual recruitment plan
2. Có đủ cụ thể để team vận hành không? → YES, sources + targets listed
3. Có gắn với product flow hiện tại không? → YES, AI match integration
4. Có tránh nói kiểu startup sáo rỗng không? → YES, thực tế numbers

**Status: ACTIONABLE FOR LAUNCH**
