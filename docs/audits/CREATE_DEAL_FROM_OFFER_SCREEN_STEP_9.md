# Create Deal from Offer Screen - Step 9

## Mục tiêu

Hoàn thiện lát dọc thứ hai theo quy trình:

```text
1 màn hình mobile -> backend/API tương ứng -> service mobile -> test/smoke -> audit
```

Màn được chọn:

```text
mobile/app/deals/create.tsx
```

Flow bắt đầu từ:

```text
mobile/app/offers/[id].tsx -> /deals/create?offerId=:id
```

---

## Kết quả hiện tại

Màn **Create Deal from Offer** đã hoàn tất phần backend contract, mobile static typecheck và runtime smoke.

Các workflow đã pass:

```text
Manual Runtime Verification: https://github.com/earthkingdomuniverse-cell/workai/actions/runs/24921091285
Manual Backend Runtime Smoke: https://github.com/earthkingdomuniverse-cell/workai/actions/runs/24921746832
```

Kết quả xác minh:

- Backend typecheck/build/test: `success`
- Prisma migration/diff: `success`
- Mobile TypeScript: `success`
- Backend runtime start: `success`
- `GET /health`: `success`
- `GET /api/v1/offers/:id` provider contract smoke: `success`
- `POST /api/v1/deals` with `{ offerId }`: `success`
- Protected routes thiếu token -> `401 AUTHENTICATION_ERROR`: `success`

---

## Mobile contract

Màn create deal hiện đọc params:

```text
offerId?: string
requestId?: string
```

Trong flow offer, màn gọi:

```ts
offerService.getOffer(offerId)
dealService.createDeal({ offerId })
```

Sau khi tạo deal thành công, màn điều hướng sang:

```text
/deals/:dealId
```

---

## Backend contract

API chính:

```text
POST /api/v1/deals
Authorization: Bearer <client-token>
Body: { "offerId": "<offer-id>" }
```

Backend tự derive từ offer:

```text
providerId = offer.providerId
clientId = authenticated user
title = offer.title
description = offer.description
amount = offer.price
currency = offer.currency
status = created
```

Validation đã có:

```text
offer không tồn tại -> 404 NOT_FOUND
offer không active -> 400 BAD_REQUEST
provider tự tạo deal từ offer của mình -> 400 BAD_REQUEST
providerId và clientId giống nhau -> 400 VALIDATION_ERROR
thiếu provider/client hoặc offer/request -> 400 VALIDATION_ERROR
```

---

## Backend thay đổi trong vòng này

File:

```text
src/routes/deals.ts
```

Commit:

```text
aaeb5eae0f94a6143e725ffecd913ee9add306db
```

Thay đổi chính:

1. `POST /deals` hỗ trợ body tối giản `{ offerId }`.
2. Tự derive provider/client/title/description/amount/currency từ offer.
3. Chặn provider tự tạo client deal từ offer của chính mình.
4. `serializeDeal()` trả thêm summary ổn định cho:
   - `offer`
   - `provider`
   - `client`
5. `includeDealRelations` include offer/provider/client summary cho list/detail/create/update actions.

---

## Mobile thay đổi trong vòng này

### Create screen

File:

```text
mobile/app/deals/create.tsx
```

Commit:

```text
69bb947fe9301ebe3b01acecbde3d5abe9884ddc
```

Thay đổi chính:

1. Thay placeholder bằng màn tạo deal thật.
2. Load offer bằng `offerService.getOffer(offerId)`.
3. Hiển thị title/description/price/provider.
4. Gọi `dealService.createDeal({ offerId })`.
5. Điều hướng sang `/deals/:dealId` sau khi tạo thành công.
6. Có loading/error/submitting state.

### Deal service type

File:

```text
mobile/src/services/dealService.ts
```

Commit:

```text
82f291a3369668dbf79ea10913c9ae3d6a6a591f
```

Thay đổi chính:

1. `CreateDealInput` không còn bắt buộc `title`, `description`, `amount`.
2. Cho phép contract tối giản `{ offerId }`.
3. Nới một số field optional để khớp response backend hiện tại:
   - `timeline?`
   - `provider.completedDeals?`
   - `provider.averageRating?`
   - `client.completedDeals?`
   - `client.averageRating?`
   - `SubmitWorkInput.milestoneId?`

---

## Runtime smoke đã thêm

File:

```text
.github/workflows/manual-runtime-smoke.yml
```

Commit:

```text
646a4a40a5a2e84e6e2830ef600579ef84b46918
```

Workflow seed dữ liệu:

```text
SMOKE_PROVIDER_ID=11111111-1111-4111-8111-111111111111
SMOKE_CLIENT_ID=33333333-3333-4333-8333-333333333333
SMOKE_OFFER_ID=22222222-2222-4222-8222-222222222222
provider email=provider-smoke@example.com
client email=client-smoke@example.com
offer title=Smoke Test Offer Detail
offer price=123
offer currency=USD
```

Sau đó tạo JWT client thật bằng `jose` và kiểm tra:

```text
POST /api/v1/deals
Authorization: Bearer <client-token>
Body: { "offerId": "SMOKE_OFFER_ID" }
```

Assert các field:

```text
data.offerId
data.providerId
data.clientId
data.status = created
data.title
data.amount
data.currency
data.offer.id
data.provider.id
data.client.id
```

---

## Response contract kỳ vọng cho `POST /api/v1/deals` với `{ offerId }`

```json
{
  "data": {
    "id": "deal_id",
    "offerId": "offer_id",
    "providerId": "provider_user_id",
    "clientId": "client_user_id",
    "status": "created",
    "title": "Offer title",
    "description": "Offer description",
    "amount": 123,
    "currency": "USD",
    "fundedAmount": 0,
    "releasedAmount": 0,
    "serviceFee": 6,
    "offer": {
      "id": "offer_id",
      "title": "Offer title",
      "description": "Offer description"
    },
    "provider": {
      "id": "provider_user_id",
      "displayName": "provider@example.com",
      "email": "provider@example.com",
      "trustScore": 87
    },
    "client": {
      "id": "client_user_id",
      "displayName": "client@example.com",
      "email": "client@example.com",
      "trustScore": 91
    },
    "createdAt": "iso-date",
    "updatedAt": "iso-date"
  },
  "meta": {
    "timestamp": "iso-date"
  }
}
```

---

## Điều kiện pass cho màn Create Deal from Offer

- Mobile load được offer trước khi tạo deal. Đã implement.
- Mobile gọi được `dealService.createDeal({ offerId })`. Đã implement.
- Backend tự derive deal từ offer. Đã implement.
- Mobile TypeScript pass. Đã pass ở run `24921091285`.
- Backend typecheck/build/test pass. Đã pass ở run `24921091285`.
- Runtime smoke tạo deal từ offer pass. Đã pass ở run `24921746832`.

---

## Kết luận

Màn **Create Deal from Offer** đủ điều kiện chuyển sang màn tiếp theo.

Màn tiếp theo:

```text
Deal Detail
```
