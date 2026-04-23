# Recommendations QA Checklist

## Scope

- Recommendations feature (offer/request matching)
- Mobile screens: Home, Explore
- Recommendation algorithm

## QA Tasks

### 1. Home Recommended Section

#### 1.1 Home Recommended Offers

- Test: Home screen shows Recommended section
- Expected: Offers based on user profile

#### 1.2 Section Header

- Test: "Recommended for You" header
- Expected: Displayed correctly

### 2. Explore Recommended Section

#### 2.1 Explore Recommended Offers

- Test: Explore shows recommended offers
- Expected: Sorted by relevance

#### 2.2 Recommended Requests

- Test: Recommended requests section
- Expected: For providers to browse

### 3. Offer Shape

#### 3.1 Offer Fields

- Test: Recommended offer object
- Expected: id, title, price, provider, skills, deliveryTime

#### 3.2 Provider Info

- Test: Provider details included
- Expected: displayName, trustScore, completedDeals, averageRating

### 4. Request Shape

#### 4.1 Request Fields

- Test: Recommended request object
- Expected: id, title, budget, urgency, skills, requester

#### 4.2 Requester Info

- Test: Requester details included
- Expected: displayName, trustScore, completedDeals

### 5. Reason/Explanation

#### 5.1 Recommendation Reason

- Test: Why recommended
- Expected: Based on skills, budget, location match

#### 5.2 Match Score

- Test: Match percentage
- Expected: Displayed on cards

### 6. Empty State

#### 6.1 No Recommendations

- Test: No matching items
- Expected: EmptyState component

### 7. Fallback Mode

#### 7.1 Backend Unavailable

- Test: API fails
- Expected: Shows recent/popular items as fallback

---

## Known Issues

### BUG 1: No Dedicated Recommendation Service

- **Location**: mobile/src/services/
- **Issue**: No recommendation service layer
- **Impact**: No unified API for recommendations
- **Status**: Needs implementation

### BUG 2: Home Uses Mock Data

- **Location**: mobile/app/(tabs)/home.tsx
- **Issue**: Hardcoded offers
- **Impact**: Not personalized
- **Status**: Use offerService.getRecommendations()

### BUG 3: Explore Uses Mock Data

- **Location**: mobile/app/(tabs)/explore.tsx
- **Issue**: Hardcoded explore data
- **Impact**: Needs backend integration
- **Status**: Use offerService with recommendations

---

## Recommendation Sources

| Screen         | Source                            | Fallback         |
| -------------- | --------------------------------- | ---------------- |
| Home           | offerService.getRecommendations() | Recent offers    |
| Explore        | offerService + requestService     | Popular items    |
| Request Detail | requestService.getMatches()       | Related requests |
| Deal Detail    | offerService.getMatches()         | Similar offers   |
