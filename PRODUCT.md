# WorkAI Product Brief

## One-line product

WorkAI là AI-powered talent marketplace giúp ghép đúng người, định giá nhanh hơn và giảm rủi ro vận hành giao dịch dịch vụ.

## Problem

Marketplace dịch vụ thường gặp 4 điểm nghẽn:

1. Matching chậm và thiếu ngữ cảnh.
2. Pricing thiếu chuẩn, khó chốt nhanh.
3. Trust rời rạc, khó xác thực chất lượng thật.
4. Admin/operator thiếu công cụ để xử lý fraud và dispute hiệu quả.

## Target users

- **Client**: cần tìm người làm nhanh, ít rủi ro, rõ kỳ vọng.
- **Provider**: muốn có lead chất lượng, profile rõ giá trị và ít bị ép giá.
- **Operator**: cần dashboard để giữ thanh khoản và chất lượng marketplace.

## Core product loops

- Client tạo request -> AI đề xuất match -> provider gửi proposal -> deal được tạo.
- Provider tối ưu profile/trust -> được match đúng hơn -> tăng conversion.
- Operator xử lý risk/review/dispute -> marketplace an toàn hơn -> giữ retention.

## Product surfaces in this repo

- `src/`: backend API và business modules.
- `mobile/`: mobile app theo Expo Router.
- `.github/`: product operations bằng GitHub-native workflows và templates.
- `docs/`: product portal và roadmap để publish bằng GitHub Pages.

## Current maturity

- Marketplace core: đã có mock-first workflow end-to-end.
- AI support: đã có route và service layer, còn thiếu live production integration.
- Mobile app: đã có product screens chính, còn thiếu runtime packaging hoàn chỉnh.
- Operations: đã có CI, CodeQL, Dependabot, release flow, Pages docs.

## What makes this a product, not just a project

- Có định vị người dùng rõ ràng.
- Có vòng lặp giá trị và mô-đun chức năng cụ thể.
- Có quy trình feedback, issue intake, release và security policy.
- Có portal tài liệu và roadmap public-facing.
- Có hạ tầng GitHub-native để vận hành liên tục thay vì chỉ lưu source code.
- Zalo Platform Integration: Mạng xã hội việc làm được tối ưu cho thị trường Việt Nam bằng nền tảng Zalo OA và Zalo Pay, hỗ trợ AI-driven matching, payments, và các kênh tương tác người dùng trên một nền tảng phổ biến tại VN.
