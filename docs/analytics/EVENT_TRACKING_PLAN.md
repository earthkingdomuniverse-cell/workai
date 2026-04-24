# WorkAI Event Tracking Plan

## Purpose

Define product analytics events for WorkAI across activation, marketplace activity, AI usage, trust, messaging, notifications, and operator workflows.

## Naming convention

```text
[category]_[action]_[target]
```

Examples:

- `auth_signup_success`
- `offer_create_view`
- `proposal_accept_click`
- `deal_fund_success`

## Auth events

| Event | When fired | Required properties |
| --- | --- | --- |
| `auth_signup_start` | User taps signup | `screen` |
| `auth_signup_success` | Signup completes | `user_id`, `method` |
| `auth_signup_fail` | Signup fails | `error_code` |
| `auth_login_start` | User taps login | `screen` |
| `auth_login_success` | Login completes | `user_id` |
| `auth_login_fail` | Login fails | `error_code` |
| `auth_logout` | User logs out | `user_id` |

## Onboarding events

| Event | When fired | Required properties |
| --- | --- | --- |
| `onboarding_start` | User enters onboarding | `step` |
| `onboarding_step_complete` | Step completes | `step`, `user_id` |
| `onboarding_complete` | Full onboarding completes | `user_id` |
| `onboarding_abandon` | User exits onboarding | `last_step`, `user_id` |

## Profile events

| Event | When fired | Required properties |
| --- | --- | --- |
| `profile_view` | User views profile | `viewer_id`, `viewed_user_id` |
| `profile_edit_start` | User starts editing profile | `user_id` |
| `profile_edit_success` | User saves profile | `user_id` |
| `profile_quality_meets_threshold` | Profile reaches quality threshold | `user_id` |
| `profile_skill_add` | User adds skill | `user_id`, `skill` |

## Marketplace events

### Offers

| Event | When fired | Required properties |
| --- | --- | --- |
| `offer_create_view` | Create screen viewed | `user_id` |
| `offer_create_success` | Offer created | `offer_id`, `user_id`, `title`, `price` |
| `offer_detail_view` | Offer detail viewed | `offer_id`, `viewer_id` |
| `offer_search` | User searches offers | `user_id`, `query` |
| `offer_filter_apply` | User applies filter | `filter_type` |
| `offer_share` | User shares offer | `offer_id`, `user_id`, `channel` |

### Requests

| Event | When fired | Required properties |
| --- | --- | --- |
| `request_create_view` | Create screen viewed | `user_id` |
| `request_create_success` | Request created | `request_id`, `user_id`, `title`, `budget_min`, `budget_max` |
| `request_detail_view` | Request detail viewed | `request_id`, `viewer_id` |
| `request_search` | User searches requests | `user_id`, `query` |
| `request_save` | User bookmarks request | `request_id`, `user_id` |

### Proposals

| Event | When fired | Required properties |
| --- | --- | --- |
| `proposal_create_start` | Proposal create starts | `target_type`, `target_id` |
| `proposal_create_success` | Proposal sent | `proposal_id`, `target_id`, `target_type`, `provider_id` |
| `proposal_accept_click` | Accept clicked | `proposal_id` |
| `proposal_accept_success` | Accepted and deal created | `proposal_id`, `deal_id` |
| `proposal_reject_click` | Reject clicked | `proposal_id`, `reason` |

### Deals

| Event | When fired | Required properties |
| --- | --- | --- |
| `deal_create` | Deal created | `deal_id`, `amount` |
| `deal_fund_click` | Fund button clicked | `deal_id` |
| `deal_fund_success` | Deal funded | `deal_id`, `amount` |
| `deal_status_change` | Deal status changes | `deal_id`, `old_status`, `new_status` |
| `deal_submit` | Provider submits work | `deal_id` |
| `deal_dispute_open` | Dispute opened | `deal_id`, `reason` |
| `deal_dispute_resolve` | Dispute resolved | `deal_id`, `resolution` |

## Review and trust events

| Event | When fired | Required properties |
| --- | --- | --- |
| `review_prompt_view` | User sees review prompt | `deal_id` |
| `review_create_success` | Review submitted | `deal_id`, `rating`, `user_id` |
| `review_report` | Review reported | `review_id`, `reason` |
| `trust_score_view` | Trust card viewed | `user_id`, `viewed_user_id` |

## AI usage events

| Event | When fired | Required properties |
| --- | --- | --- |
| `ai_match_view` | User opens AI match | `user_id`, `target_type` |
| `ai_match_recommendations` | Recommendations displayed | `user_id`, `count`, `target_type` |
| `ai_match_click` | User clicks recommendation | `recommendation_id` |
| `ai_price_view` | User opens AI price | `target_type` |
| `ai_price_suggestion` | Price suggestion displayed | `min_price`, `max_price` |
| `ai_support_send` | User sends support message | `user_id` |
| `ai_support_response` | AI support responds | `category` |
| `ai_next_action_view` | User sees next actions | `user_id` |
| `ai_next_action_click` | User clicks next action | `action_id`, `action_type` |

## Messaging and notification events

| Event | When fired | Required properties |
| --- | --- | --- |
| `inbox_view` | User views inbox | `user_id` |
| `thread_view` | User views message thread | `thread_id` |
| `message_send` | User sends message | `thread_id`, `message_id` |
| `notification_receive` | Notification received | `notification_id`, `type` |
| `notification_view` | User views notification | `notification_id` |
| `notification_click` | User taps notification | `notification_id`, `action` |

## Admin/operator events

| Event | When fired | Required properties |
| --- | --- | --- |
| `admin_login` | Admin logs in | `admin_id` |
| `admin_user_view` | Admin views user | `admin_id`, `target_user_id` |
| `admin_user_action` | Admin acts on user | `admin_id`, `user_id`, `action` |
| `admin_dispute_view` | Admin views dispute | `dispute_id` |
| `admin_dispute_resolve` | Admin resolves dispute | `dispute_id`, `resolution` |
| `admin_risk_view` | Admin views risk | `user_id` |
| `admin_fraud_view` | Admin views fraud | `signal_id` |
| `admin_review_moderate` | Admin moderates review | `review_id`, `action` |

## Error events

| Event | When fired | Required properties |
| --- | --- | --- |
| `error_occurred` | App or service error | `error_code`, `screen`, `action` |
| `api_error` | API returns error | `endpoint`, `status_code` |
| `crash_report` | App crash | `screen`, `stack_trace` |

## User properties

- `user_id`
- `role`
- `onboarding_completed`
- `profile_quality_score`
- `signup_date`
- `first_action_date`
- `deals_count`
- `reviews_given`
- `reviews_received`
- `trust_score`

## Implementation notes

Backend should track write, transaction, auth, and admin events. Mobile should track view, click, navigation, and client-side error events.

## Historical note

This document was moved from repository root into `docs/analytics/` during the WorkAI documentation organization batch. The original SkillValue AI event plan remains available in git history.
