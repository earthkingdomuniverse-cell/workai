# ONBOARDING_ACTIVATION_UPGRADE.md

**Last Updated**: 2026-04-22
**Purpose**: Onboarding activation upgrade - tập trung vào first offer/request nhanh nhất

---

## ONBOARDING FLOOW OVERVIEW

```
[INTRO SCREENS] → [ROLE SELECT] → [PROFILE SETUP] → [SKILLS SETUP] → [GOALS SETUP] → [HOME]
```

### Current Flow Issues (TỪ PRODUCT):

- Skills setup: user không biết chọn cái gì
- Goals setup: optional → nhiều người skip → profile incomplete
- Post-onboarding: user không biết làm gì tiếp → churn

### Target:

- User tạo first offer OR first request trong vòng <10 phút sau onboarding complete

---

## SPEC UPDATES REQUIRED

### 1. Profile-Setup Update

**Current:** displayName + bio

**Update:**

- Add: "I want to" dropdown (find work / find provider / both)
- Bio helper: AI suggest template based on role
- Min bio: 20 characters → show counter

**Spec Changes Required:**

- [ ] Add wantTo field (enum: findWork, findProvider, both)
- [ ] Bio counter component
- [ ] Bio suggestion AI integration (gọi AI service)

### 2. Skills-Setup Update

**Current:** Multi-select skills từ predefined list

**Update:**

- AI suggest top 5 skills based on role + wantTo
- Show skill popularity: "X providers have this skill"
- Allow add custom skill (nice-to-have)

**Spec Changes Required:**

- [ ] Add skill popularity counter
- [ ] AI skill suggestion API call
- [ ] Skill categories for easier selection

### 3. Goals-Setup Update

**Current:** Optional, free text

**Update:**

- Make "goals" = "what I need" for requester / "what I offer" for provider
- Template options:
  - Provider: "Find projects", "Build portfolio", "Earn extra income"
  - Requester: "Find help for projects", "Build team", "Test quality"
- Goal influences AI next-action recommendations

**Spec Changes Required:**

- [ ] Change goals to template selection
- [ ] Store goal for AI recommendations

### 4. Home First Session Update

**Current:** Show offers/requests list

**Update:**

- First-login home: Show AI welcome + suggested action
- Provider: "Create your first offer to start getting clients"
- Requester: "Post a request to find help"
- AI: Personalized suggestions based on role + skills

**Spec Changes Required:**

- [ ] Add onHome component checking isFirstLogin
- [ ] AI next-action call on home load
- [ ] Quick-action buttons

---

## FIRST-SESSION CHECKLIST

| Step | Action                               | Success Criteria            | Time Target |
| ---- | ------------------------------------ | --------------------------- | ----------- |
| 1    | Complete onboarding                  | OnboardingCompleted = true  | <3 min      |
| 2    | Visit home                           | Home screen loads           | <30 sec     |
| 3    | See AI suggestion                    | AI next-action card visible | Immediate   |
| 4    | Click create offer OR create request | Create screen opens         | <1 min      |
| 5    | Fill form                            | All required fields filled  | <3 min      |
| 6    | Submit                               | Offer/Request created       | <30 sec     |
| 7    | View on list                         | New offer/request in list   | Immediate   |

**Target: <10 min từ onboarding complete đến first offer/request created**

---

## FIRST-VALUE MILESTONES

| Milestone           | Definition                      | Target Time              |
| ------------------- | ------------------------------- | ------------------------ |
| Onboarding Complete | profile meets quality threshold | <5 min after signup      |
| First Offer/Request | Offer OR Request created        | <10 min after onboarding |
| First View          | Offer/Request viewed >1 time    | <24 hours                |
| First Proposal      | Proposal submitted              | <48 hours                |
| First Deal          | Deal created                    | <7 days                  |

---

## ACTIVATION NUDGES

### AI Nudges (Post-Onboarding)

**Provider Nudge:**

```
"🌟 Welcome! Your profile looks great.

Ready to get clients? Create your first offer
and start getting matched today!"

[Create Offer] → Navigates to offer create
```

**Alternative for users with no action >24h:**

```
"💡 Tip: Providers with clear prices get 2x more views.

Check AI's price suggestion → [View]"
```

### Notification Nudges

| Trigger                  | When      | Message                                   | Action        |
| ------------------------ | --------- | ----------------------------------------- | ------------- |
| Onboarding complete      | Immediate | "Complete your profile to get matched"    | Profile edit  |
| Has profile, no offer    | >24h      | "Get your first client - create an offer" | Offer create  |
| Has offer, no proposal   | >48h      | "3 requests match your skills"            | View matches  |
| Has request, no proposal | >48h      | "New providers ready to help"             | Browse offers |

### Home Screen Nudges

- **Provider without offer**: Show floating "+ Create Offer" button
- **Requester without request**: Show "Post a request" card at top
- **No profile quality**: Show "Complete profile" banner

---

## HOME SCREEN FIRST SESSION TEMPLATE

### Provider First Home:

```
┌─────────────────────────────┐
│  Welcome, [Name]! 👋        │
│                             │
│  Last step: Create offer    │
│  ┌─────────────────────┐    │
│  │ + Create Your First │    │
│  │      Offer        │    │
│  └─────────────────────┘    │
│                             │
│  AI Suggestions for you:     │
│  ┌─────────────────────┐    │
│  │ 💰 Price: 500K-1M  │    │
│  │ Your skill in     │    │
│  │ demand: 234     │    │
│  └─────────────────────┘    │
│                             │
│  [View Matching Requests]    │
│  [Browse Offers]          │
└─────────────────────────────┘
```

### Requester First Home:

```
┌─────────────────────────────┐
│  Welcome, [Name]! 👋        │
│                             │
│  Last step: Post request     │
│  ┌─────────────────────┐    │
│  │ + Post a Request    │    │
│  └─────────────────────┘    │
│                             │
│  Find the right help:       │
│  ┌─────────────────────┐    │
│  │ 🎯 AI Match: 12    │    │
│  │ providers ready    │    │
│  └─────────────────────┘    │
│                             │
│  Browse by skill:           │
│  [Design] [Video] [Code]  │
└─────────────────────────────┘
```

---

## SPEC CHANGES REQUIRED

### Files to Update:

1. `/mobile/app/(onboarding)/profile-setup.tsx`
   - Add wantTo field
   - Add bio counter
2. `/mobile/app/(onboarding)/skills-setup.tsx`
   - Add skill popularity
   - Add AI suggestions
3. `/mobile/app/(onboarding)/goals-setup.tsx`
   - Change to template selection
4. `/mobile/app/(tabs)/home.tsx`
   - Add first-session detection
   - Add AI welcome card
   - Add quick-action buttons

5. `/mobile/src/services/aiService.ts`
   - Add next-action endpoint
   - Add skill suggestions

### Timeline:

- T-7: Profile-setup update
- T-6: Skills-setup update
- T-5: Goals-setup update
- T-4: Home first-session update
- T-3: Testing

---

## SUCCESS METRICS

| Metric                       | Target  | Current                  |
| ---------------------------- | ------- | ------------------------ |
| First offer/request time     | <10 min | unknown                  |
| Onboarding completion rate   | >70%    | unknown (need analytics) |
| Home to first action         | >60%    | unknown                  |
| Post-onboarding D1 retention | >50%    | unknown                  |

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → CÓ, spec cụ thể + templates
2. Có đủ cụ thể để team vận hành không? → CÓ, có files to update + timeline
3. Có gắn với product flow hiện tại không? → CÓ, gắn với onboarding flow + home screen
4. Có tránh nói kiểu startup sáo rỗng không? → CÓ, specific metrics + timeline

**Status: READY FOR IMPLEMENTATION**
