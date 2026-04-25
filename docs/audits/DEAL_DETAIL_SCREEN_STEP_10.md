# Deal Detail Screen - Step 10

## Mục tiêu

Hoàn thiện lát dọc thứ ba theo quy trình:

```text
1 màn hình mobile -> backend/API tương ứng -> service mobile -> test/smoke -> audit
```

Màn được chọn:

```text
mobile/app/deals/[id].tsx
```

Flow bắt đầu từ:

```text
mobile/app/deals/create.tsx -> /deals/:dealId
mobile/app/(tabs)/deals.tsx -> /deals/:dealId
```

---

## Kết quả hiện tại

Màn **Deal Detail** đã hoàn tất phần mobile static typecheck, backend baseline và runtime smoke.

Các workflow đã pass:

```text
Manual Runtime Verification: https://github.com/earthkingdomuniverse-cell/workai/actions/runs/24922303747
Manual Backend Runtime Smoke: https://github.com/earthkingdomuniverse-cell/workai/actions/runs/24922585760
```

Kết quả xác minh:

- Backend typecheck/build/test: `success`
- Prisma migration/diff: `success`
- Mobile TypeScript: `success`
- Backend runtime start: `success`
- `GET /health`: `success`
- `GET /api/v1/offers/:id` provider contract smoke: `success`
- `POST /api/v1/deals` with `{ offerId }`: `success`
- `GET /api/v1/deals/:id`: `success`
- Protected routes thiếu token -> `401 AUTHENTICATION_ERROR`: `success`

---

## Mobile contract

Màn Deal Detail gọi:

```ts
dealService.getDeal(id)
dealService.submitWork(deal.id, { milestoneId, notes })
dealService.releaseFunds(deal.id, { amount, notes })
reviewService.createReview(...)
```

Các action đang hiển thị theo trạng thái:

```text
created + client -> Fund Deal
funded + provider -> Submit Work
submitted + client -> Release Funds
funded/submitted/released + participant -> Open Dispute
released -> Leave a Review
```

---

## Backend contract

API chính đã smoke:

```text
GET /api/v1/deals/:id
Authorization: Bearer <client-token>
```

Expected response chính:

```text
data.id
data.offerId
data.providerId
data.clientId
data.status
data.title
data.description
data.amount
data.currency
data.fundedAmount
data.releasedAmount
data.serviceFee
data.milestones
data.transactions
data.offer.id
data.provider.id
data.client.id
```

---

## Mobile thay đổi trong vòng này

File:

```text
mobile/app/deals/[id].tsx
```

Commit:

```text
dbe154805624521f959a72c61ad04140887f7ce1
```

Thay đổi chính:

1. Thêm fallback an toàn cho timeline:

```ts
const timeline = deal.timeline || [];
```

2. Hiển thị thêm thông tin người tham gia:

```text
Client
Provider
```

3. Hiển thị source offer nếu backend trả `deal.offer`.
4. Hiển thị Deal Information đầy đủ hơn:

```text
Amount
Funded
Released
Service fee
```

5. Thêm fallback action text khi deal đang `created` nhưng user không phải client:

```text
Waiting for the client to fund this deal.
```

---

## Runtime smoke đã thêm

File:

```text
.github/workflows/manual-runtime-smoke.yml
```

Commit:

```text
cde752b3380ae9a31684f19ea3b6aa51b62287d6
```

Workflow hiện tạo deal từ offer, lưu `deal.id`, rồi kiểm tra:

```text
GET /api/v1/deals/:dealId
Authorization: Bearer <client-token>
```

Assert các field:

```text
data.id
data.offerId
data.providerId
data.clientId
data.status = created
data.title
data.amount
data.currency
data.milestones = array
data.transactions = array
data.offer.id
data.provider.id
data.client.id
```

---

## Điều kiện pass cho màn Deal Detail

- Mobile load được deal detail bằng `dealService.getDeal(id)`. Đã implement trước đó.
- Mobile không crash nếu `timeline` chưa có trong backend response. Đã sửa.
- Mobile hiển thị offer/provider/client summary nếu backend trả. Đã sửa.
- Mobile TypeScript pass. Đã pass ở run `24922303747`.
- Backend typecheck/build/test pass. Đã pass ở run `24922303747`.
- Runtime smoke `GET /api/v1/deals/:id` pass. Đã pass ở run `24922585760`.

---

## Kết luận

Màn **Deal Detail** đủ điều kiện chuyển sang màn tiếp theo.

Màn tiếp theo:

```text
Fund Deal / Payment
```
