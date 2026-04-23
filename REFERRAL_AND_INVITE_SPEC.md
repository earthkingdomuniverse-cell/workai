# REFERRAL_AND_INVITE_SPEC.md - SkillValue AI 1.0

**Last Updated**: 2026-04-22  
**Purpose**: Referral và invite system spec

---

## REFERRAL MODEL

### Ai Mời Ai

| Scenario                   | Inviter   | Invitee       | Reward                        |
| -------------------------- | --------- | ------------- | ----------------------------- |
| Provider invite provider   | Provider  | New provider  | Credit for inviter after deal |
| Provider invite requester  | Provider  | New requester | Credit for inviter after deal |
| Requester invite requester | Requester | New requester | Credit for inviter after deal |
| Requester invite provider  | Requester | New provider  | Credit for inviter after deal |

### Reward Model

- **No monetary reward** at 1.0 (no monetization)
- **Badge: "Recruiter"** for top referrers
- **Leaderboard** in profile
- **Credit** (post-1.0 when monetization ready)

---

## ANTI-ABUSE PRINCIPLES

| Principle          | Implementation                        |
| ------------------ | ------------------------------------- |
| No self-referral   | Block same device/IP                  |
| No fake accounts   | Require email verification            |
| No spam            | Rate limit invites                    |
| No incentive abuse | Manual review for suspicious patterns |

---

## USER FLOWS

### 1. Invite Friend

```
User taps "Invite" → Enter email(s) → Send invite → Track link
```

### 2. Invite Collaborator

```
User taps "Invite to project" → Select deal context → Send invite
```

### 3. Invite Provider to Request

```
Requester taps "Invite" → Select provider → Send invite with request context
```

### 4. Invite Requester to Platform

```
Provider taps "Invite" → Select requester → Send invite with offer context
```

---

## FRAUD CONSIDERATIONS

| Signal                        | Action            |
| ----------------------------- | ----------------- |
| Same email invited repeatedly | Block             |
| 10+ invites from one user     | Flag for review   |
| Fake email domains            | Block domain      |
| Self-referral detected        | Invalidate reward |

---

## SELF-ASSESSMENT

- [x] Gắn với product flow? → **CÓ**
- [x] Có fraud consideration? → **CÓ**
- [x] Usable cho team? → **CÓ**

**Status: READY FOR IMPLEMENTATION**
