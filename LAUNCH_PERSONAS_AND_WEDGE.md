# LAUNCH_PERSONAS_AND_WEDGE.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22  
**Purpose**: Xác định wedge và launch personas - gắn với product flow thực tế

---

## WEDGE SỐ 1: PROVIDER (Freelancer tìm việc)

> **PRIMARY WEDGE cho launch 1.0** - Đây là người tạo supply/inventory cho marketplace

### Vì Sao Wedge Này

| Lý Do               | Chi Tiết                                                   |
| ------------------- | ---------------------------------------------------------- |
| Supply driver       | Không có provider = không có offers = không có marketplace |
| Low friction signup | Chỉ cần tạo offer = listing đơn giản                       |
| AI price helper     | Giải quyết pain point "không biết giá bao nhiêu" - THỰC TẾ |
| Clear value prop    | "Tôi có skill, ai thuê tôi?"                               |
| Viral potential     | Provider mời requester quen để có deal                     |

### Pain Points Cụ Thể (VIETNAM MARKET)

| Pain Point                 | Mô Tả                                                         | Dấu Hiệu            |
| -------------------------- | ------------------------------------------------------------- | ------------------- |
| "Không biết quote giá nào" | Hỏi giá mất 5 phút think, sợ cao quá bỏ lỡ, thấp quá亏        | Quote bằng miệng    |
| "Khách hỏi rồi biệt"       | Quote xong không follow-up được, không biết có quan tâm không | Khách mất tiếp xúc  |
| "Groups Facebook spam"     | Post bị delete, mua quảng cáo mắc, bị mark spam               | Bị kick khỏi groups |
| "Mới không ai thuê"        | Profile mới, không có review, không ai dám thuê               | Chưa có deal nào    |

### Trigger Sử Dụng

```
1. "Có người hỏi làm X giá bao nhiêu?" → Dùng AI price
2. "Muốn gửi portfolio cho khách tiềm năng" → Tạo offer
3. "Cần biết giá thị trường để quote" → AI price reference
4. "Có việc ngoài job chính, muốn kiếm thêm" → Browse requests
```

### Hành Vi Đầu Tiên Trong App

| Step | Hành Vi                             | Mục Đích               |
| ---- | ----------------------------------- | ---------------------- |
| 1    | Signup → chọn role "Provider"       | Phân loại user         |
| 2    | Complete profile (displayName, bio) | Identity               |
| 3    | Thêm skills (1-5 skills)            | Định vị                |
| 4    | **Tạo offer đầu tiên**              | **First value moment** |
| 5    | Dùng AI price check giá             | AI value moment        |
| 6    | Browse requests                     | Match discovery        |

### Điều Khiến Quay Lại

| Trigger                               | Details                                         |
| ------------------------------------- | ----------------------------------------------- |
| Notification có new request fit skill | "Có request design logo, hợp với skill của bạn" |
| Offer được view                       | "Có 5 người xem offer của bạn"                  |
| AI gợi ý nên tạo offer mới            | Next-action push                                |
| Có proposal được accept               | Deal started                                    |
| Review mới từ client                  | Trust buildup                                   |

### Điều Khiến Tạo Deal

```
Provider gửi proposal → Requester accept → Deal funded

Provider NIỀM TIN: Deal có = có thu nhập = chứng minh có skill

⚠️ Provider KHÔNG trả tiền - Provider là side bán, không phải mua
```

---

## PERSONA 2: REQUESTER (Founder/SME tìm người làm)

### Vì Sao Person #2

| Lý Do                     | Chi Tiết                                  |
| ------------------------- | ----------------------------------------- |
| Demand side               | Cần có requester để provider gửi proposal |
| Complementary với wedge 1 | Provider cần requester để có deals        |
| AI match giá trị          | Không biết ai tốt, AI match giúp chọn     |

### Pain Points Cụ Thể

| Pain Point                 | Mô Tả                                                 | Dấu Hiệu              |
| -------------------------- | ----------------------------------------------------- | --------------------- |
| "Không biết ai tốt"        | Không quen ai có skill này, phải interview từng người | Interview nhiều người |
| "Sợ bị scam"               | Người lạ không đáng tin, làm xong bùm                 | Do dự quá lâu         |
| "Không biết giá bao nhiêu" | Budget bao nhiêu hợp lý? Sợ bị chặt chém              | Hỏi giá nhiều place   |
| "Việc nhỏ thôi"            | Full-time mắc, cần người làm task nhỏ                 | Part-time/gig only    |

### Trigger Sử Dụng

```
1. "Cần làm logo/startup assets, không có người trong team"
2. "Cần edit video ngắn gấp, cty không làm được"
3. "Dự án nhỏ, không đủ thuê full-time"
```

### Hành Vi Đầu Tiên Trong App

| Step | Hành Vi                        | Mục Đích               |
| ---- | ------------------------------ | ---------------------- |
| 1    | Signup → chọn role "Requester" | Phân loại user         |
| 2    | Complete profile               | Identity               |
| 3    | Browse explore có offers       | Thăm khảo              |
| 4    | **Tạo request đầu tiên**       | **First value moment** |
| 5    | Xem AI match recommendations   | AI value               |
| 6    | Nhận proposals                 | Deal pipeline          |

### Điều Khiến Quay Lại

- Có proposal mới cho request mình
- Requester thấy offers phù hợp trong explore
- Deal có milestone progress
- Review từ provider

### Điều Khiến Tạo Deal

```
Requester browse → Thấy offer ưng ý HOẶC
Requester tạo request → Nhận proposals → Chọn 1 → Accept → Deal

Deal = khi requester accept proposal của provider
```

---

## PERSONA 3: OPERATOR/ADMIN (Internal User)

### Vì Sao Person #3

| Lý Do                       | Chi Tiết                           |
| --------------------------- | ---------------------------------- |
| Required cho scaling        | Platform cần moderation            |
| Trust/safety                | Disputes cần người xử lý           |
| Founder = operator đầu tiên | Đảm bảo platform an toàn từ ngày 1 |

### Pain Points Cụ Thể

| Pain Point           | Mô Tả                        |
| -------------------- | ---------------------------- |
| "Disputes chất đống" | Cần tool xem + resolve nhanh |
| "Risk users"         | Cần visibility ai có vấn đề  |
| "Fraud signals"      | Cần detect scam sớm          |

### Trigger Sử Dụng

```
1. "Có dispute cần resolve gấp"
2. "Cần xem users có risk signal"
3. "Cần approve/reject reviews"
```

### Hành Vi Đầu Tiên

| Step | Hành Vi                       |
| ---- | ----------------------------- |
| 1    | Login với operator/admin role |
| 2    | Xem admin dashboard overview  |
| 3    | Review disputes list          |
| 4    | Xem risk/fraud signals        |

### Điều Khiến Quay Lại

- Có disputes mới
- Có reviews cần moderate
- Có fraud signals

---

## WEDGE PRIORITY MATRIX

| Persona        | Wedge # | Vai Trò  | Lý Do Chọn                             |
| -------------- | ------- | -------- | -------------------------------------- |
| **Provider**   | **#1**  | Supplier | Supply-first = inventory = marketplace |
| Requester      | #2      | Client   | Complementary, cần có inventory trước  |
| Operator/Admin | #3      | Internal | Không tính vào metrics                 |

---

## WHY PROVIDER IS WEDGE FOR SKILLVALUE AI 1.0

### Product-Market Fit

| Factor          | Analysis                                     |
| --------------- | -------------------------------------------- |
| **CORE VALUE**  | "Có skill, cần người thuê"                   |
| Provider signup | Dễ dàng (chỉ cần offer)                      |
| AI price        | Giải quyết pricing anxiety = pain point THỰC |
| Trust system    | Build reputation từ deals đầu tiên           |
| AI match        | Được recommend cho requests phù hợp          |

### Growth Loop

```
Provider → Tạo offer → Nhận deal → Có review → Trust score ↑
→ Nhiều proposal accepted → Nhiều deal hơn

First deal = First review = First trust
Trust = Motivation để ở lại platform
```

### Supply-First Strategy Cho 1.0

| Why                    | Logic                           |
| ---------------------- | ------------------------------- |
| Không có offers        | Không có gì mà requester browse |
| Không có browse        | Requester không có trải nghiệm  |
| Không có trải nghiệm   | Không tạo request               |
| Requester không create | Provider không có proposal      |
| NO DEALS               | No marketplace                  |

**→ PHẢI CÓ INVENTORY (OFFERS) TRƯỚC**

### AI Differentiator

| AI Feature | Value for Provider                       |
| ---------- | ---------------------------------------- |
| AI price   | "Không biết quote giá" → Check AI → Done |
| AI match   | "Có request nào hợp không?" → AI suggest |
| AI copilot | "Nên làm gì tiếp?" → Next action         |

---

## LAUNCH SEQUENCING

### Phase 1: Seed (User 1-20)

- **Focus**: Provider wedge
- **Invite**: Freelancers quen có skill rõ ràng (design, dev, content)
- **Goal**: Tạo 10-20 offers chất lượng

### Phase 2: Bootstrap (User 21-50)

- **Introduce**: Requester quen cần thuê người
- **Invite**: SMEs, startup founders cần outsourcing
- **Goal**: 10+ requests, 5+ proposals, 2+ deals

### Phase 3: Launch (User 51-100)

- **Open**: Public invite
- **Goal**: 50 offers, 30 requests, 20+ deals

---

## SUCCESS CRITERIA

| Metric                 | Target (First 100 Users)        |
| ---------------------- | ------------------------------- |
| Provider signups       | 60%+ of total                   |
| Offer creation rate    | 50%+ of providers have 1+ offer |
| First offer within 24h | 70%+ of providers               |
| Request creation rate  | 40%+ of requesters              |
| Deal conversion        | 20%+ of proposals accepted      |
| D7 retention           | 40%+ users return               |

---

## RISK ASSESSMENT

| Risk                        | Mitigation                                 |
| --------------------------- | ------------------------------------------ |
| Provider không tạo offer    | AI price + next-action nudge               |
| Provider không có deal      | AI match cho proposals                     |
| Provider churn sau deal 1   | Trust score visible = motivation           |
| Requester không tạo request | Browse offers → inspired to post           |
| Ghost marketplace           | Seed provider trước, then invite requester |

---

## SELF-ASSESSMENT

- [x] Tài liệu có dùng được thật không? → **CÓ**, gắn với product flow thực
- [x] Đủ cụ thể để team vận hành? → **CÓ**, có pain/trigger/flow rõ
- [x] Gắn với product hiện tại? → **CÓ**, gắn với offer/request/deal flow
- [x] Tránh startup sáo rỗng? → **CÓ**, language thực tế, Vietnam market

**Status: READY TO USE**
