# ACTIVATION_FUNNEL.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22  
**Purpose**: Activation funnel chính thức - đo lường từng bước

---

## FUNNEL OVERVIEW

| Stage | Step Name              | Definition                   | Drop-off Risk |
| ----- | ---------------------- | ---------------------------- | ------------- |
| 1     | Install/Open           | User mở app lần đầu          | -             |
| 2     | Signup                 | Tạo account + login          | Medium        |
| 3     | Onboarding Complete    | Hoàn thành role/skills/goals | High          |
| 4     | Profile Quality        | Profile đạt threshold        | Medium        |
| 5     | First Offer OR Request | Tạo listing đầu tiên         | **HIGH**      |
| 6     | First Proposal         | Gửi/h nhận proposal          | Medium        |
| 7     | First Funded Deal      | Deal có funding              | **HIGH**      |
| 8     | First Released Deal    | Deal hoàn thành              | **HIGH**      |
| 9     | First Review           | Để lại review                | Medium        |

---

## STAGE 1: INSTALL/OPEN

### Success Condition

- App hiển thị onboarding intro hoặc login screen
- Cold start time <3s

### Friction Có Thể Có

| Friction          | Cause            | Mitigation         |
| ----------------- | ---------------- | ------------------ |
| White screen >3s  | Bundle load chậm | Optimize bundle    |
| Crash on open     | Bug              | Error boundary     |
| Permission denied | Storage          | Request gracefully |

### AI Can Thiệp

**KHÔNG** - native app behavior

### Metric

```
funnel_stage_installed = COUNT(user_id) WHERE event = "app_open"
```

### Recovery Action

- Fix crash reports
- Optimize bundle size

---

## STAGE 2: SIGNUP

### Success Condition

- Email/password signup → returns JWT
- Token saved to device
- Redirect to onboarding flow

### Friction Có Thể Có

| Friction           | Cause              | Mitigation           |
| ------------------ | ------------------ | -------------------- |
| Email format error | Validation         | Show inline error    |
| Password weak      | Validation         | Show requirements    |
| Already exists     | Duplicate email    | Show "login instead" |
| Token save failed  | AsyncStorage error | Retry + error msg    |

### AI Can Thiệp

**KHÔNG** - signup là manual action

### Metric

```
funnel_stage_signup = COUNT(user_id) WHERE event = "signup_success"
funnel_signup_rate = funnel_stage_signup / funnel_stage_installed
Target: ≥40%
```

### Recovery Action

- T+2 days: Push "Complete signup - special offer"
- Email collection pre-launch

---

## STAGE 3: ONBOARDING COMPLETE

### Success Condition

- Onboarding state = completed
- User on Home screen
- Role đã chọn (provider/requester)

### Friction Có Thể Có

| Friction         | Cause                 | Mitigation            |
| ---------------- | --------------------- | --------------------- |
| Skills quá ít    | Skip step             | Required 1+ skill     |
| Bỏ giữa chừng    | Chưa hiểu value       | Show progress bar     |
| Reload mất state | Not persisted         | Resume from last step |
| Role confusion   | Provider vs Requester | Show examples         |

### AI Can Thiệp

| AI Action         | Where                          |
| ----------------- | ------------------------------ |
| Skill suggestions | Skills step                    |
| Next-action       | After onboarding - "Tạo offer" |

### Metric

```
funnel_stage_onboarding = COUNT(user_id) WHERE event = "onboarding_completed"
funnel_onboarding_rate = funnel_stage_onboarding / funnel_stage_signup
Target: ≥70%
```

### Recovery Action

- If drop-off: Push "Hoàn tất onboarding để bắt đầu"
- Show incomplete profile banner on home

---

## STAGE 4: FIRST PROFILE QUALITY

### Success Condition

- displayName: NOT empty
- skills: ≥1 skill selected
- bio: ≥10 characters (khuyến khích)

### Friction Có Thể Có

| Friction          | Cause              | Mitigation     |
| ----------------- | ------------------ | -------------- |
| Empty displayName | Skip required      | Block progress |
| No skills         | Not selected       | Block progress |
| Bio too short     | Optional nhưng cần | Show examples  |

### AI Can Thiệp

| AI Action            | Where        |
| -------------------- | ------------ |
| Profile tips         | Profile edit |
| Skill recommendation | Skills step  |

### Metric

```
funnel_stage_profile_quality = COUNT(user_id) WHERE profile_quality = "ready"
funnel_profile_quality_rate = funnel_stage_profile_quality / funnel_stage_onboarding
Target: ≥80%
```

### Recovery Action

- Home shows "Complete profile" banner
- AI next-action: "Thêm skills để hiển thị"

---

## STAGE 5: FIRST OFFER OR REQUEST

### Success Condition

- Provider: Offer created, status = active
- Requester: Request created, status = open

### Friction Có Thể Có (HIGH)

| Friction             | Cause           | Mitigation          |
| -------------------- | --------------- | ------------------- |
| "Không biết viết gì" | Writer's block  | Templates           |
| "Giá bao nhiêu?"     | Pricing anxiety | **AI price button** |
| "Chưa sẵn sàng"      | Hesitation      | Save draft option   |

### AI Can Thiệp

| AI Action            | Where            | Value                           |
| -------------------- | ---------------- | ------------------------------- |
| **AI price**         | Before create    | Suggest floor/ceiling/suggested |
| Template suggestions | Create screen    | Offer/request templates         |
| **Next-action**      | After onboarding | "Tạo offer đầu tiên" - PRIMARY  |

### Metric

```
funnel_stage_first_listing = COUNT(user_id) WHERE event = "offer_created" OR "request_created"
funnel_first_listing_rate = funnel_stage_first_listing / funnel_stage_profile_quality
Target: ≥50% for providers, ≥30% for requesters
```

### Recovery Action

- If T+48h no listing: Push "Tạo offer đầu tiên"
- AI next-action persistent: "Complete để được discover"
- In-app: "Xem cách người khác viết offer"

---

## STAGE 6: FIRST PROPOSAL

### Success Condition

- Provider: Submit proposal to a request
- Requester: Receive proposal(s) to own request

### Friction Có Thể Có

| Friction                | Cause        | Mitigation        |
| ----------------------- | ------------ | ----------------- |
| "Không có request fit"  | No matching  | AI match help     |
| "Proposal bị reject"    | Quality      | Show tips         |
| Requester: No proposals | No providers | Browse + AI match |

### AI Can Thiệp

| AI Action        | Where           | Value                          |
| ---------------- | --------------- | ------------------------------ |
| **AI match**     | Request detail  | Show matching offers           |
| **AI recommend** | Home            | Recommend requests to provider |
| **AI assist**    | Create proposal | Help write message             |

### Metric

```
funnel_stage_first_proposal = COUNT(user_id) WHERE event = "proposal_sent" OR "proposal_received"
funnel_proposal_rate = funnel_stage_first_proposal / funnel_stage_first_listing
Target: ≥30%
```

### Recovery Action

- If T+72h no proposal: AI next-action "Browse requests"
- If requester no proposals: AI match notification

---

## STAGE 7: FIRST FUNDED DEAL

### Success Condition

- Deal status = funded
- Transaction created (simulated OK)

### Friction Có Thể Có (HIGH)

| Friction              | Cause               | Mitigation          |
| --------------------- | ------------------- | ------------------- |
| Proposal not accepted | Requester chưa chọn | Reminder            |
| Deal not funded       | Funding fail        | Show confirmation   |
| "Sợ bị scam"          | Trust concerns      | Trust score visible |

### AI Can Thiệp

| AI Action         | Where           | Value                     |
| ----------------- | --------------- | ------------------------- |
| **Trust display** | Proposal detail | Show provider trust score |
| **Safety tips**   | Before fund     | Guidelines                |
| **Next-action**   | After accept    | "Fund deal"               |

### Metric

```
funnel_stage_funded_deal = COUNT(user_id) WHERE event = "deal_funded"
funnel_funded_rate = funnel_stage_funded_deal / funnel_stage_first_proposal
Target: ≥40% of proposals accepted
```

### Recovery Action

- If pending >48h: Notification "Xác nhận deal với [provider]"
- Operator escalation nếu dispute

---

## STAGE 8: FIRST RELEASED DEAL

### Success Condition

- Deal status = released
- Transaction completed

### Friction Có Thể Có

| Friction              | Cause            | Mitigation      |
| --------------------- | ---------------- | --------------- |
| Work not submitted    | Provider delay   | Reminder        |
| Revision requested    | Not meeting spec | Show feedback   |
| Client not responding | Approval delay   | Reminder        |
| Dispute opened        | Conflict         | Operator handle |

### AI Can Thiệp

| AI Action                   | Where           | Value                |
| --------------------------- | --------------- | -------------------- |
| **Deal tips**               | In deal chat    | Tips for success     |
| **Next-action to provider** | After funded    | "Submit work"        |
| **Next-action to client**   | After submitted | "Review and approve" |

### Metric

```
funnel_stage_released = COUNT(user_id) WHERE event = "deal_released"
funnel_release_rate = funnel_stage_released / funnel_stage_funded_deal
Target: ≥60%
```

### Recovery Action

- If submitted >72h no response: Push "Review submitted work"
- If revision: Show specific feedback

---

## STAGE 9: FIRST REVIEW

### Success Condition

- Review created with rating (1-5) and comment

### Friction Có Thể Có

| Friction      | Cause             | Mitigation          |
| ------------- | ----------------- | ------------------- |
| Not motivated | No incentive      | Trust score display |
| Forgot        | Post-deal silence | Reminder            |
| Too busy      | Low priority      | Easy one-tap        |

### AI Can Thiệp

| AI Action           | Where          | Value                  |
| ------------------- | -------------- | ---------------------- |
| **Review prompt**   | After released | "Review = help others" |
| **Review template** | In create      | Help write             |

### Metric

```
funnel_stage_first_review = COUNT(user_id) WHERE event = "review_created"
funnel_review_rate = funnel_stage_first_review / funnel_stage_released
Target: ≥50%
```

### Recovery Action

- If T+48h no review: Push "Review [other party] build trust"

---

## FUNNEL SUMMARY

| Stage | Metric          | Target Rate                    |
| ----- | --------------- | ------------------------------ |
| 1→2   | Signup rate     | ≥40%                           |
| 2→3   | Onboarding rate | ≥70%                           |
| 3→4   | Profile quality | ≥80%                           |
| 4→5   | First listing   | ≥50% provider / ≥30% requester |
| 5→6   | Proposal rate   | ≥30%                           |
| 6→7   | Funded deal     | ≥40%                           |
| 7→8   | Released deal   | ≥60%                           |
| 8→9   | Review rate     | ≥50%                           |

### Target Cho 100 Users

```
100 opens → 40 signups → 28 onboard → 22 quality
→ 11 first listing → 3-4 proposals → 1-2 funded deals
→ 1 released deal → 0.5 review
```

---

## DASHBOARD INTEGRATION

Events cần track (Task 7):

| Event                             | Stage |
| --------------------------------- | ----- |
| app_open                          | 1     |
| signup_success                    | 2     |
| onboarding_completed              | 3     |
| profile_quality_ready             | 4     |
| offer_created / request_created   | 5     |
| proposal_sent / proposal_received | 6     |
| deal_funded                       | 7     |
| deal_released                     | 8     |
| review_created                    | 9     |

---

## RECOVERY PLAYBOOK

### Drop-off Recovery Matrix

| Stage | Signal          | Recovery Action                 |
| ----- | --------------- | ------------------------------- |
| 2     | Signup fail     | Email: "Complete signup"        |
| 3     | Onboarding drop | Push: "Complete profile"        |
| 4     | Profile low     | Home banner: "Add skills"       |
| 5     | No listing      | AI next-action + push after 48h |
| 6     | No proposal     | Notification + browse           |
| 7     | Not funded      | Reminder to both                |
| 8     | Not released    | Milestone reminders             |
| 9     | No review       | Push: "Review to build trust"   |

### Priority Recovery

1. **Stage 5 → First listing** (HIGHEST - inventory)
2. **Stage 7 → Funded deal** (HIGH - conversion)
3. **Stage 8 → Released deal** (HIGH - completion)

---

## SELF-ASSESSMENT

- [x] Funnel gắn với product flow? → **CÓ**
- [x] Có AI intervention points? → **CÓ**
- [x] Có metrics + recovery? → **CÓ**
- [x] Usable cho analytics? → **CÓ**

**Status: READY TO USE**
