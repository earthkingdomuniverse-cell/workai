# WorkAI Analytics Dashboard Spec

## Purpose

Founder/operator analytics dashboard specification for WorkAI.

## Dashboard sections

1. Acquisition
2. Activation
3. Marketplace liquidity
4. Proposal funnel
5. Deal funnel
6. Trust and safety
7. AI usage
8. Retention
9. Monetization, disabled for 1.0 unless explicitly enabled later

## Acquisition metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `total_signups` | Users who created accounts | `auth_signup_success` |
| `signup_rate` | Signups divided by installs | calculated |
| `daily_signups` | Signups per day | `auth_signup_success` |
| `signup_by_source` | Signups by referral/source | auth events |

## Activation metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `onboarding_started` | Users who started onboarding | `onboarding_start` |
| `onboarding_completed` | Users who completed onboarding | `onboarding_complete` |
| `onboarding_completion_rate` | completed / started | calculated |
| `profile_quality_meets` | Profiles meeting quality threshold | `profile_quality_meets_threshold` |
| `first_action_rate` | Users who created first offer or request | calculated |

## Marketplace liquidity metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `total_active_offers` | Active offers | offers data |
| `total_active_requests` | Open requests | requests data |
| `offers_this_week` | New offers this week | `offer_create_success` |
| `requests_this_week` | New requests this week | `request_create_success` |
| `offers_by_category` | Offer category breakdown | offers data |
| `requests_by_category` | Request category breakdown | requests data |

## Proposal funnel metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `total_proposals` | All proposals created | `proposal_create_success` |
| `proposal_accept_rate` | accepted / sent | calculated |
| `proposals_per_request` | average proposals per request | calculated |
| `proposals_per_offer` | average proposals per offer | calculated |

## Deal funnel metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `total_deals` | All deals created | `deal_create` |
| `deals_funded` | Deals funded | `deal_fund_success` |
| `funding_rate` | funded / created | calculated |
| `deals_completed` | Released/completed deals | deal status data |
| `deal_completion_rate` | completed / funded | calculated |
| `avg_deal_value` | Average deal amount | deal data |

## Trust and safety metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `total_reviews` | All reviews created | `review_create_success` |
| `avg_rating` | Average rating | reviews data |
| `review_completion_rate` | reviews / completed deals | calculated |
| `total_disputes` | Disputes opened | `deal_dispute_open` |
| `dispute_rate` | disputes / completed deals | calculated |
| `risk_signals` | Risk signals flagged | risk data |
| `fraud_signals` | Fraud signals flagged | fraud data |

## AI usage metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `ai_match_usage` | Users who used AI match | `ai_match_view` |
| `ai_match_ctr` | recommendation clicks / views | calculated |
| `ai_price_usage` | Users who used AI pricing | `ai_price_view` |
| `ai_support_messages` | Support messages sent | `ai_support_send` |
| `ai_next_action_clicks` | Next-action clicks | `ai_next_action_click` |

## Retention metrics

| Metric | Definition | Source |
| --- | --- | --- |
| `d1_retention` | Users active one day after signup | app open/session events |
| `d7_retention` | Users active seven days after signup | app open/session events |
| `d30_retention` | Users active thirty days after signup | app open/session events |
| `dau` | Daily active users | session events |
| `wau` | Weekly active users | session events |
| `mau` | Monthly active users | session events |

## Monetization metrics, future

| Metric | Definition | Source |
| --- | --- | --- |
| `gmv` | Gross marketplace value | deal/payment events |
| `net_revenue` | Platform revenue | payment events |
| `take_rate` | revenue / GMV | calculated |
| `arpau` | revenue per active user | calculated |

## Layout

- Top row: total users, active offers, active requests, total deals.
- Funnel row: acquisition and activation.
- Marketplace row: offers, requests, proposals.
- Deal row: funded, submitted, released, disputed.
- Trust/safety row: reviews, disputes, risk, fraud.
- AI row: match, price, support, next action.
- Retention row: D1/D7/D30 cohorts.

## Historical note

This document was moved from repository root into `docs/analytics/` during the WorkAI documentation organization batch. The original SkillValue AI dashboard spec remains available in git history.
