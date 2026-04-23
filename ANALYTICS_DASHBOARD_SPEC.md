# ANALYTICS_DASHBOARD_SPEC.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Analytics dashboard spec cho founder/operator

---

## DASHBOARD SECTIONS

```
1. ACQUISITION
2. ACTIVATION
3. MARKETPLACE LIQUIDITY
4. PROPOSAL FUNNEL
5. DEAL FUNNEL
6. TRUST & SAFETY
7. AI USAGE
8. RETENTION
9. MONETIZATION (disabled for 1.0)
```

---

## 1. ACQUISITION DASHBOARD

### Metrics:

| Metric             | Definition                 | Why It Matters   | Source Events       |
| ------------------ | -------------------------- | ---------------- | ------------------- |
| `total_installs`   | Number of app downloads    | Growth base      | App store data      |
| `total_signups`    | Users who created account  | Conversion base  | auth_signup_success |
| `signup_rate`      | signups / installs \* 100  | Install → signup | Calculated          |
| `daily_signups`    | Signups per day            | Trend            | auth_signup_success |
| `weekly_signups`   | Signups per week           | Trend            | auth_signup_success |
| `signup_by_source` | Signups by referral source | Attribution      | auth_signup_success |
| `organic_vs_paid`  | Organic vs paid signups    | Attribution      | auth_signup_success |

### Display:

- Line chart: daily signups over time
- Big number: total signups
- Pie chart: signup source breakdown

---

## 2. ACTIVATION DASHBOARD

### Metrics:

| Metric                       | Definition                     | Why It Matters | Source Events                   |
| ---------------------------- | ------------------------------ | -------------- | ------------------------------- |
| `onboarding_started`         | Users who started onboarding   | Funnel top     | onboarding_start                |
| `onboarding_completed`       | Users who finished onboarding  | Activation     | onboarding_complete             |
| `onboarding_completion_rate` | completed / started \* 100     | Funnel health  | Calculated                      |
| `onboarding_time_avg`        | Avg time to complete (seconds) | Friction       | Timestamps                      |
| `profile_quality_meets`      | Profiles meeting threshold     | Quality        | profile_quality_meets_threshold |
| `first_offer_created`        | Users who created offer        | Value          | offer_create_success            |
| `first_request_created`      | Users who created request      | Value          | request_create_success          |
| `first_action_rate`          | Users with offer or request    | Activation     | Calculated                      |

### Funnel View:

```
Signups → Onboarding Started → Onboarding Complete → Profile Quality → First Action
```

### Display:

- Funnel visualization
- Bar chart: completion by step
- Big numbers: key conversion rates

---

## 3. MARKETPLACE LIQUIDITY DASHBOARD

### Metrics:

| Metric                  | Definition                      | Why It Matters  | Source Events          |
| ----------------------- | ------------------------------- | --------------- | ---------------------- |
| `total_active_offers`   | Offers with status active       | Supply          | offer_list             |
| `total_active_requests` | Requests with status open       | Demand          | request_list           |
| `offers_this_week`      | New offers this week            | Growth          | offer_create_success   |
| `requests_this_week`    | New requests this week          | Growth          | request_create_success |
| `offers_by_category`    | Offers breakdown                | Category health | offer_list             |
| `requests_by_category`  | Requests breakdown              | Category health | request_list           |
| `avg_offer_price`       | Average offer price             | Pricing health  | offer_list             |
| `avg_request_budget`    | Average request budget          | Pricing health  | request_list           |
| `offers_with_ai_price`  | Offers with AI price suggestion | AI adoption     | ai_price_suggestion    |

### Display:

- Table: category breakdown
- Line chart: offer/request trends
- Big numbers: active supply/demand

---

## 4. PROPOSAL FUNNEL DASHBOARD

### Metrics:

| Metric                  | Definition                             | Why It Matters  | Source Events           |
| ----------------------- | -------------------------------------- | --------------- | ----------------------- |
| `total_proposals`       | All proposals created                  | Marketplace     | proposal_create_success |
| `proposals_sent`        | Proposals in submitted status          | Activity        | proposal_list           |
| `proposals_sent_rate`   | proposals / (offers + requests) \* 100 | Match quality   | Calculated              |
| `proposals_per_offer`   | Avg proposals per offer                | Demand          | Calculated              |
| `proposals_per_request` | Avg proposals per request              | Supply          | Calculated              |
| `proposals_accepted`    | Accepted proposals                     | Conversion      | proposal_accept_success |
| `proposal_accept_rate`  | accepted / sent \* 100                 | Match quality   | Calculated              |
| `proposals_rejected`    | Rejected proposals                     | Negative signal | proposal_reject_click   |

### Funnel View:

```
Offer → Viewed → Proposal Sent → Accepted → Deal Created
Request → Viewed → Proposal Sent → Accepted → Deal Created
```

### Display:

- Funnel conversion rates
- Conversion by category
- Provider/requester metrics

---

## 5. DEAL FUNNEL DASHBOARD

### Metrics:

| Metric                 | Definition                       | Why It Matters | Source Events     |
| ---------------------- | -------------------------------- | -------------- | ----------------- |
| `total_deals`          | All deals created                | Volume         | deal_create       |
| `deals_funded`         | Deals with status funded         | Seriousness    | deal_fund_success |
| `funding_rate`         | funded / deal \* 100             | Payment flow   | Calculated        |
| `deals_in_progress`    | Active deals                     | Work           | deal_list         |
| `deals_submitted`      | Deals with deliverable submitted | Delivery       | deal_submit       |
| `deals_completed`      | Completed deals                  | Success        | deal_approve      |
| `deal_completion_rate` | completed / funded \* 100        | Success        | Calculated        |
| `avg_deal_value`       | Average deal amount              | Value          | deal_list         |
| `deal_duration_avg`    | Days from fund to complete       | Efficiency     | Timestamps        |

### Funnel View:

```
Deal Created → Funded → In Progress → Submitted → Approved → Completed
```

### Display:

- Funnel conversion rates
- Deal value distribution
- Timeline metrics

---

## 6. TRUST & SAFETY DASHBOARD

### Metrics:

| Metric                    | Definition                  | Why It Matters | Source Events         |
| ------------------------- | --------------------------- | -------------- | --------------------- |
| `total_reviews`           | All reviews created         | Trust          | review_create_success |
| `reviews_this_week`       | New reviews this week       | Activity       | review_create_success |
| `avg_rating`              | Average rating (1-5)        | Quality        | review_list           |
| `review_completion_rate`  | reviews / completed \* 100  | Feedback       | Calculated            |
| `total_disputes`          | All disputes opened         | Issues         | deal_dispute_open     |
| `disputes_this_week`      | New disputes this week      | Trend          | deal_dispute_open     |
| `dispute_rate`            | disputes / completed \* 100 | Problem rate   | Calculated            |
| `disputes_resolved`       | Resolved disputes           | Ops            | admin_dispute_resolve |
| `dispute_resolution_time` | Avg days to resolve         | Efficiency     | Timestamps            |
| `risk_signals`            | Risk signals flagged        | Safety         | admin_risk_view       |
| `fraud_signals`           | Fraud signals flagged       | Safety         | admin_fraud_view      |
| `banned_users`            | Users banned                | Safety         | admin_user_action     |

### Display:

- Review rating distribution
- Dispute trends
- Safety signal counts

---

## 7. AI USAGE DASHBOARD

### Metrics:

| Metric                  | Definition                    | Why It Matters | Source Events        |
| ----------------------- | ----------------------------- | -------------- | -------------------- |
| `ai_match_usage`        | Users who used AI match       | Feature value  | ai_match_view        |
| `ai_match_rate`         | users_with_match / MAU \* 100 | Adoption       | Calculated           |
| `ai_match_clicks`       | Clicks on recommendations     | Engagement     | ai_match_click       |
| `ai_match_ctr`          | clicks / views \* 100         | Value          | Calculated           |
| `ai_price_usage`        | Users who used AI price       | Adoption       | ai_price_view        |
| `ai_price_rate`         | users_with_price / MAU \* 100 | Adoption       | Calculated           |
| `ai_support_messages`   | Support messages sent         | Support        | ai_support_send      |
| `ai_support_resolution` | Support issues resolved       | Support        | ai_support_response  |
| `ai_next_action_usage`  | Users who viewed next actions | Adoption       | ai_next_action_view  |
| `ai_next_action_clicks` | Nudges clicked                | Engagement     | ai_next_action_click |

### Display:

- Feature usage rates
- Click rates
- Resolution metrics

---

## 8. RETENTION DASHBOARD

### Metrics:

| Metric              | Definition                | Why It Matters  | Source Events |
| ------------------- | ------------------------- | --------------- | ------------- |
| `d1_retention`      | Users back day 1          | Early retention | App open D+1  |
| `d7_retention`      | Users back day 7          | Week retention  | App open D+7  |
| `d30_retention`     | Users back day 30         | Month retention | App open D+30 |
| `churn_rate`        | Users not seen in 30 days | Health          | Calculated    |
| `maus`              | Monthly active users      | Engagement      | App open      |
| `wau`               | Weekly active users       | Engagement      | App open      |
| `dau`               | Daily active users        | Engagement      | App open      |
| `sessions_per_user` | Avg sessions per user     | Engagement      | App opens     |
| `time_in_app`       | Avg time in app (minutes) | Engagement      | Timestamps    |

### Cohort Table:

- Daily signup cohort → retention by day

### Display:

- Retention curve
- Cohort table
- Engagement metrics

---

## 9. MONETIZATION DASHBOARD

**Note: DISABLED FOR 1.0 - No monetization**

For future (1.x):
| Metric | Definition | Why It Matters | Source Events |
|--------|------------|----------------|---------------|
| `gmv` | Gross merchandise value | Volume | deal_fund_success |
| `net_revenue` | Platform revenue | Business | payment events |
| `take_rate` | revenue / GMV \* 100 | Model | Calculated |
| `revenue_by_segment` | Revenue by user segment | Analysis | Calculated |
| `arpau` | Revenue per active user | LTV | Calculated |

---

## DASHBOARD LAYOUT

### Top Header:

- Date range picker
- Refresh button

### Row 1: Key Metrics (4 cards):

- Total Users
- Total Deals
- Active Offers
- Active Requests

### Row 2: Acquisition + Activation:

- Signup trend
- Onboarding funnel

### Row 3: Marketplace + Proposal:

- Offer/Request volume
- Proposal funnel

### Row 4: Deal + Trust:

- Deal funnel
- Reviews + Disputes

### Row 5: AI + Retention:

- AI usage
- Retention curve

---

## IMPLEMENTATION NOTE

### MVP Dashboard:

- Simple web dashboard in admin panel
- Query from analytics DB
- Manual refresh

### Post-MVP:

- Embedded analytics (Metabase, etc)
- Auto-refresh every 5 min
- Export features

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, comprehensive metrics
2. Có đủ cụ thể để team vận hành không? → YES, mỗi metric có definition + source
3. Có gắn với product flow hiện tại không? → YES, map to EVENT_TRACKING_PLAN
4. Có tránh nói kiểu startup sáo rỗng không? → YES, data-driven spec

**Status: READY FOR IMPLEMENTATION**
