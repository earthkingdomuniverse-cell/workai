# Kế hoạch triển khai WorkAI theo từng màn hình mobile + backend

## Mục tiêu

Từ thời điểm này, không làm kiểu sửa rời rạc backend/mobile nữa.

Quy trình chuẩn là:

```text
1 màn hình mobile -> backend/API tương ứng -> service mobile -> typecheck/build/test -> runtime smoke -> audit ngắn -> màn tiếp theo
```

Mục tiêu là mỗi vòng tạo ra một lát dọc end-to-end chạy được thật, giảm sửa lại nhiều lần.

---

## Nguồn tham khảo bắt buộc trước khi làm

Trước khi sửa một màn hình hoặc API, phải kiểm tra theo thứ tự:

1. Baseline nội bộ đã pass CI:
   - `docs/audits/FULL_STABILIZATION_BASELINE_STEP_7.md`
   - Manual Runtime Verification pass: `24919469620`
   - Manual Backend Runtime Smoke pass: `24919725752`
2. Code hiện tại trong repo:
   - mobile screen trong `mobile/app/**`
   - mobile service trong `mobile/src/services/**`
   - backend route trong `src/routes/**`
   - backend service trong `src/services/**`
   - Prisma schema trong `prisma/schema.prisma`
3. Tài liệu chính thức realtime khi đụng framework/runtime:
   - Expo Router / Expo navigation khi sửa mobile routing.
   - React Native TypeScript khi sửa component/prop typing.
   - Fastify khi sửa route, error handler, auth middleware, runtime smoke.
   - Prisma khi sửa migration, schema, migrate deploy/diff.
4. CI logs mới nhất trước khi sửa tiếp.

Không dựa vào đoán mò nếu framework/version có thể thay đổi.

---

## Nguyên tắc làm từng màn

Mỗi màn hình phải có một hồ sơ triển khai ngắn gồm:

```text
Tên màn:
Mục tiêu người dùng:
Dữ liệu cần hiển thị:
Hành động người dùng:
API cần dùng:
Backend route/service/schema cần có:
Mobile service cần có:
Loading state:
Empty state:
Error state:
Auth requirement:
Test/typecheck/runtime smoke:
Điều kiện pass:
```

Chỉ khi hồ sơ này rõ mới bắt đầu sửa code.

---

## Thứ tự màn hình đề xuất

### 1. Offer Detail

Lý do chọn trước:

- Là màn trung tâm của marketplace.
- Đã có file `mobile/app/offers/[id].tsx`.
- Nối trực tiếp sang flow tạo deal.
- Kiểm tra được offer, provider trust, reviews.

API cần kiểm tra/hoàn thiện:

```text
GET /api/v1/offers/:id
GET /api/v1/reviews/by-offer/:id
GET /api/v1/reviews/aggregate/offer/:id
GET /api/v1/trust/profile/:userId
```

Điều kiện pass:

- Màn hiển thị offer thật từ API.
- Có loading/error/empty state rõ.
- Provider info không vỡ nếu thiếu trust data.
- Reviews không làm hỏng màn nếu API lỗi.
- Button `Create Deal` điều hướng đúng.
- Backend + mobile CI vẫn xanh.

---

### 2. Create Deal from Offer

Mục tiêu:

- Người dùng tạo deal từ một offer cụ thể.

API cần kiểm tra/hoàn thiện:

```text
POST /api/v1/deals
GET /api/v1/offers/:id
```

Điều kiện pass:

- Pre-fill offerId/providerId/amount.
- Validate amount, title, description.
- Auth required.
- Tạo deal thành công trả về deal id.
- Điều hướng sang Deal Detail.

---

### 3. Deal Detail

Mục tiêu:

- Client/provider xem trạng thái deal và hành động tiếp theo.

API cần kiểm tra/hoàn thiện:

```text
GET /api/v1/deals/:id
POST /api/v1/deals/:id/fund
POST /api/v1/deals/:id/submit
POST /api/v1/deals/:id/release
POST /api/v1/deals/:id/dispute
```

Điều kiện pass:

- Hiển thị trạng thái deal chính xác.
- Chỉ hiện action phù hợp với role/status.
- Không token -> 401.
- Không đúng owner/provider -> 403.

---

### 4. Fund Deal / Payment

Mục tiêu:

- Client nạp/fund deal.

API cần kiểm tra/hoàn thiện:

```text
POST /api/v1/deals/:id/fund
POST /api/v1/payments/zalopay/create
GET /api/v1/payments/status
```

Điều kiện pass:

- Validate amount.
- Không cho fund deal của người khác.
- Payment status rõ: pending/completed/failed.
- Wallet/deal transaction không tạo trùng.

---

### 5. Submit Work

Mục tiêu:

- Provider gửi kết quả công việc.

API cần kiểm tra/hoàn thiện:

```text
POST /api/v1/deals/:id/submit
```

Điều kiện pass:

- Chỉ provider của deal được submit.
- Deal phải ở trạng thái hợp lệ.
- Submit thành công đổi status.

---

### 6. Release / Dispute

Mục tiêu:

- Client release escrow hoặc mở dispute.

API cần kiểm tra/hoàn thiện:

```text
POST /api/v1/deals/:id/release
POST /api/v1/deals/:id/dispute
```

Điều kiện pass:

- Release chỉ cho client.
- Dispute có reason.
- Wallet transaction nhất quán.

---

### 7. Review Creation

Mục tiêu:

- Người dùng đánh giá sau deal.

API cần kiểm tra/hoàn thiện:

```text
POST /api/v1/reviews
GET /api/v1/reviews/by-offer/:id
GET /api/v1/reviews/aggregate/:subjectType/:subjectId
```

Điều kiện pass:

- Auth required.
- Rating nằm trong range hợp lệ.
- Không duplicate review trái logic.
- Aggregate cập nhật đúng.

---

### 8. Notifications

Mục tiêu:

- Người dùng xem và quản lý thông báo.

API cần kiểm tra/hoàn thiện:

```text
GET /api/v1/notifications
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id
GET /api/v1/notifications/unread-count
GET /api/v1/notifications/preferences
PATCH /api/v1/notifications/preferences
```

Điều kiện pass:

- Không token -> 401.
- Chỉ thấy notification của chính mình.
- Mark read/read-all hoạt động.

---

### 9. Wallet / Withdraw

Mục tiêu:

- Người dùng xem ví và rút tiền.

API cần kiểm tra/hoàn thiện:

```text
GET /api/v1/wallet
POST /api/v1/withdraw
GET /api/v1/withdraw
```

Điều kiện pass:

- Không token -> 401.
- Validate balance.
- Withdraw pending rõ trạng thái.

---

### 10. Admin Overview

Mục tiêu:

- Operator/admin xem dashboard quản trị.

API cần kiểm tra/hoàn thiện:

```text
GET /api/v1/admin/overview
```

Điều kiện pass:

- Không token -> 401.
- Member -> 403.
- Operator/admin -> 200.
- Response shape chuẩn `{ data, meta }` nếu route đang theo chuẩn đó.

---

## Checklist bắt buộc cho mỗi màn

### Trước khi sửa code

- Đọc screen mobile hiện tại.
- Đọc mobile service tương ứng.
- Đọc backend route/service/schema tương ứng.
- Kiểm tra tài liệu chính thức nếu đụng framework/runtime.
- Viết scope rõ: màn này cần sửa gì, không sửa gì.

### Khi sửa backend

- Route trả response shape ổn định.
- Auth/authorization rõ: public/authenticated/role-protected.
- Error code nhất quán.
- Không duplicate auth helper.
- Không tạo transaction không idempotent ở payment/wallet.

### Khi sửa mobile

- Không kéo import từ root `../src` ngoài mobile.
- Screen có loading/error/empty state.
- Service type khớp response backend.
- Navigation dùng Expo Router đúng route hiện có.
- Không dùng prop không được component hỗ trợ.

### Sau khi sửa

Chạy hoặc dùng workflow để xác minh:

```bash
npm run typecheck
npm run build
npm test
npx prisma migrate deploy
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code
cd mobile && npx tsc --noEmit
```

Nếu đụng runtime backend, chạy thêm:

```text
Manual Backend Runtime Smoke
```

---

## Quy tắc tránh sửa nhiều

1. Không sửa màn tiếp theo khi màn hiện tại chưa pass.
2. Không thay đổi theme/component shared nếu chỉ một màn cần fix, trừ khi lỗi là lỗi API component chung.
3. Không đổi response backend nếu mobile có thể map ổn bằng service adapter.
4. Không thêm field giả nếu Prisma schema đã có field đúng.
5. Không viết logic payment/wallet mới nếu chưa kiểm tra idempotency.
6. Không sửa auth riêng từng route; dùng helper chung.
7. Không tin typecheck xanh là runtime xanh; route quan trọng phải có smoke.
8. Mỗi vòng phải kết thúc bằng CI pass hoặc log lỗi rõ ràng.

---

## Kế hoạch bắt đầu ngay

Màn đầu tiên sẽ là:

```text
Offer Detail
```

Việc cần làm ở vòng tiếp theo:

1. Đọc `mobile/app/offers/[id].tsx`.
2. Đọc `mobile/src/services/offerService.ts`, `reviewService.ts`, `trustService.ts`.
3. Đọc backend routes: offers, reviews, trust.
4. Chốt response contract cho màn Offer Detail.
5. Sửa backend/mobile nếu contract lệch.
6. Chạy Manual Runtime Verification.
7. Nếu cần, mở rộng Backend Runtime Smoke cho offer detail public/auth behavior.
8. Ghi audit ngắn cho màn Offer Detail.
