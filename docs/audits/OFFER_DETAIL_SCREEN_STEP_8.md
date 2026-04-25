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

- `GET /api/v1/offers/:id` trả provider summary.
- Nếu provider trust API lỗi hoặc không có dữ liệu, màn vẫn hiển thị fallback provider từ offer.
- Nếu reviews API lỗi, màn vẫn hiển thị offer detail và chỉ báo lỗi phần reviews.
- Mobile TypeScript vẫn pass.
- Backend typecheck/build/test vẫn pass.
- Runtime smoke nên được mở rộng để seed một offer và kiểm tra `GET /api/v1/offers/:id`.

---

## Việc cần làm tiếp theo

1. Chạy Manual Runtime Verification để xác nhận backend/mobile vẫn xanh.
2. Mở rộng Manual Backend Runtime Smoke để seed provider + offer rồi test `GET /api/v1/offers/:id`.
3. Nếu smoke pass, chuyển sang màn tiếp theo: `Create Deal from Offer`.
