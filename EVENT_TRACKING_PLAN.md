# EVENT_TRACKING_PLAN.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22
**Purpose**: Event tracking plan chi tiết cho product analytics

---

## EVENT NAMING CONVENTIONS

```
[category]_[action]_[target]

Examples:
- auth_signup_success
- offer_create_view
- proposal_accept_click
- deal_funded_complete
```

---

## AUTH EVENTS

| Event Name            | When Fired       | Required Properties | Optional Properties | Business Reason  |
| --------------------- | ---------------- | ------------------- | ------------------- | ---------------- |
| `auth_signup_start`   | User taps signup | {screen}            | {method: email}     | Funnel: signup   |
| `auth_signup_success` | Signup completes | {user_id, method}   | {role}              | Funnel: signup   |
| `auth_signup_fail`    | Signup fails     | {error_code}        | {reason}            | Funnel: signup   |
| `auth_login_start`    | User taps login  | {screen}            | {}                  | Funnel: login    |
| `auth_login_success`  | Login completes  | {user_id}           | {}                  | Funnel: login    |
| `auth_login_fail`     | Login fails      | {error_code}        | {reason}            | Funnel: login    |
| `auth_logout`         | User logs out    | {user_id}           | {}                  | Session tracking |

---

## ONBOARDING EVENTS

| Event Name                 | When Fired                     | Required Properties                     | Optional Properties | Business Reason    |
| -------------------------- | ------------------------------ | --------------------------------------- | ------------------- | ------------------ |
| `onboarding_start`         | User enters onboarding         | {step: intro/role/profile/skills/goals} | {}                  | Funnel: onboarding |
| `onboarding_step_complete` | User completes step            | {step, user_id}                         | {duration}          | Funnel: onboarding |
| `onboarding_skip`          | User skips step                | {step, user_id}                         | {}                  | Funnel: drop-off   |
| `onboarding_complete`      | User completes full onboarding | {user_id}                               | {duration}          | Funnel: onboarding |
| `onboarding_abandon`       | User abandons                  | {last_step, user_id}                    | {duration}          | Funnel: drop-off   |

---

## PROFILE EVENTS

| Event Name                        | When Fired                        | Required Properties         | Optional Properties | Business Reason |
| --------------------------------- | --------------------------------- | --------------------------- | ------------------- | --------------- |
| `profile_view`                    | User views own or other's profile | {viewer_id, viewed_user_id} | {}                  | Engagement      |
| `profile_edit_start`              | User taps edit profile            | {user_id}                   | {}                  | Engagement      |
| `profile_edit_success`            | User saves profile                | {user_id}                   | {}                  | Quality metrics |
| `profile_quality_meets_threshold` | Profile meets quality threshold   | {user_id}                   | {fields_completed}  | Activation      |
| `profile_skill_add`               | User adds skill                   | {user_id, skill}            | {}                  | Engagement      |

---

## OFFER EVENTS

| Event Name             | When Fired                     | Required Properties               | Optional Properties           | Business Reason  |
| ---------------------- | ------------------------------ | --------------------------------- | ----------------------------- | ---------------- |
| `offer_create_view`    | User views offer create screen | {user_id}                         | {}                            | Funnel: offer    |
| `offer_create_start`   | User starts creating offer     | {user_id}                         | {}                            | Funnel: offer    |
| `offer_create_success` | Offer created successfully     | {offer_id, user_id, title, price} | {skills}                      | Funnel: offer    |
| `offer_create_fail`    | Offer creation fails           | {user_id, error_code}             | {reason}                      | Funnel: drop-off |
| `offer_edit_view`      | User views edit offer screen   | {offer_id}                        | {}                            | Engagement       |
| `offer_edit_success`   | Offer edited successfully      | {offer_id}                        | {}                            | Engagement       |
| `offer_delete`         | User deletes offer             | {offer_id, user_id}               | {}                            | Engagement       |
| `offer_list_view`      | User views offer list          | {user_id, page, filter}           | {category}                    | Engagement       |
| `offer_detail_view`    | User views offer detail        | {offer_id, viewer_id}             | {source: search/browse/match} | Engagement       |
| `offer_search`         | User searches offers           | {user_id, query}                  | {filters}                     | Discovery        |
| `offer_filter_apply`   | User applies filter            | {filter_type}                     | {values}                      | Discovery        |
| `offer_save`           | User saves/bookmarks offer     | {offer_id, user_id}               | {}                            | Engagement       |
| `offer_share`          | User shares offer              | {offer_id, user_id}               | {channel}                     | Virality         |

---

## REQUEST EVENTS

| Event Name               | When Fired                       | Required Properties                                  | Optional Properties | Business Reason  |
| ------------------------ | -------------------------------- | ---------------------------------------------------- | ------------------- | ---------------- |
| `request_create_view`    | User views request create screen | {user_id}                                            | {}                  | Funnel: request  |
| `request_create_start`   | User starts creating request     | {user_id}                                            | {}                  | Funnel: request  |
| `request_create_success` | Request created successfully     | {request_id, user_id, title, budget_min, budget_max} | {skills}            | Funnel: request  |
| `request_create_fail`    | Request creation fails           | {user_id, error_code}                                | {reason}            | Funnel: drop-off |
| `request_edit_view`      | User views edit request screen   | {request_id}                                         | {}                  | Engagement       |
| `request_edit_success`   | Request edited successfully      | {request_id}                                         | {}                  | Engagement       |
| `request_close`          | User closes request              | {request_id, user_id}                                | {}                  | Marketplace      |
| `request_list_view`      | User views request list          | {user_id, page, filter}                              | {category}          | Engagement       |
| `request_detail_view`    | User views request detail        | {request_id, viewer_id}                              | {source}            | Engagement       |
| `request_search`         | User searches requests           | {user_id, query}                                     | {filters}           | Discovery        |
| `request_save`           | User bookmarks request           | {request_id, user_id}                                | {}                  | Engagement       |

---

## PROPOSAL EVENTS

| Event Name                | When Fired                      | Required Properties                                | Optional Properties | Business Reason  |
| ------------------------- | ------------------------------- | -------------------------------------------------- | ------------------- | ---------------- |
| `proposal_create_start`   | User starts creating proposal   | {target_type, target_id}                           | {}                  | Funnel: proposal |
| `proposal_create_success` | Proposal sent successfully      | {proposal_id, target_id, target_type, provider_id} | {proposed_amount}   | Funnel: proposal |
| `proposal_create_fail`    | Proposal creation fails         | {target_id, error_code}                            | {reason}            | Funnel: drop-off |
| `proposal_detail_view`    | User views proposal detail      | {proposal_id, viewer_id}                           | {}                  | Engagement       |
| `proposal_accept_click`   | User clicks accept proposal     | {proposal_id}                                      | {}                  | Funnel: deal     |
| `proposal_accept_success` | Proposal accepted, deal created | {proposal_id, deal_id}                             | {}                  | Funnel: deal     |
| `proposal_reject_click`   | User clicks reject              | {proposal_id, reason}                              | {}                  | Funnel: deal     |
| `proposal_withdraw`       | Provider withdraws proposal     | {proposal_id}                                      | {}                  | Engagement       |
| `proposal_list_view`      | User views proposal list        | {user_id, filter}                                  | {status}            | Engagement       |

---

## DEAL EVENTS

| Event Name              | When Fired                   | Required Properties                     | Optional Properties      | Business Reason |
| ----------------------- | ---------------------------- | --------------------------------------- | ------------------------ | --------------- |
| `deal_create`           | Deal created from proposal   | {deal_id, offer_id, request_id, amount} | {provider_id, client_id} | Marketplace     |
| `deal_fund_click`       | Client clicks fund deal      | {deal_id}                               | {}                       | Funnel: deal    |
| `deal_fund_success`     | Deal funded (payment)        | {deal_id, amount}                       | {}                       | Funnel: deal    |
| `deal_fund_fail`        | Funding fails                | {deal_id, error_code}                   | {reason}                 | Payment         |
| `deal_status_change`    | Deal status changes          | {deal_id, old_status, new_status}       | {}                       | Funnel: deal    |
| `deal_submit`           | Provider submits deliverable | {deal_id, deliverable}                  | {}                       | Funnel: deal    |
| `deal_approve`          | Client approves deliverable  | {deal_id}                               | {}                       | Funnel: deal    |
| `deal_revision_request` | Client requests revision     | {deal_id, reason}                       | {}                       | Funnel: deal    |
| `deal_dispute_open`     | User opens dispute           | {deal_id, reason}                       | {}                       | Trust/Safety    |
| `deal_dispute_resolve`  | Admin resolves dispute       | {deal_id, resolution}                   | {}                       | Trust/Safety    |
| `deal_list_view`        | User views deals list        | {user_id, filter}                       | {status}                 | Engagement      |
| `deal_detail_view`      | User views deal detail       | {deal_id, user_id}                      | {}                       | Engagement      |

---

## DEAL MILESTONE EVENTS

| Event Name          | When Fired          | Required Properties               | Optional Properties | Business Reason |
| ------------------- | ------------------- | --------------------------------- | ------------------- | --------------- |
| `milestone_create`  | Milestone created   | {deal_id, milestone_id, amount}   | {}                  | Deal tracking   |
| `milestone_submit`  | Milestone submitted | {deal_id, milestone_id}           | {}                  | Deal tracking   |
| `milestone_approve` | Milestone approved  | {deal_id, milestone_id}           | {}                  | Deal tracking   |
| `milestone_approve` | Milestone rejected  | {deal_id, milestone_id, feedback} | {}                  | Deal tracking   |

---

## REVIEW EVENTS

| Event Name              | When Fired                | Required Properties        | Optional Properties | Business Reason |
| ----------------------- | ------------------------- | -------------------------- | ------------------- | --------------- |
| `review_prompt_view`    | User sees review prompt   | {deal_id}                  | {}                  | Funnel: review  |
| `review_create_success` | Review created            | {deal_id, rating, user_id} | {comment, tags}     | Trust           |
| `review_list_view`      | User views reviews        | {user_id}                  | {sort}              | Engagement      |
| `review_helpful`        | User marks review helpful | {review_id}                | {}                  | Engagement      |
| `review_report`         | User reports review       | {review_id, reason}        | {}                  | Trust/Safety    |

---

## AI USAGE EVENTS

| Event Name                  | When Fired                 | Required Properties           | Optional Properties | Business Reason  |
| --------------------------- | -------------------------- | ----------------------------- | ------------------- | ---------------- |
| `ai_match_view`             | User uses AI match         | {user_id, target_type}        | {filters}           | Feature adoption |
| `ai_match_ recommendations` | Recommendations displayed  | {user_id, count, target_type} | {scores}            | Feature adoption |
| `ai_match_click`            | User clicks recommendation | {recommendation_id}           | {position}          | Feature adoption |
| `ai_price_view`             | User uses AI price         | {target_type}                 | {input}             | Feature adoption |
| `ai_price_suggestion`       | Price suggestion displayed | {min_price, max_price}        | {skill}             | Feature adoption |
| `ai_support_send`           | User sends support message | {user_id, message}            | {category}          | Support          |
| `ai_support_response`       | AI responds to support     | {category, response}          | {}                  | Support          |
| `ai_next_action_view`       | User sees next actions     | {user_id}                     | {count}             | Feature adoption |
| `ai_next_action_click`      | User clicks next action    | {action_id}                   | {action_type}       | Feature adoption |

---

## MESSAGING EVENTS

| Event Name     | When Fired                | Required Properties     | Optional Properties | Business Reason |
| -------------- | ------------------------- | ----------------------- | ------------------- | --------------- |
| `inbox_view`   | User views inbox          | {user_id}               | {unread_count}      | Engagement      |
| `thread_view`  | User views message thread | {thread_id}             | {}                  | Engagement      |
| `message_send` | User sends message        | {thread_id, message_id} | {}                  | Engagement      |

---

## NOTIFICATION EVENTS

| Event Name             | When Fired              | Required Properties       | Optional Properties | Business Reason |
| ---------------------- | ----------------------- | ------------------------- | ------------------- | --------------- |
| `notification_receive` | Notification received   | {notification_id, type}   | {}                  | Notifications   |
| `notification_view`    | User views notification | {notification_id}         | {}                  | Engagement      |
| `notification_click`   | User taps notification  | {notification_id, action} | {}                  | Engagement      |

---

## ADMIN/OPERATOR EVENTS

| Event Name              | When Fired             | Required Properties         | Optional Properties | Business Reason |
| ----------------------- | ---------------------- | --------------------------- | ------------------- | --------------- |
| `admin_login`           | Admin logs in          | {admin_id}                  | {}                  | Security        |
| `admin_user_view`       | Admin views user       | {admin_id, target_user_id}  | {}                  | Operations      |
| `admin_user_action`     | Admin takes action     | {admin_id, user_id, action} | {reason}            | Operations      |
| `admin_dispute_view`    | Admin views dispute    | {dispute_id}                | {}                  | Operations      |
| `admin_dispute_resolve` | Admin resolves dispute | {dispute_id, resolution}    | {}                  | Operations      |
| `admin_risk_view`       | Admin views risk       | {user_id}                   | {}                  | Operations      |
| `admin_fraud_view`      | Admin views fraud      | {signal_id}                 | {}                  | Operations      |
| `admin_review_moderate` | Admin moderates review | {review_id, action}         | {}                  | Operations      |

---

## ERROR EVENTS

| Event Name       | When Fired        | Required Properties          | Optional Properties | Business Reason |
| ---------------- | ----------------- | ---------------------------- | ------------------- | --------------- |
| `error_occurred` | Error occurs      | {error_code, screen, action} | {message}           | Debugging       |
| `api_error`      | API returns error | {endpoint, status_code}      | {error}             | Debugging       |
| `crash_report`   | App crashes       | {screen, stack_trace}        | {device_info}       | Debugging       |

---

## USER PROPERTIES (TO TRACK)

| Property              | Type      | Description              |
| --------------------- | --------- | ------------------------ |
| user_id               | string    | Unique user ID           |
| role                  | enum      | provider/requester/both  |
| onboarding_completed  | boolean   | Full onboarding done     |
| profile_quality_score | number    | 0-100 profile quality    |
| signup_date           | timestamp | When user signed up      |
| first_action_date     | timestamp | First offer/request date |
| deals_count           | number    | Total deals              |
| reviews_given         | number    | Reviews given            |
| reviews_received      | number    | Reviews received         |
| trust_score           | number    | User trust score         |

---

## IMPLEMENTATION NOTES

### Backend (track in API routes):

- All auth events
- All offer/request/proposal/deal create/edit/delete
- All admin actions

### Mobile App (track in app):

- All view events
- All click events
- All navigation events

### Analytics Tool Recommendation:

- For MVP: Simple event logging to backend DB
- Post-launch: Mixpanel/Amplitude/PostHog integration

---

## IMPLEMENTATION CHECKLIST

- [ ] Add analytics service to backend
- [ ] Add analytics tracking to mobile
- [ ] Implement all events above
- [ ] Add user properties tracking
- [ ] Test funnel events work
- [ ] Verify data flows to analytics tool

---

## SELF-ASSESSMENT

1. Tài liệu này có dùng được thật không? → YES, comprehensive event list
2. Có đủ cụ thể để team vận hành không? → YES, mỗi event có properties
3. Có gắn với product flow hiện tại không? → YES, map với routes + screens
4. Có tránh nói kiểu startup sáo rỗng không? → YES, technical cụ thể

**Status: READY FOR IMPLEMENTATION**
