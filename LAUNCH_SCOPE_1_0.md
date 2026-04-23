# LAUNCH SCOPE 1.0 - SKILLVALUE AI PUBLIC RELEASE

**Version**: 1.0.0  
**Target Launch Date**: [INSERT DATE]  
**Last Updated**: April 23, 2026  
**Status**: SCOPE LOCKED

---

## 🚨 READ FIRST: LAUNCH PHILOSOPHY

> **"Ship what works. Defer what doesn't. Cut what distracts."**

This document is the single source of truth. If it's not listed here as "Must-Have", it's not in 1.0.

---

## 1. LAUNCH BLOCKERS (Must Fix Before Launch)

These will block the launch if not resolved. Zero exceptions.

| #   | Module        | Item                                 | Owner           | Deadline  | Current Status |
| --- | ------------- | ------------------------------------ | --------------- | --------- | -------------- |
| B1  | **Auth**      | Token auto-refresh (ROLE-004)        | @backend-team   | T-7 days  | 🔴 BLOCKED     |
| B2  | **Deals**     | Payment integration (Stripe Connect) | @backend-team   | T-14 days | 🔴 BLOCKED     |
| B3  | **Deals**     | Deal escrow/funding workflow         | @backend-team   | T-14 days | 🔴 BLOCKED     |
| B4  | **Trust**     | ID verification (KYC) integration    | @backend-team   | T-10 days | 🔴 BLOCKED     |
| B5  | **App**       | iOS App Store approval               | @mobile-team    | T-7 days  | 🔴 BLOCKED     |
| B6  | **App**       | Android Play Store approval          | @mobile-team    | T-7 days  | 🟡 IN REVIEW   |
| B7  | **Backend**   | Production database migration        | @devops-team    | T-3 days  | 🟢 READY       |
| B8  | **Backend**   | SSL certificate + DNS live           | @devops-team    | T-3 days  | 🟢 READY       |
| B9  | **Analytics** | Core events firing correctly         | @analytics-team | T-5 days  | 🟡 IN TEST     |
| B10 | **Support**   | Escalation to humans working         | @support-team   | T-5 days  | 🟡 IN TEST     |

**BLOCKER ESCALATION**: If any blocker is not resolved by T-3 days, launch is delayed.

---

## 2. MUST-HAVE AT LAUNCH (Core 1.0)

These features MUST be complete and working. No compromises.

### 2.1 Auth Module

| Feature                       | Status      | Notes                   |
| ----------------------------- | ----------- | ----------------------- |
| Email/password signup + login | ✅ REQUIRED | Full flow working       |
| Email verification            | ✅ REQUIRED | Gate before access      |
| Password reset                | ✅ REQUIRED | Via email               |
| Google OAuth                  | ✅ REQUIRED | Social login            |
| Token refresh (auto)          | ✅ REQUIRED | **BLOCKER B1**          |
| Session timeout               | ✅ REQUIRED | 30 min inactivity       |
| Account lockout               | ✅ REQUIRED | After 5 failed attempts |
| Logout everywhere             | ✅ REQUIRED | Kill all sessions       |

**OUT OF SCOPE FOR 1.0**: Apple Sign-In, LinkedIn OAuth, 2FA/MFA, biometric login

---

### 2.2 Onboarding Module

| Feature                                   | Status      | Notes                                 |
| ----------------------------------------- | ----------- | ------------------------------------- |
| 4-step onboarding flow                    | ✅ REQUIRED | Profile → Skills → Preferences → Done |
| Profile creation (name, avatar, bio)      | ✅ REQUIRED | Basic info                            |
| Skills selection                          | ✅ REQUIRED | Multi-select from taxonomy            |
| AI skill suggestions                      | ✅ REQUIRED | Based on profile text                 |
| Trust score calculation                   | ✅ REQUIRED | Base 50 + adjustments                 |
| Email verification gate                   | ✅ REQUIRED | Block until verified                  |
| Push notification permission              | ✅ REQUIRED | Ask at appropriate time               |
| First-time user tutorial                  | ✅ REQUIRED | Coach marks on key screens            |
| Activation tracking (first deal/proposal) | ✅ REQUIRED | Analytics event                       |

**OUT OF SCOPE FOR 1.0**: Advanced profile (portfolio, certificates), welcome email sequence, video onboarding

---

### 2.3 Offers Module

| Feature                               | Status      | Notes                                 |
| ------------------------------------- | ----------- | ------------------------------------- |
| Create offer form                     | ✅ REQUIRED | Title, description, pricing, delivery |
| Offer validation                      | ✅ REQUIRED | Required fields, pricing range        |
| Offer categories (25)                 | ✅ REQUIRED | Taxonomy locked                       |
| Upload cover image                    | ✅ REQUIRED | S3 integration                        |
| Offer status (draft/published/paused) | ✅ REQUIRED | State machine                         |
| My offers list                        | ✅ REQUIRED | Provider view                         |
| Offer detail view                     | ✅ REQUIRED | Public view                           |
| Edit/delete own offers                | ✅ REQUIRED | CRUD operations                       |
| Search offers                         | ✅ REQUIRED | Text + category filter                |
| AI price suggestion                   | ✅ REQUIRED | When creating offer                   |

**OUT OF SCOPE FOR 1.0**: Offer templates, recurring offers, promoted/paid listings, offer analytics

---

### 2.4 Requests Module

| Feature                    | Status      | Notes                |
| -------------------------- | ----------- | -------------------- |
| Create request form        | ✅ REQUIRED | Similar to offers    |
| Request validation         | ✅ REQUIRED | Same as offers       |
| Budget range input         | ✅ REQUIRED | Min/max              |
| Deadline/urgency selection | ✅ REQUIRED | Timeline             |
| My requests list           | ✅ REQUIRED | Client view          |
| Request detail view        | ✅ REQUIRED | Public view          |
| Edit/delete own requests   | ✅ REQUIRED | CRUD operations      |
| Search requests            | ✅ REQUIRED | Text + filters       |
| AI match recommendations   | ✅ REQUIRED | Show matching offers |

**OUT OF SCOPE FOR 1.0**: Request templates, automatic request expiration, request analytics

---

### 2.5 Proposals Module

| Feature                            | Status      | Notes                      |
| ---------------------------------- | ----------- | -------------------------- |
| Submit proposal to request         | ✅ REQUIRED | Message + price + timeline |
| Submit proposal to offer           | ✅ REQUIRED | Same flow                  |
| View received proposals (provider) | ✅ REQUIRED | Incoming requests          |
| View sent proposals (client)       | ✅ REQUIRED | Outgoing offers            |
| Accept proposal                    | ✅ REQUIRED | Creates deal               |
| Reject proposal                    | ✅ REQUIRED | With reason optional       |
| Withdraw proposal                  | ✅ REQUIRED | Before acceptance          |
| Proposal detail view               | ✅ REQUIRED | Full details               |
| Proposal notifications             | ✅ REQUIRED | Real-time or poll          |

**OUT OF SCOPE FOR 1.0**: Proposal templates, proposal negotiation (counter-offer), proposal analytics

---

### 2.6 Deals Module

| Feature                     | Status      | Notes                                                 |
| --------------------------- | ----------- | ----------------------------------------------------- |
| Deal creation from proposal | ✅ REQUIRED | Auto-created on accept                                |
| Deal detail view            | ✅ REQUIRED | Status, milestones, timeline                          |
| Deal status workflow        | ✅ REQUIRED | Created → Funded → In Progress → Submitted → Released |
| Milestone creation          | ✅ REQUIRED | Up to 5 per deal                                      |
| Milestone tracking          | ✅ REQUIRED | Mark complete, approve                                |
| Fund deal (escrow)          | ✅ REQUIRED | **BLOCKER B2, B3**                                    |
| Submit work for milestone   | ✅ REQUIRED | Attach deliverables                                   |
| Release payment             | ✅ REQUIRED | Client approves → provider paid                       |
| Dispute filing              | ✅ REQUIRED | With reason                                           |
| Deal history/timeline       | ✅ REQUIRED | Audit trail                                           |
| My deals as provider        | ✅ REQUIRED | Provider view                                         |
| My deals as client          | ✅ REQUIRED | Client view                                           |
| Deal search/filter          | ✅ REQUIRED | By status, date                                       |

**CAN SHIP WITH LIMITATION**:

- Manual bank transfer (not automated) for first 2 weeks
- Single milestone only for MVP (not multi)

**OUT OF SCOPE FOR 1.0**:

- Automatic recurring deals
- Deal templates
- Partial payments
- Subscription deals
- Insurance/escrow premium

---

### 2.7 AI Module

| Feature                    | Status       | Notes                       |
| -------------------------- | ------------ | --------------------------- |
| AI match recommendations   | ✅ REQUIRED  | Match offers/requests/users |
| AI price suggestions       | ✅ REQUIRED  | Floor/ceiling/suggested     |
| AI support chatbot         | ✅ REQUIRED  | Basic Q&A                   |
| AI trust score calculation | ✅ REQUIRED  | Multi-factor                |
| AI fraud detection         | ✅ REQUIRED  | Pattern-based rules         |
| AI content moderation      | ✅ REQUIRED  | Auto-flag inappropriate     |
| AI next best action        | 🟡 CAN DEFER | Suggestions on home screen  |
| AI skill extraction        | 🟡 CAN DEFER | Parse from profile          |
| AI description generation  | 🟡 CAN DEFER | Help write offers           |

**OUT OF SCOPE FOR 1.0**:

- AI review summarization
- AI-powered search
- AI negotiation assistant
- AI contract generation

---

### 2.8 Trust/Reviews Module

| Feature                         | Status      | Notes            |
| ------------------------------- | ----------- | ---------------- |
| Trust score display (0-100)     | ✅ REQUIRED | On profile       |
| Trust factors breakdown         | ✅ REQUIRED | Show components  |
| Review submission after deal    | ✅ REQUIRED | 1-5 stars + text |
| Review display on profile       | ✅ REQUIRED | Public reviews   |
| Fraud detection rules           | ✅ REQUIRED | 15 active rules  |
| Suspicious activity flagging    | ✅ REQUIRED | Auto to admin    |
| ID verification (KYC)           | ✅ REQUIRED | **BLOCKER B4**   |
| Manual trust adjustment (admin) | ✅ REQUIRED | Override score   |

**CAN SHIP WITH LIMITATION**:

- Manual ID review for first 100 users (not automated KYC)
- Simplified trust algorithm for launch

**OUT OF SCOPE FOR 1.0**:

- Reputation badges/achievements
- Trust decay over time
- Social graph trust
- Verified skill badges

---

### 2.9 Messaging Module

| Feature                                    | Status      | Notes                 |
| ------------------------------------------ | ----------- | --------------------- |
| Conversation list (inbox)                  | ✅ REQUIRED | All conversations     |
| Conversation detail (chat UI)              | ✅ REQUIRED | Messages with bubbles |
| Send text message                          | ✅ REQUIRED | Real-time or poll     |
| Push notification for new message          | ✅ REQUIRED | Alert user            |
| Unread count badge                         | ✅ REQUIRED | On inbox icon         |
| Mark as read                               | ✅ REQUIRED | Manual/auto           |
| Message timestamps                         | ✅ REQUIRED | Relative time         |
| Conversation creation (from deal/proposal) | ✅ REQUIRED | Auto-create           |

**CAN SHIP WITH LIMITATION**:

- Poll every 30 seconds (not WebSocket) for MVP
- Text only (no images/attachments in v1)

**OUT OF SCOPE FOR 1.0**:

- Real-time WebSocket
- File attachments
- Voice messages
- Group conversations
- Message search

---

### 2.10 Notifications Module

| Feature                       | Status       | Notes                         |
| ----------------------------- | ------------ | ----------------------------- |
| Notification list             | ✅ REQUIRED  | Activity feed                 |
| Push notifications (FCM/APNs) | ✅ REQUIRED  | **BLOCKER B5, B6**            |
| In-app notifications          | ✅ REQUIRED  | Badge + list                  |
| Notification types (8)        | ✅ REQUIRED  | Message, Deal, Proposal, etc. |
| Mark as read                  | ✅ REQUIRED  | Single + all                  |
| Delete notification           | ✅ REQUIRED  | Swipe to delete               |
| Deep link to relevant screen  | ✅ REQUIRED  | Tap opens context             |
| Notification preferences      | 🟡 CAN DEFER | Toggle types                  |

**OUT OF SCOPE FOR 1.0**:

- Email notifications
- SMS notifications
- Scheduled/digest notifications
- Smart notification batching

---

### 2.11 Admin/Operator Module

| Feature                              | Status      | Notes                |
| ------------------------------------ | ----------- | -------------------- |
| Admin role authentication            | ✅ REQUIRED | RBAC                 |
| User management (view/suspend)       | ✅ REQUIRED | Basic CRUD           |
| Deal monitoring dashboard            | ✅ REQUIRED | All deals view       |
| Dispute management                   | ✅ REQUIRED | Resolve disputes     |
| Fraud review queue                   | ✅ REQUIRED | Review flagged items |
| Content moderation                   | ✅ REQUIRED | Approve/reject       |
| System announcements                 | ✅ REQUIRED | Broadcast to users   |
| Trust score manual adjustment        | ✅ REQUIRED | Override             |
| User search                          | ✅ REQUIRED | Find by email/name   |
| User detail view                     | ✅ REQUIRED | Full profile         |
| Deal detail view                     | ✅ REQUIRED | Full deal info       |
| Review detail view                   | ✅ REQUIRED | Review content       |
| Basic stats (user count, deal count) | ✅ REQUIRED | Dashboard cards      |

**CAN SHIP WITH LIMITATION**:

- Manual SQL queries for complex reports
- No real-time charts (daily batch OK)

**OUT OF SCOPE FOR 1.0**:

- Granular permissions (roles beyond admin/user)
- Advanced analytics dashboards
- Automated moderation
- Bulk operations
- Configuration management UI

---

### 2.12 Monetization Module

| Feature                         | Status         | Notes                    |
| ------------------------------- | -------------- | ------------------------ |
| Pricing model defined (10% fee) | ✅ REQUIRED    | Clear terms              |
| Payment processor (Stripe)      | ✅ REQUIRED    | **BLOCKER B2**           |
| Transaction fee calculation     | ✅ REQUIRED    | Auto-calculate 10%       |
| Provider payout                 | 🟡 CAN DEFER   | Manual for first 2 weeks |
| Revenue tracking                | 🟡 CAN DEFER   | Basic count OK           |
| Revenue dashboard               | 🔴 POST-LAUNCH | Not required for launch  |
| Tax handling                    | 🔴 POST-LAUNCH | Not required for launch  |
| Refund processing               | 🟡 CAN DEFER   | Manual for disputes      |

**CAN SHIP WITH LIMITATION**:

- Manual payout via bank transfer for first $50K volume
- Deferred revenue dashboard
- Manual tax reporting

**OUT OF SCOPE FOR 1.0**:

- Subscription tiers
- Promoted listings
- Premium features
- In-app purchases
- Affiliate/Referral program
- Coupons/promotions

---

### 2.13 Analytics Module

| Feature                         | Status       | Notes                   |
| ------------------------------- | ------------ | ----------------------- |
| Core events implemented (20)    | ✅ REQUIRED  | **BLOCKER B9**          |
| User properties captured        | ✅ REQUIRED  | Demographics            |
| Signup funnel tracking          | ✅ REQUIRED  | Onboarding → Activation |
| Deal conversion tracking        | ✅ REQUIRED  | Proposal → Deal         |
| Retention cohorts               | ✅ REQUIRED  | D1, D7, D30             |
| Real-time dashboard (Amplitude) | 🟡 CAN DEFER | Daily OK for launch     |
| Revenue analytics               | 🟡 CAN DEFER | After payment live      |
| Error tracking (Sentry)         | ✅ REQUIRED  | Crash reporting         |
| Performance monitoring          | ✅ REQUIRED  | API latency             |

**CAN SHIP WITH LIMITATION**:

- Daily batch reports (not real-time)
- Manual SQL for custom queries

**OUT OF SCOPE FOR 1.0**:

- Advanced segmentation
- Predictive analytics
- A/B testing platform
- Data warehouse

---

## 3. CAN SHIP WITH LIMITATION (Known Gaps)

These items have acceptable workarounds for 1.0.

| #   | Feature       | Limitation                  | Workaround                | Plan to Fix           |
| --- | ------------- | --------------------------- | ------------------------- | --------------------- |
| L1  | Messaging     | No WebSocket (poll 30s)     | Client polling            | 1.1 (Sprint 3)        |
| L2  | Messaging     | Text only (no attachments)  | External file share       | 1.1                   |
| L3  | Notifications | No email notifications      | In-app + push only        | 1.2                   |
| L4  | AI            | Simplified algorithms       | Less accurate matching    | 1.1                   |
| L5  | Deals         | Manual payout process       | Bank transfer weekly      | 1.2 (Stripe auto)     |
| L6  | Deals         | Single milestone only       | Split into multiple deals | 1.1 (multi-milestone) |
| L7  | Trust         | Manual ID review            | Ops team reviews          | 1.2 (auto KYC)        |
| L8  | Admin         | No real-time charts         | Daily SQL reports         | 1.1 (dashboard)       |
| L9  | Analytics     | Daily batch (not real-time) | Acceptable for launch     | 1.1 (streaming)       |
| L10 | Support       | AI bot only for L1          | Escalate to humans        | 1.0 (hybrid)          |

**COMMUNICATION**: These limitations must be documented in user-facing FAQ.

---

## 4. POST-LAUNCH BACKLOG (1.1, 1.2, 1.3)

These are prioritized but NOT in 1.0 scope.

### 4.1 Version 1.1 (Sprint 3-4) - Stability + Polish

| Priority | Feature                       | Module        |
| -------- | ----------------------------- | ------------- |
| P0       | WebSocket messaging           | Messaging     |
| P0       | Real-time notifications       | Notifications |
| P0       | Token auto-refresh fix        | Auth          |
| P1       | Multi-milestone deals         | Deals         |
| P1       | Email notifications           | Notifications |
| P1       | Revenue dashboard             | Admin         |
| P1       | AI next best action           | AI            |
| P2       | Dark mode                     | App           |
| P2       | Push notification preferences | Notifications |

### 4.2 Version 1.2 (Sprint 5-6) - Growth

| Priority | Feature                      | Module       |
| -------- | ---------------------------- | ------------ |
| P0       | Automated Stripe payouts     | Monetization |
| P0       | Auto KYC/ID verification     | Trust        |
| P0       | Referral program             | Growth       |
| P1       | Promoted listings            | Monetization |
| P1       | Subscription tiers           | Monetization |
| P1       | File attachments in messages | Messaging    |
| P2       | Apple Sign-In                | Auth         |
| P2       | Biometric login              | Auth         |
| P2       | Group conversations          | Messaging    |

### 4.3 Version 1.3 (Sprint 7-8) - Scale

| Priority | Feature                   | Module    |
| -------- | ------------------------- | --------- |
| P0       | Real-time analytics       | Analytics |
| P0       | Advanced admin dashboards | Admin     |
| P1       | AI-powered search         | AI        |
| P1       | AI negotiation assistant  | AI        |
| P2       | Mobile app v2 redesign    | App       |
| P2       | Web app (PWA)             | App       |
| P2       | API for partners          | Backend   |

---

## 5. EXPLICITLY OUT OF SCOPE (Not in 1.0, 1.1, or 1.2)

These features are intentionally excluded. Do NOT work on them.

| Feature                        | Reason                | Future Consideration     |
| ------------------------------ | --------------------- | ------------------------ |
| **Web app (desktop)**          | Mobile-first strategy | 1.3 or later             |
| **Multi-language i18n**        | English-only for MVP  | 1.2+ if global expansion |
| **Blockchain/crypto payments** | Regulatory complexity | After legal review       |
| **Video calling in app**       | Complexity, use Zoom  | Partnership              |
| **White-label solution**       | B2B different product | Separate product line    |
| **Physical goods marketplace** | Different logistics   | Different product        |
| **Job board/recruiting**       | Different use case    | Spin-off product         |
| **In-app currency/tokens**     | Regulatory complexity | Legal review required    |
| **Gamification/achievements**  | Nice-to-have          | 1.3+                     |
| **Social feed/following**      | Scope creep           | Feature request          |
| **AI contract generation**     | Legal complexity      | With legal team          |
| **Voice AI assistant**         | Cost/complexity       | 2.0                      |
| **AR/VR features**             | Not core value        | Experimental             |
| **Offline mode (full)**        | Technical complexity  | PWA 1.3                  |
| **Advanced AI (GPT-4 Vision)** | Cost                  | Scale up                 |

---

## 6. LAUNCH METRICS (Success Criteria)

### Technical Metrics

| Metric            | Target  | Measurement    |
| ----------------- | ------- | -------------- |
| App crash rate    | < 0.1%  | Crashlytics    |
| API uptime        | > 99.9% | CloudWatch     |
| API latency (p95) | < 500ms | CloudWatch     |
| App store rating  | > 4.0   | App Store/Play |

### Business Metrics

| Metric               | Target     | Measurement |
| -------------------- | ---------- | ----------- |
| Day 1 activation     | > 30%      | Analytics   |
| Day 7 retention      | > 20%      | Analytics   |
| Month 1 retention    | > 10%      | Analytics   |
| Proposal → Deal rate | > 40%      | Analytics   |
| Trust score avg      | > 60       | Database    |
| Support tickets      | < 5% users | Zendesk     |

---

## 7. SIGN-OFF

This scope is locked. Changes require:

- Written proposal
- Impact assessment
- Approval from: PM + Tech Lead + CEO

| Role            | Name   | Signature      | Date   |
| --------------- | ------ | -------------- | ------ |
| Product Manager | [NAME] | ******\_****** | [DATE] |
| Tech Lead       | [NAME] | ******\_****** | [DATE] |
| CEO             | [NAME] | ******\_****** | [DATE] |

---

**SCOPE FROZEN**: April 23, 2026  
**NEXT REVIEW**: At 1.0 launch retrospective  
**DOCUMENT OWNER**: @product-team

---

**REMINDER**:

- If it's not in "Must-Have", it's not happening
- If it's blocked, escalate immediately
- If you find new scope, push to 1.1

**"Better to launch small and iterate than to delay for perfection."**
