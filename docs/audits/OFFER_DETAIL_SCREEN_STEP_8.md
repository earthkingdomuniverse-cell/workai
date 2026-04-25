# Offer Detail Screen - Step 8

## Mục tiêu

Hoàn thiện lát dọc đầu tiên theo quy trình:

```text
1 màn hình mobile -> backend/API tương ứng -> service mobile -> test/smoke -> audit
```

Màn được chọn:

```text
mobile/app/offers/[id].tsx
```

---

## Kết quả hiện tại

Màn **Offer Detail** đã hoàn tất phần backend contract và runtime smoke.

Các workflow đã pass:

```text
Manual Runtime Verification: https://github.com/earthkingdomuniverse-cell/workai/actions/runs/24920351734
Manual Backend Runtime Smoke: https://github.com/earthkingdomuniverse-cell/workai/actions/runs/24920459840
```

Kết quả xác minh:

- Backend typecheck/build/test: `success`
- Prisma migration/diff: `success`
- Mobile TypeScript: `success`
- Backend runtime start: `success`
- `GET /health`: `success`
- `GET /api/v1/offers/:id` provider contract smoke: `success`
- Protected routes thiếu token -> `401 AUTHENTICATION_ERROR`: `success`

---

## Mobile contract hiện tại

Màn Offer Detail đang cần dữ liệu từ các service:

```text
offerService.getOffer(id)
trustService.getTrustProfile(providerId)
reviewService.getReviewsByOfferId(offerId)
reviewService.getReviewAggregate('offer', offerId)
```

API tương ứng:

```text
GET /api/v1/offers/:id
GET /api/v1/trust/:userId
GET /api/v1/reviews/by-offer/:id
GET /api/v1/reviews/aggregate/offer/:id
```

---

## Backend contract đã kiểm tra

### Offers

File:

```text
src/routes/offers.ts
```

Trước khi sửa:

- `GET /offers/:id` chỉ trả offer thô.
- Response không include provider object.
- `serializeOffer()` ép `skills: []` và `deliveryTime: undefined` vì Prisma schema hiện chưa có field này trong `Offer`.

Sau khi sửa:

- `GET /offers`
- `GET /offers/mine`
- `GET /offers/:id`
- `POST /offers`
- `PATCH /offers/:id`

đều có thể trả provider summary khi Prisma query include provider.

Provider summary chuẩn:

```ts
provider: {
  id: string;
  displayName: string;
  email: string;
  trustScore: number;
}
```

Ghi chú:

- `displayName` hiện fallback từ `email` vì Prisma `User` chưa có field `displayName`.
- `skills`, `deliveryTime`, `views`, `likes`, `proposalsCount` vẫn là compatibility fields cho mobile, chưa phải dữ liệu thật trong Prisma schema.

### Trust

File:

```text
src/routes/trust.ts
```

Route thật đang tồn tại:

```text
GET /trust/:userId
```

Do đó mobile `trustService.getTrustProfile(userId)` đang đúng, không đổi sang `/trust/profile/:userId`.

### Reviews

File:

```text
src/routes/reviews.ts
```

Routes thật đang tồn tại:

```text
GET /reviews/by-offer/:id
GET /reviews/aggregate/:subjectType/:subjectId
```

Mobile đang gọi đúng:

```text
GET /reviews/by-offer/:id
GET /reviews/aggregate/offer/:id
```

---

## Backend thay đổi trong vòng này

Commit:

```text
560ab14c1056bd2c06136ddcedd6a77d95c1ebca
```

Thay đổi chính:

1. `serializeOffer()` trả response shape ổn định hơn.
2. Include provider summary cho offer list/detail/create/update.
3. Không sửa Prisma schema trong vòng này để tránh migration không cần thiết.
4. Không sửa mobile screen trong vòng này vì screen đã map fallback provider/trust/reviews đủ an toàn.

---

## Runtime smoke đã thêm

File:

```text
.github/workflows/manual-runtime-smoke.yml
```

Commit:

```text
ef7ae9fc841e0a709e9c3b69801163d25542afe3
```

Workflow seed dữ liệu:

```text
SMOKE_PROVIDER_ID=11111111-1111-4111-8111-111111111111
SMOKE_OFFER_ID=22222222-2222-4222-8222-222222222222
provider email=provider-smoke@example.com
provider trustScore=87
offer title=Smoke Test Offer Detail
```

Sau đó kiểm tra:

```text
GET /api/v1/offers/:id -> 200
```

Assert các field:

```text
data.id
data.providerId
data.title
data.provider.id
data.provider.email
data.provider.displayName
data.provider.trustScore
```

---

## Response contract kỳ vọng cho `GET /api/v1/offers/:id`

```json
{
  "data": {
    "id": "offer_id",
    "providerId": "user_id",
    "title": "Offer title",
    "description": "Offer description",
    "category": "general",
    "price": 100,
    "currency": "USD",
    "pricingType": "fixed",
    "status": "active",
    "skills": [],
    "views": 0,
    "likes": 0,
    "proposalsCount": 0,
    "provider": {
      "id": "user_id",
      "displayName": "provider@example.com",
      "email": "provider@example.com",
      "trustScore": 100
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

## Điều kiện pass cho màn Offer Detail

- `GET /api/v1/offers/:id` trả provider summary. Đã pass.
- Nếu provider trust API lỗi hoặc không có dữ liệu, màn vẫn hiển thị fallback provider từ offer. Đã có fallback.
- Nếu reviews API lỗi, màn vẫn hiển thị offer detail và chỉ báo lỗi phần reviews. Đã có fallback.
- Mobile TypeScript vẫn pass. Đã pass ở run `24920351734`.
- Backend typecheck/build/test vẫn pass. Đã pass ở run `24920351734`.
- Runtime smoke seed offer và kiểm tra `GET /api/v1/offers/:id`. Đã pass ở run `24920459840`.

---

## Kết luận

Màn **Offer Detail** đủ điều kiện chuyển sang màn tiếp theo.

Màn tiếp theo:

```text
Create Deal from Offer
```
