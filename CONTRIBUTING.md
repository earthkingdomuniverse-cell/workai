# Contributing to WorkAI

WorkAI được tổ chức như một product workspace. Khi đóng góp, hãy ưu tiên tác động tới người dùng, độ an toàn vận hành và khả năng release liên tục, không chỉ riêng thay đổi code.

## Quy trình

1. Fork repo.
2. Tạo branch theo chuẩn như `feat/request-priority-score` hoặc `fix/admin-risk-filter`.
3. Thực hiện thay đổi với phạm vi rõ ràng theo một product area.
4. Chạy các kiểm tra phù hợp trước khi mở PR.
5. Mở Pull Request và điền đầy đủ template.

## Product areas

- `src/`: backend product logic và API contracts.
- `mobile/`: mobile experience.
- `.github/`: workflows, release, docs publishing, issue intake.
- `docs/`: product portal, roadmap, product-facing documentation.

## Definition of done

- Có lý do product rõ ràng: giải quyết bug, tăng trải nghiệm hoặc tăng năng lực vận hành.
- Không phá vỡ luồng mock-first hiện có trừ khi thay đổi đó được yêu cầu rõ ràng.
- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- Nếu sửa `mobile/`: kiểm tra thủ công các màn hình và flow bị ảnh hưởng trước khi mở PR.
- Cập nhật docs nếu thay đổi tác động tới API, luồng người dùng hoặc vận hành repo.

## Commit and PR standards

- Dùng [Conventional Commits](https://www.conventionalcommits.org/).
- PR nên gói theo một outcome, không gom nhiều ý tưởng rời rạc.
- Nếu là feature, hãy nói rõ user segment hưởng lợi và chỉ số kỳ vọng cải thiện.
- Nếu là bug fix, hãy mô tả tác động thực tế và cách tái hiện.

## Feedback channels

- Bug report: dùng GitHub Issue form.
- Feature proposal: dùng GitHub Issue form theo hướng product feedback.
- Security issue: không đăng công khai, dùng flow trong [SECURITY.md](SECURITY.md).
