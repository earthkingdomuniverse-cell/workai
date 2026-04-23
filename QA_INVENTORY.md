# QA Inventory - SkillValue AI 1.0

## Scope

Tài liệu này là inventory QA tổng thể cho SkillValue AI 1.0.

Mỗi module bên dưới phải được kiểm thử theo 4 nhóm:

- Happy paths
- Edge cases
- Role cases
- Integration dependencies

## Test Matrix Legend

- Member: người dùng thường
- Operator: vai trò vận hành / moderation
- Admin: vai trò quản trị
- Mock mode: backend/mobile chạy bằng dữ liệu mock/in-memory
- Staging: môi trường deploy gần production

---

## 1. Auth

### Happy paths

- Signup member thành công với email hợp lệ
- Login thành công với tài khoản hợp lệ
- Logout thành công
- Lấy current user thành công sau login
- Refresh session/token thành công nếu flow có hỗ trợ

### Edge cases

- Signup với email trùng
- Login sai password
- Login với user không tồn tại
- Token thiếu / token sai format / token hết hạn
- Session restore khi token hỏng
- Logout khi không có session

### Role cases

- Signup member
- Login operator
- Login admin
- User role sau login trả đúng
- Session client phân biệt đúng member/operator/admin

### Integration dependencies

- Auth store mobile
- Auth backend routes
- JWT/token helper
- Role guard toàn app
- Secure persistence/session restore

---

## 2. Onboarding

### Happy paths

- Flow intro -> role select -> profile setup -> skills setup -> goals setup hoàn tất
- Lưu trạng thái onboarding từng bước
- Mark onboarding completed khi xong toàn flow

### Edge cases

- Back/forward giữa các step
- Reload app giữa chừng onboarding
- Bỏ trống field optional
- Field required bị thiếu
- Skills/goals quá ít hoặc quá nhiều

### Role cases

- Member onboarding
- Operator onboarding nếu có khác biệt
- Admin bypass hoặc restricted onboarding nếu có

### Integration dependencies

- Auth session
- Profile/value profile backend
- Navigation guard sau onboarding
- Local state persistence

---

## 3. Profile

### Happy paths

- Xem profile bản thân
- Cập nhật display name / bio / skills / goals
- Hiển thị average rating, trust score, verification
- Hiển thị proof items nếu có

### Edge cases

- Profile thiếu avatar/bio/skills
- Profile mới chưa có review/trust data
- Skills/goals rỗng
- Data trust/review không đồng bộ

### Role cases

- Member xem profile bản thân
- Member xem profile người khác
- Operator/Admin xem profile trong context moderation

### Integration dependencies

- Review aggregate
- Trust service
- Onboarding/profile service
- Recommendation/home dependency on profile data

---

## 4. Home

### Happy paths

- Home load thành công
- Hiển thị recommendation cards
- Hiển thị next best action nếu có
- Hiển thị summary widgets đúng

### Edge cases

- Home không có recommendation
- Home API partial failure
- One widget fail, phần còn lại vẫn usable
- Pull to refresh

### Role cases

- Member home
- Operator home nếu có summary khác
- Admin tab shortcut xuất hiện đúng role

### Integration dependencies

- Recommendation service
- AI next action service
- Notifications/activity summary
- Auth session

---

## 5. Explore

### Happy paths

- Load explore recommendations
- Xem recommended offers
- Xem recommended requests
- Mở detail từ recommendation

### Edge cases

- Explore không có item
- Filter/search trống
- Recommendation reason thiếu
- API timeout/failure

### Role cases

- Member explore
- Operator/Admin explore nếu shared UI

### Integration dependencies

- Recommendation service
- Offer/request detail screens
- Search/filter state

---

## 6. Offers

### Happy paths

- List offers
- Create offer
- View offer detail
- Manage own offers
- Open CTA từ offer detail

### Edge cases

- Price = 0 / invalid
- Missing title/description
- Empty skills
- Long description
- Offer owner không có data trust/reviews

### Role cases

- Member tạo offer
- Member xem offer của người khác
- Non-owner không được edit/manage offer của người khác
- Operator/Admin xem offer để moderation nếu có

### Integration dependencies

- Auth
- Profile/trust
- Reviews by offer
- Messaging entrypoint từ offer detail
- Deal creation flow

---

## 7. Requests

### Happy paths

- List requests
- Create request
- View request detail
- Manage own requests
- CTA gửi proposal từ request detail

### Edge cases

- Budget min/max invalid
- Không có skills
- Deadline quá khứ
- Urgency/location missing
- Request mới chưa có proposal

### Role cases

- Member tạo request
- Non-owner không edit request người khác
- Operator/Admin xem request trong moderation context

### Integration dependencies

- Proposal creation
- AI match CTA
- Trust display requester
- Messaging/deal entrypoint nếu có

---

## 8. Proposals

### Happy paths

- Tạo proposal từ request/offer
- List proposals
- View proposal detail
- My proposals list
- Accept proposal
- Reject proposal

### Edge cases

- Không có requestId và không có offerId
- Message quá ngắn
- Amount <= 0
- Delivery days <= 0
- Accept/reject khi status không còn pending
- Proposal không tồn tại

### Role cases

- Provider tạo proposal
- Client accept/reject proposal
- Provider không được accept proposal của chính mình
- User khác không được tác động proposal không thuộc quyền

### Integration dependencies

- Requests/offers
- Deal creation follow-up
- Notifications for proposal events
- Messaging entrypoint nếu có

---

## 9. Deals

### Happy paths

- Create deal
- View deals list
- View deal detail
- Fund deal
- Submit work
- Release funds
- Open dispute
- Timeline progression đúng

### Edge cases

- Invalid transition status
- Fund nhiều lần
- Submit work trước khi funded
- Release funds trước khi submitted
- Dispute ở status không hợp lệ
- Deal not found

### Role cases

- Client fund/release
- Provider submit work
- Cả 2 bên mở dispute khi hợp lệ
- User ngoài deal không được thao tác
- Operator/Admin xem deal trong moderation context

### Integration dependencies

- Proposal accepted flow
- Payments/transactions/receipts
- Reviews sau released
- Messaging thread theo deal
- Admin dispute flow

---

## 10. Payments / Receipts

### Happy paths

- List transaction history
- View transaction detail
- List receipts theo deal
- View receipt detail
- Payment screen tạo pseudo-payment flow đúng

### Edge cases

- Transaction không tồn tại
- Receipt không tồn tại
- Deal chưa có receipt
- Currency format sai
- Date format/null date

### Role cases

- Member chỉ xem transaction của mình
- Operator/Admin xem transaction theo moderation context nếu có

### Integration dependencies

- Deal state transitions
- Payment service
- Receipt generation
- Settings/account entrypoint

---

## 11. Reviews

### Happy paths

- Tạo review sau released deal
- List reviews
- Reviews by user
- Reviews by offer
- Aggregate rating hiển thị trên profile/offer

### Edge cases

- Review trước khi deal released
- Rating ngoài range
- Comment quá ngắn
- Duplicate review cùng deal nếu không cho phép
- Subject not found

### Role cases

- Client review provider
- Provider review client nếu logic cho phép
- User không liên quan deal không được review
- Operator/Admin moderation review queue

### Integration dependencies

- Deals status = released
- Offer detail review section
- Profile aggregate rating
- Admin review flow

---

## 12. Trust

### Happy paths

- GET trust/me
- GET trust/:userId
- Hiển thị trust score, verification level, completed deals, review count, dispute ratio, proofs

### Edge cases

- User chưa có trust profile
- Trust data thiếu proofs
- Verification level không đồng bộ với proofs
- Dispute ratio = 0 hoặc undefined

### Role cases

- Member xem trust của mình/người khác
- Operator/Admin xem trust trong moderation context

### Integration dependencies

- Reviews aggregate
- Deals completed count
- Verification proof data
- Profile / offer / request detail UI

---

## 13. AI Match

### Happy paths

- Submit title + skills + budget + urgency
- Nhận recommendations + score + reason
- CTA mở offer detail hoạt động
- Fallback heuristic hoạt động khi AI unavailable

### Edge cases

- Empty title
- Empty skills
- Budget thiếu min/max
- Không có recommendation
- AI service timeout/error

### Role cases

- Member dùng AI match
- Operator/Admin dùng AI match nếu shared capability

### Integration dependencies

- Offers data
- AI service abstraction
- Request detail CTA
- Logging/audit AI decisions

---

## 14. AI Price

### Happy paths

- Submit title + skills + providerLevel
- Nhận suggested/floor/ceiling price
- Reasoning hiển thị rõ
- Fallback heuristic hoạt động

### Edge cases

- Empty title
- Empty skills
- providerLevel invalid
- suggested price < floor hoặc > ceiling
- AI unavailable

### Role cases

- Member dùng AI price
- Provider level impact đúng kết quả

### Integration dependencies

- AI service abstraction
- Offer creation/edit pricing support
- Logging/audit AI pricing decision

---

## 15. AI Support

### Happy paths

- Submit message
- Nhận category + priority + answer
- Escalation-ready response nếu cần
- Heuristic fallback hoạt động

### Edge cases

- Message rỗng
- Message rất ngắn / rất dài
- Category classify sai với ambiguous text
- AI unavailable

### Role cases

- Member support flow
- Operator/Admin internal support path nếu có

### Integration dependencies

- AI support classifier
- Notification/escalation pipeline tương lai
- Support UI states

---

## 16. AI Next Action

### Happy paths

- Lấy next actions từ context user
- Hiển thị card CTA usable
- Home/Profile/Deal detail render action phù hợp

### Edge cases

- User mới không có history
- User có nhiều possible actions nhưng cần sort priority đúng
- Action route invalid
- Context thiếu profile/deal/proposal/trust

### Role cases

- Member action set
- Operator/Admin action set nếu có riêng

### Integration dependencies

- Profile completeness
- Deals/proposals state
- Trust profile
- Home/Profile/Deal detail UI injection

---

## 17. Inbox / Messages

### Happy paths

- List conversations
- View conversation detail
- Create conversation
- Send message
- Unread state hiển thị đúng
- Timestamp hiển thị đúng

### Edge cases

- Conversation không có message
- Message rỗng
- User không thuộc conversation
- Multiple participants edge cases
- No realtime fallback usable

### Role cases

- Member chat theo offer/request/deal
- Operator/Admin internal message flow nếu có

### Integration dependencies

- Offer/request/deal entrypoint
- Auth participant mapping
- Notifications unread summary
- Future realtime compatibility

---

## 18. Notifications / Activity

### Happy paths

- List notifications
- Mark notification as read
- List activity feed
- Home/profile shortcut hoạt động

### Edge cases

- Empty notification list
- Duplicate activity event
- Read action on already-read notification
- Unknown notification type

### Role cases

- Member personal notifications
- Operator/Admin moderation alerts

### Integration dependencies

- Proposal/deal/review/admin events
- Home summary
- Activity center UI

---

## 19. Admin Overview

### Happy paths

- Operator/Admin vào được
- Member bị chặn
- Overview counts hiển thị đúng
- Recent activity hiển thị đúng

### Edge cases

- Count mismatch do partial backend data
- Empty overview sections
- Auth token missing/invalid

### Role cases

- Operator access
- Admin access
- Member access denied

### Integration dependencies

- Authz middleware
- Deals/disputes/reviews/risk/fraud aggregate counts
- Admin tab role guard

---

## 20. Disputes

### Happy paths

- List disputes
- View dispute state
- Resolve dispute
- Operator/Admin scan dispute easily

### Edge cases

- Resolve dispute đã resolved
- Missing resolution note
- Invalid dispute id
- Empty evidence list

### Role cases

- Member không vào admin disputes
- Operator/Admin resolve được

### Integration dependencies

- Deals dispute events
- Operator review actions
- Notifications/activity

---

## 21. Risk

### Happy paths

- List risk profiles
- Hiển thị risk score, level, reasons, recommendation
- Open user risk profile nếu có route/detail

### Edge cases

- Risk profile thiếu flags
- Score không map đúng level
- No high-risk user case

### Role cases

- Operator/Admin access only
- Member access denied

### Integration dependencies

- Trust score
- Dispute ratio
- Fraud signals
- Admin risk screen/cards

---

## 22. Fraud

### Happy paths

- List fraud signals
- Hiển thị event type, signal score, signal level, ip, user agent khi có
- Scan fraud cards dễ dàng

### Edge cases

- Signal thiếu ip/user agent
- Confidence out of range
- Unknown fraud type
- Empty fraud feed

### Role cases

- Operator/Admin access only
- Member access denied

### Integration dependencies

- Auth/access logs
- Payment anomalies
- Risk engine correlation
- Admin fraud screen/cards

---

## 23. Operator Reviews

### Happy paths

- List pending operator reviews
- Submit review decision
- Action types:
  - approve_release
  - refund_client
  - hold_funds

### Edge cases

- Missing note
- Invalid action
- Review already processed
- Deal/review mismatch

### Role cases

- Operator/Admin access
- Member access denied

### Integration dependencies

- Deals
- Disputes
- Reviews moderation flow
- Activity/notification side effects

---

## 24. Health Check

### Happy paths

- `/health` trả 200
- Trả timestamp/environment/version

### Edge cases

- App start lỗi nhưng health vẫn được gọi
- Missing config causing boot failure

### Role cases

- Public endpoint

### Integration dependencies

- App bootstrap
- Env/config validation

---

## 25. Mock Mode

### Happy paths

- ENABLE_MOCK_MODE=true dùng mock fallback đúng
- App vẫn usable không cần external services

### Edge cases

- Mock mode off nhưng dependency external không sẵn
- Mock và real response shape lệch nhau
- In-memory reset sau restart

### Role cases

- Member/operator/admin đều có mock-safe paths tối thiểu

### Integration dependencies

- Env flag
- Services dùng mock fallback
- Mobile config `EXPO_PUBLIC_ENABLE_MOCK_MODE`

---

## 26. Staging Config

### Happy paths

- API base URL staging đúng
- CORS đúng
- Swagger enable/disable đúng theo env
- Admin tab/feature flags đúng theo env

### Edge cases

- Missing env vars
- Wrong API prefix/version
- Staging dùng nhầm mock mode
- JWT/OpenAI/Supabase env thiếu hoặc sai format

### Role cases

- Staging role guard đúng cho member/operator/admin

### Integration dependencies

- `.env`
- `.env.example`
- mobile public env config
- deployment/runtime config

---

## Cross-Module Integration Flows To Test

### Member core flow

- Signup/login
- Complete onboarding
- Complete profile
- Browse explore/home
- Create offer or request
- Create/send proposal
- Create/fund/submit/release deal
- Leave review
- See trust changes / notifications / activity

### Client-provider deal flow

- Client creates request
- Provider sends proposal
- Client accepts proposal
- Deal created
- Client funds
- Provider submits work
- Client releases funds
- Both sides can review

### Moderation flow

- Deal dispute opened
- Notification/activity created
- Operator sees dispute in admin
- Operator sees risk/fraud context
- Operator submits review action

### AI-assisted flow

- Request detail opens AI match
- Offer creation uses AI price
- Support request classified
- Home/profile shows next action

---

## Mandatory QA Notes

- Mọi module phải test cả khi có data và khi empty state
- Mọi protected route phải test: no token / wrong role / correct role
- Mọi AI endpoint phải test fallback path khi AI unavailable
- Mọi mobile list screen phải test loading / error / empty / refresh
- Mọi backend response phải kiểm tra response shape có ổn định cho mobile hay không
