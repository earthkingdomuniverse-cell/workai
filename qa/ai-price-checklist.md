# AI Price QA Checklist

## Scope

- AI Price suggestion feature
- Backend API: POST /ai/price
- Mobile screen (if exists)
- Price calculation logic

## QA Tasks

### 1. Input Form

#### 1.1 Provider Level Mapping

- Test: Provider level enum values
- Expected: 'beginner' | 'intermediate' | 'expert'

#### 1.2 Skills Input

- Test: Skills array from input
- Expected: Array of skill strings

#### 1.3 Title Input

- Test: Title from input
- Expected: String

### 2. Price Output Rendering

#### 2.1 Suggested Price

- Test: suggested_price field
- Expected: Number (should be based on skills + level)

#### 2.2 Floor Price

- Test: floor_price field
- Expected: 75% of suggested (or similar formula)

#### 2.3 Ceiling Price

- Test: ceiling_price field
- Expected: 130% of suggested (or similar formula)

#### 2.4 Reasoning

- Test: reasoning array
- Expected: Explanations for calculation

### 3. Fallback Mode

#### 3.1 AI Service Fallback

- Test: When calculation fails
- Expected: Returns heuristic-based result

#### 3.2 No Crash on Malformed Response

- Test: API returns unexpected shape
- Expected: Handled gracefully or returns defaults

### 4. Calculation Logic

#### 4.1 Skill Weight

- Test: More skills = higher price
- Expected: skillWeight = skills.length \* 120

#### 4.2 Level Multiplier

- beginner: 0.7x
- intermediate: 1x
- expert: 1.5x

---

## Known Issues

### BUG 1: No Mobile AI Price Service

- **Location**: mobile/src/services/
- **Issue**: No service to call /ai/price endpoint
- **Impact**: Mobile can't get price suggestions
- **Status**: Needs implementation (low priority - no mobile screen yet)

### BUG 2: Mobile Support Screen Uses Mock Data

- **Location**: mobile/app/ai/support.tsx lines 26-35
- **Issue**: Uses hardcoded mock response instead of API
- **Impact**: AI Support not connected to backend
- **Status**: Needs API integration

---

## API Contract

### POST /api/v1/ai/price

**Request:**

```json
{
  "title": "Build dashboard",
  "skills": ["React", "TypeScript"],
  "providerLevel": "expert"
}
```

**Response:**

```json
{
  "data": {
    "suggested_price": 5000,
    "floor_price": 3750,
    "ceiling_price": 6500,
    "reasoning": [
      "Estimated from 2 declared skills",
      "Adjusted for expert provider level",
      "Applied heuristic market range fallback"
    ]
  }
}
```
