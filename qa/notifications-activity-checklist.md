# Notifications + Activity QA Checklist

## Scope

- Notifications list and management
- Activity feed display
- Mark as read functionality
- Event type rendering
- Grouping/ordering
- Unread count and status
- Empty/loading/error states

---

## 1. Activity Screen Tests

### 1.1 Activity List Display

| Test Case | Expected | Status |
|-----------|----------|--------|
| Activities load | Shows list of activity items | ⚠️ MOCK ONLY |
| Activity card render | Icon, title, description, timestamp | ✅ PASS |
| Multiple activities | All items displayed in FlatList | ✅ PASS |
| Card press | Mark as read on tap | ✅ PASS |
| Pull to refresh | RefreshControl triggers reload | ✅ PASS |

**Code Evidence** (`mobile/app/(tabs)/activity.tsx`):
```typescript
// Lines 34-80: Mock data only
const mockActivities: ActivityItem[] = [
  { id: '1', type: 'deal', title: 'Deal Created', ... },
  { id: '2', type: 'proposal', title: 'Proposal Received', ... },
  // ...
];
```

**BUG FOUND: NOTIF-001**
- **Location**: `mobile/app/(tabs)/activity.tsx` lines 30-88
- **Issue**: Uses hardcoded mock data, NO API integration
- **Impact**: Always shows same 5 mock activities
- **Fix**: Integrate with notificationService.getNotifications()

### 1.2 Activity Types

| Type | Icon | Title Style | Status |
|------|------|-------------|--------|
| `deal` | 💼 | "Deal Created" | ✅ PASS |
| `proposal` | 📝 | "Proposal Received" | ✅ PASS |
| `review` | ⭐ | "New Review" | ✅ PASS |
| `payment` | 💰 | "Payment Received" | ✅ PASS |
| `message` | 💬 | "New Message" | ✅ PASS |

### 1.3 Activity Card Content

| Field | Display | Status |
|-------|---------|--------|
| Icon | Emoji in circular badge | ✅ PASS |
| Title | Bold, primary color | ✅ PASS |
| Description | Secondary text | ✅ PASS |
| Timestamp | Relative time | ✅ PASS |
| Unread indicator | Blue dot | ✅ PASS |

---

## 2. Mark As Read Tests

### 2.1 Mark As Read on Tap

| Test Case | Expected | Status |
|-----------|----------|--------|
| Tap unread item | Marks as read locally | ✅ PASS |
| Visual feedback | Background changes from unread | ✅ PASS |
| Unread dot | Disappears | ✅ PASS |
| Backend sync | ❌ NOT IMPLEMENTED | ❌ FAIL |

**Code Evidence** (activity.tsx lines 95-97):
```typescript
const markAsRead = (id: string) => {
  setActivities((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
};
```

**BUG FOUND: NOTIF-002**
- **Location**: `mobile/app/(tabs)/activity.tsx` line 95-97
- **Issue**: Only updates local state, NO backend sync
- **Impact**: Read status not persisted on refresh
- **Fix**: Call notificationService.markAsRead(id)

### 2.2 Unread State Visual

| Test Case | Expected | Status |
|-----------|----------|--------|
| Unread background | `activityCardUnread` style (tinted) | ✅ PASS |
| Unread dot | Blue dot shown | ✅ PASS |
| Read state | No tint, no dot | ✅ PASS |

**Code Evidence** (lines 130-143):
```typescript
<TouchableOpacity
  style={[styles.activityCard, !item.read && styles.activityCardUnread]}
  onPress={() => markAsRead(item.id)}
>
  {!item.read && <View style={styles.unreadDot} />}
</TouchableOpacity>
```

---

## 3. Timestamp Render Tests

### 3.1 Time Formatting

| Test Case | Input | Expected | Status |
|-----------|-------|----------|--------|
| Just now | < 1 hour | "Just now" | ✅ PASS |
| Hours ago | 1-23 hours | "Xh ago" | ✅ PASS |
| Days ago | 1-6 days | "Xd ago" | ✅ PASS |
| Week+ | > 7 days | Locale date | ✅ PASS |

**Code Evidence** (lines 151-162):
```typescript
function formatTime(timestamp: string): string {
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
```

**Edge Cases**:
- | Future timestamp | Shows incorrect | ⚠️ NOT HANDLED |
- | Weeks | Shows date, not "Xw ago" | ✅ ACCEPTABLE |

---

## 4. Backend Contract Analysis

### 4.1 Notification vs Activity Mismatch

| Field | Backend (`Notification`) | Mobile (`ActivityItem`) | Match? |
|-------|------------------------|--------------------------|--------|
| `id` | `string` | `string` | ✅ YES |
| `type` | `NotificationType` | `'deal'\|'proposal'\|'message'\|'review'\|'payment'` | ⚠️ PARTIAL |
| `title` | `string` | `string` | ✅ YES |
| `message` | `string` | `description` (renamed) | ✅ OK |
| `userId` | `string` | **MISSING** | ❌ NO |
| `data` | `NotificationData` | **MISSING** | ❌ NO |
| `read` | `boolean` | `boolean` | ✅ YES |
| `readAt` | `string?` | **MISSING** | ❌ NO |
| `priority` | `'low'\|'medium'\|'high'\|'urgent'` | **MISSING** | ❌ NO |
| `actionUrl` | `string?` | **MISSING** | ❌ NO |
| `icon` | **MISSING** | `string` (emoji) | ❌ EXTRA |

**Summary**: Mobile uses simplified structure, missing important backend fields.

### 4.2 Notification Types Mapping

| Backend Type | Mobile Type | Icon | Status |
|--------------|-------------|------|--------|
| `deal_created` | `deal` | 💼 | ✅ MAPPED |
| `proposal_received` | `proposal` | 📝 | ✅ MAPPED |
| `review_received` | `review` | ⭐ | ✅ MAPPED |
| `payment_received` | `payment` | 💰 | ✅ MAPPED |
| `message_received` | `message` | 💬 | ✅ MAPPED |

**Many backend types NOT mapped**:
- `deal_updated`, `deal_completed`
- `proposal_accepted`, `proposal_rejected`
- `payment_sent`
- `dispute_raised`, `dispute_resolved`
- `verification_completed`
- `trust_score_updated`
- `system`, `announcement`

---

## 5. Grouping/Ordering Tests

### 5.1 Current Ordering

| Aspect | Implementation | Status |
|--------|---------------|--------|
| Sort order | Array order (mock) | ⚠️ NOT SORTED |
| Grouping | None | ❌ NOT GROUPED |
| Date grouping | None | ❌ NOT GROUPED |

**BUG FOUND: NOTIF-003**
- **Location**: `mobile/app/(tabs)/activity.tsx`
- **Issue**: No sorting by timestamp, no date grouping
- **Expected**: Group by "Today", "Yesterday", "This week", etc.
- **Fix**: Add sort and grouping logic:

```typescript
// Sort by timestamp desc
const sorted = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Group by date
const grouped = groupBy(sorted, item => getDateGroup(item.timestamp));
```

### 5.2 Missing Grouping Feature

| Feature | Status | Impact |
|---------|--------|--------|
| Section headers | ❌ NOT IMPLEMENTED | Hard to scan |
| Date separators | ❌ NOT IMPLEMENTED | No time context |
| Collapsible groups | ❌ NOT IMPLEMENTED | N/A |

---

## 6. Empty/Loading/Error States

### 6.1 Loading State

| Test Case | Expected | Status |
|-----------|----------|--------|
| Initial load | Shows LoadingState | ✅ PASS |
| Refresh | Shows RefreshControl spinner | ✅ PASS |
| Message | "Loading activity..." | ✅ PASS |

**Code Evidence** (lines 99-101):
```typescript
if (loading) {
  return <LoadingState fullScreen message="Loading activity..." />;
}
```

### 6.2 Empty State

| Test Case | Expected | Status |
|-----------|----------|--------|
| No activities | Shows EmptyState | ✅ PASS |
| Title | "No activity yet" | ✅ PASS |
| Description | "Your activity feed will appear here" | ✅ PASS |
| Icon | 📋 | ✅ PASS |

**Code Evidence** (lines 107-115):
```typescript
if (activities.length === 0) {
  return (
    <EmptyState
      title="No activity yet"
      description="Your activity feed will appear here"
      icon="📋"
    />
  );
}
```

### 6.3 Error State

| Test Case | Expected | Status |
|-----------|----------|--------|
| API error | Shows ErrorState with retry | ✅ PASS |
| Network error | Generic error message | ✅ PASS |
| Retry button | Calls loadActivities() | ✅ PASS |

**Code Evidence** (lines 103-105):
```typescript
if (error && activities.length === 0) {
  return <ErrorState message={error} onRetry={loadActivities} />;
}
```

---

## 7. Notification Service Missing

### 7.1 Service Layer Status

| Component | Status | Notes |
|-----------|--------|-------|
| notificationService.ts | ❌ NOT FOUND | Need to create |
| activityService.ts | ❌ NOT FOUND | Need to create |
| Push notification handler | ❌ NOT IMPLEMENTED | Future feature |

**BUG FOUND: NOTIF-004**
- **Location**: `mobile/src/services/`
- **Issue**: No notification or activity service exists
- **Impact**: Cannot fetch real notifications from backend
- **Fix**: Create `mobile/src/services/notificationService.ts`:

```typescript
export const notificationService = {
  async getNotifications(): Promise<Notification[]>,
  async markAsRead(id: string): Promise<void>,
  async markAllAsRead(): Promise<void>,
  async getPreferences(): Promise<NotificationPreferences>,
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences>,
};
```

### 7.2 Settings Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Notification settings | ⚠️ EXISTS | `mobile/app/settings/notifications.tsx` |
| Backend sync | ❌ NOT CONNECTED | Mock only |

---

## 8. Unread Count Tests

### 8.1 Global Unread Count

| Location | Expected | Status |
|----------|----------|--------|
| Tab badge | Show unread count | ❌ NOT IMPLEMENTED |
| App icon badge | Show unread count | ❌ NOT IMPLEMENTED |
| Header | Show unread count | ❌ NOT IMPLEMENTED |

**BUG FOUND: NOTIF-005**
- **Location**: Mobile app navigation
- **Issue**: No unread count shown on Activity tab icon
- **Impact**: Users don't know they have unread notifications
- **Fix**: Add badge to tab bar icon

### 8.2 Local Unread Count

| Feature | Status | Notes |
|---------|--------|-------|
| Per-item unread | ✅ IMPLEMENTED | Blue dot on card |
| Total unread | ❌ NOT SHOWN | Should show in header |

---

## 9. Field Naming Mismatch

### 9.1 Naming Differences

| Backend | Mobile | Issue |
|---------|--------|-------|
| `message` | `description` | Different names, same purpose |
| `NotificationType` | `type` (simplified) | Lost type granularity |
| `priority` | **MISSING** | Cannot show urgency |
| `actionUrl` | **MISSING** | Cannot navigate on tap |
| `data` | **MISSING** | Cannot access related entities |

**Recommendation**: Align mobile interface with backend types.

---

## 10. Action on Tap Tests

### 10.1 Current Behavior

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Tap activity | Navigate to related entity | Marks read only | ❌ PARTIAL |
| Deep link | Navigate via actionUrl | Not implemented | ❌ FAIL |

**BUG FOUND: NOTIF-006**
- **Location**: `mobile/app/(tabs)/activity.tsx` line 132
- **Issue**: Only marks as read, no navigation
- **Expected**: Should navigate based on activity type
- **Fix**: Add navigation logic:

```typescript
const handleActivityPress = (item: ActivityItem) => {
  markAsRead(item.id);
  
  // Navigate based on type
  switch (item.type) {
    case 'deal': router.push(`/deals/${item.entityId}`); break;
    case 'proposal': router.push(`/proposals/${item.entityId}`); break;
    case 'review': router.push(`/reviews/${item.entityId}`); break;
    case 'payment': router.push(`/deals/${item.entityId}/payment`); break;
    case 'message': router.push(`/messages/${item.entityId}`); break;
  }
};
```

---

## 11. Bug Summary

| ID | Severity | Location | Issue | Fix |
|----|----------|----------|-------|-----|
| NOTIF-001 | **HIGH** | `mobile/app/(tabs)/activity.tsx:30-88` | Mock data only, no API | Integrate notificationService |
| NOTIF-002 | **HIGH** | `mobile/app/(tabs)/activity.tsx:95-97` | No backend sync for markAsRead | Add API call |
| NOTIF-003 | MEDIUM | `mobile/app/(tabs)/activity.tsx` | No sort/group by date | Add grouping logic |
| NOTIF-004 | **HIGH** | `mobile/src/services/` | No notificationService | Create service |
| NOTIF-005 | MEDIUM | Mobile navigation | No unread badge on tab | Add badge to tab |
| NOTIF-006 | MEDIUM | `mobile/app/(tabs)/activity.tsx:132` | No navigation on tap | Add deep links |

---

## 12. Feature Completeness

### Activity Screen

| Feature | Status | Completion |
|---------|--------|------------|
| List display | ✅ | 80% (mock only) |
| Activity cards | ✅ | 100% |
| Unread indicator | ✅ | 100% |
| Mark as read | ⚠️ | 50% (local only) |
| Timestamp | ✅ | 90% |
| Pull-to-refresh | ✅ | 100% |
| Loading state | ✅ | 100% |
| Empty state | ✅ | 100% |
| Error state | ✅ | 100% |
| Grouping | ❌ | 0% |
| Backend integration | ❌ | 0% |
| Deep links | ❌ | 0% |

**Activity Overall**: 55% complete

---

## 13. Test Data Reference

### Mock Activity Data

```typescript
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'deal',
    title: 'Deal Created',
    description: 'Mobile App UI Design deal has been created',
    timestamp: new Date().toISOString(),
    read: false,
    icon: '💼',
  },
  {
    id: '2',
    type: 'proposal',
    title: 'Proposal Received',
    description: 'You received a new proposal for E-commerce Platform',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    icon: '📝',
  },
];
```

### Expected Backend Notification

```typescript
const notification: Notification = {
  id: 'notif_1',
  userId: 'user_1',
  type: 'deal_created',
  title: 'New Deal Created',
  message: 'Your deal "Mobile App UI Design" has been created',
  data: { dealId: 'deal_1' },
  read: false,
  priority: 'medium',
  actionUrl: '/deals/deal_1',
  createdAt: '2024-01-20T10:00:00Z',
  updatedAt: '2024-01-20T10:00:00Z',
};
```

---

## 14. How to Verify

### Manual Test Steps

1. **Open Activity tab**
   - Navigate to Activity
   - See 5 mock activities
   - Verify unread items have blue dot and tinted background

2. **Test mark as read**
   - Tap an unread item
   - Verify blue dot disappears
   - Verify background changes to read state
   - **BUG**: Read status not persisted on refresh

3. **Test timestamps**
   - Verify relative times shown (Just now, Xh ago, Xd ago)

4. **Test empty state**
   - Clear activities array (temporarily)
   - Verify EmptyState shown

5. **Test error state**
   - Throw error in loadActivities
   - Verify ErrorState shown with retry button

---

## QA Sign-off

- [x] Activity list display (mock only)
- [ ] Mark as read backend sync ❌ NOT IMPLEMENTED
- [x] Activity feed render
- [x] Event type render
- [ ] Grouping/ordering ❌ NOT IMPLEMENTED
- [ ] Unread count badge ❌ NOT IMPLEMENTED
- [x] Empty state
- [x] Loading state
- [x] Error state

**Status**: ⚠️ PARTIAL - Mock only, no backend

**Summary**:
- Activity UI: 80% complete
- Backend integration: 0% complete
- Critical gaps: No service, no sync, no deep links

**Recommendation**: Need notificationService before production use.
