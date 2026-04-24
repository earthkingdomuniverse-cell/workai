# WorkAI Core User Journeys

## Purpose

Core launch journeys for WorkAI 1.0. These journeys define what must work across product, app, backend, QA, and launch operations.

## Journey 1: User creates first offer

Actor: Provider

Goal: Create first offer to become discoverable.

### Steps

1. Open app.
2. Navigate to create offer.
3. Enter title.
4. Enter description.
5. Select skills.
6. Enter price.
7. Submit offer.
8. View offer detail.
9. Confirm offer appears in list and manage view.

### Success criteria

- Offer is active or draft according to selected state.
- Offer appears in own list.
- Offer is searchable or visible where expected.

### Failure recovery

- Validation errors show inline.
- API failures show retry state.
- List can be refreshed.

## Journey 2: User creates first request

Actor: Client / requester

Goal: Post request to find help.

### Steps

1. Open app.
2. Navigate to create request.
3. Enter title.
4. Enter description.
5. Select needed skills.
6. Enter budget.
7. Select urgency.
8. Submit request.
9. View request detail.
10. Confirm request appears in list.

### Success criteria

- Request status is open.
- Request is visible in public/request list.
- Request can trigger AI match or proposal flow.

## Journey 3: Requester receives proposal

Actor: Requester

Goal: Review and accept a proposal.

### Steps

1. View own request.
2. Open proposals for that request.
3. Open proposal detail.
4. Review provider trust/reputation context.
5. Accept or reject proposal.
6. If accepted, deal is created or ready to create.

### Success criteria

- Proposal status updates.
- Deal is created or next deal step is available.
- Both parties can see relevant state.

## Journey 4: Proposal becomes deal

Actors: Provider and requester

Goal: Accepted proposal becomes a deal.

### Steps

1. Requester accepts proposal.
2. Deal is created.
3. Deal detail opens.
4. Both parties see deal in their deals list.
5. Client sees fund action.

### Success criteria

- Deal exists.
- Deal status is valid.
- Both parties can access the deal.

## Journey 5: Deal funded, submitted, released

Actors: Provider and requester

Goal: Complete a deal successfully.

### Steps

1. Client funds deal.
2. Provider is notified or sees funded state.
3. Provider submits work.
4. Client reviews submitted work.
5. Client releases deal.
6. Deal reaches released/completed state.

### Success criteria

- Status transitions are valid.
- Timeline reflects each major event.
- Payment/receipt state is consistent with deal state.

## Journey 6: User leaves review

Actor: Either party after completed deal

Goal: Submit review to build trust.

### Steps

1. Deal reaches released/completed state.
2. Review prompt appears or review action is available.
3. User selects rating.
4. User enters comment and optional tags.
5. User submits review.
6. Review appears in profile/offer aggregate where relevant.

### Success criteria

- Review is stored or mocked consistently.
- Average rating updates where expected.
- Duplicate review behavior is handled.

## Journey 7: Operator handles dispute

Actor: Operator / admin

Goal: Resolve a disputed deal.

### Steps

1. User opens dispute.
2. Operator sees dispute queue.
3. Operator opens dispute context.
4. Operator reviews deal, messages, evidence, risk, and fraud context.
5. Operator chooses decision.
6. System updates deal and review state.

### Success criteria

- Dispute moves through valid states.
- Operator decision is recorded.
- Deal/payment state changes consistently.

## Journey 8: Admin reviews risk and fraud signals

Actor: Admin

Goal: Detect and act on risky behavior.

### Steps

1. Admin opens dashboard.
2. Admin opens risk or fraud view.
3. Admin reviews signal details.
4. Admin takes action or marks reviewed.
5. System records action.

### Success criteria

- Member cannot access admin routes.
- Operator/admin can view risk/fraud data.
- Decision/action is auditable.

## Required QA checklist

- All journeys work end-to-end in mock mode.
- All journeys have loading, error, and empty states where relevant.
- Navigation works for forward and back paths.
- Protected routes enforce role access.
- Data shape stays consistent between app and backend.

## Historical note

This document was moved from the repository root into `docs/product/` during the WorkAI documentation organization batch. The original detailed journey tables remain available in git history.
