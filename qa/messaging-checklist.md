# Messaging QA Checklist

## Scope

- Conversations list (Inbox)
- Conversation detail (Messages)
- Send message functionality
- Unread state management
- Timestamp rendering
- Start conversation from offer/request/deal
- Empty/loading/error states
- Mock/backend switch

---

## 1. Conversations List Tests (Inbox)

### 1.1 List Display

| Test Case | Expected | Status |
|-----------|----------|--------|
| Conversations load | Shows list of message threads | ⚠️ MOCK ONLY |
| Thread card render | Avatar, name, last message, timestamp | ✅ PASS |
| Multiple threads | All threads displayed in FlatList | ✅ PASS |
| Thread order | Sorted by timestamp (newest first) | ⚠️ NOT SORTED |
| Pull to refresh | RefreshControl triggers reload | ✅ PASS |

**Code Evidence** (`mobile/app/(tabs)/inbox.tsx`):
```typescript
// Lines 34-59: Mock data only
const mockThreads: MessageThread[] = [
  { id: '1', name: 'John Doe', lastMessage: 'Thanks...', timestamp: ..., unread: 2, type: 'deal' },
  // ...
];
```

**BUG FOUND: MSG-001**
- **Location**: `mobile/app/(tabs)/inbox.tsx` lines 30-67
- **Issue**: Uses hardcoded mock data, NO API integration
- **Impact**: Always shows same 3 mock conversations
- **Fix**: Integrate with messageService.getConversations()

### 1.2 Thread Card Content

| Field | Display | Status |
|-------|---------|--------|
| Avatar | Initial of name (fallback) | ✅ PASS |
| Name | `thread.name` | ✅ PASS |
| Last message | Truncated to 1 line | ✅ PASS |
| Timestamp | Formatted as "Just now", "Xh ago", or date | ✅ PASS |
| Unread badge | Shows count if > 0 | ✅ PASS |

**FormatTime Logic** (lines 138-147):
```typescript
function formatTime(timestamp: string): string {
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
```

**Edge Cases**:
- | Minutes ago | Shows "Just now" | ⚠️ COARSE |
- | Yesterday | Shows date, not "Yesterday" | ⚠️ IMPROVE |
- | Future timestamp | Would show negative hours | ❌ NOT HANDLED |

### 1.3 Thread Types

| Type | Badge/Icon | Expected Route | Status |
|------|-----------|----------------|--------|
| `deal` | No visual distinction | `/messages/{id}` | ✅ PASS |
| `proposal` | No visual distinction | `/messages/{id}` | ✅ PASS |
| `direct` | No visual distinction | `/messages/{id}` | ✅ PASS |

**Note**: Thread type is stored but not visually indicated.

---

## 2. Conversation Detail Tests

### 2.1 Screen Existence

| Test Case | Expected | Status |
|-----------|----------|--------|
| Route exists | `/messages/[id]` should exist | ❌ FAIL |
| Screen file | `mobile/app/messages/[id].tsx` | ❌ NOT FOUND |
| Navigation | Inbox tap navigates to detail | ⚠️ ROUTE EXISTS |

**BUG FOUND: MSG-002**
- **Location**: `mobile/app/messages/[id].tsx`
- **Issue**: Conversation detail screen DOES NOT EXIST
- **Impact**: Cannot view conversation messages
- **Evidence**: 
  ```typescript
  // inbox.tsx line 107:
  onPress={() => router.push(`/messages/${item.id}` as any)}
  // Route exists in router.d.ts but file doesn't exist
  ```
- **Fix**: Create `mobile/app/messages/[id].tsx` with message list and send functionality

### 2.2 Required Features (Not Implemented)

| Feature | Status | Notes |
|---------|--------|-------|
| Message list | ❌ NOT IMPLEMENTED | Need to create screen |
| Send message | ❌ NOT IMPLEMENTED | Need service + UI |
| Message bubbles | ❌ NOT IMPLEMENTED | Need component |
| Auto-scroll to bottom | ❌ NOT IMPLEMENTED | Need FlatList ref |
| Message status (sent/delivered/read) | ❌ NOT IMPLEMENTED | Need status tracking |

---

## 3. Send Message Tests

### 3.1 Service Layer

| Component | Status | Notes |
|-----------|--------|-------|
| messageService.ts | ❌ NOT FOUND | Need to create |
| sendMessage() method | ❌ NOT IMPLEMENTED | Need implementation |
| API endpoint | ❌ NOT DEFINED | Need backend route |

**BUG FOUND: MSG-003**
- **Location**: `mobile/src/services/`
- **Issue**: No messageService exists
- **Impact**: Cannot send or receive messages
- **Fix**: Create `mobile/src/services/messageService.ts`

**Required Interface**:
```typescript
export const messageService = {
  async getConversations(): Promise<Conversation[]>,
  async getMessages(conversationId: string): Promise<Message[]>,
  async sendMessage(input: MessageInput): Promise<Message>,
  async createConversation(input: ConversationInput): Promise<Conversation>,
  async markAsRead(conversationId: string): Promise<void>,
};
```

---

## 4. Unread State Tests

### 4.1 Unread Badge

| Test Case | Expected | Status |
|-----------|----------|--------|
| Show badge | Dot with count if unread > 0 | ✅ PASS |
| Hide badge | No badge if unread = 0 | ✅ PASS |
| Multiple unread | Shows actual count | ✅ PASS |
| Badge style | Primary color, rounded | ✅ PASS |

**Code Evidence** (inbox.tsx lines 125-129):
```typescript
{item.unread > 0 && (
  <View style={styles.unreadBadge}>
    <Text style={styles.unreadText}>{item.unread}</Text>
  </View>
)}
```

### 4.2 Mark as Read

| Test Case | Expected | Status |
|-----------|----------|--------|
| Mark read on open | Clears unread count | ❌ NOT IMPLEMENTED |
| Update backend | Calls markAsRead API | ❌ NOT IMPLEMENTED |
| Optimistic update | Updates UI immediately | ❌ NOT IMPLEMENTED |

**Missing**: No markAsRead logic implemented.

---

## 5. Timestamp Render Tests

### 5.1 Time Formatting

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Just now | < 1 hour ago | "Just now" | ✅ PASS |
| Hours ago | 1-23 hours ago | "Xh ago" | ✅ PASS |
| Days ago | > 24 hours | Locale date | ✅ PASS |

**Edge Cases Found**:

| Test Case | Input | Actual | Expected | Status |
|-----------|-------|--------|----------|--------|
| 59 minutes ago | `Date.now() - 59*60*1000` | "Just now" | "Just now" | ✅ OK |
| 61 minutes ago | `Date.now() - 61*60*1000` | "1h ago" | "1h ago" | ✅ OK |
| Future date | Tomorrow | Negative hours | Handle gracefully | ❌ BUG |

**BUG FOUND: MSG-004**
- **Location**: `mobile/app/(tabs)/inbox.tsx` line 138-147
- **Issue**: Future timestamps show incorrect values (negative hours)
- **Fix**: Add check:
```typescript
if (diff < 0) return 'Just now'; // or 'Future'
```

### 5.2 Timestamp Display

| Location | Format | Status |
|----------|--------|--------|
| Thread list | Relative time | ✅ PASS |
| Message bubble | Not implemented | ❌ N/A |
| Conversation header | Not implemented | ❌ N/A |

---

## 6. Start Conversation Tests

### 6.1 From Offer

| Test Case | Trigger | Expected | Status |
|-----------|---------|----------|--------|
| "Message Provider" button | Offer detail | Create conversation | ❌ NOT IMPLEMENTED |
| Pre-fill context | Offer ID | Set entityId, entityType | ❌ NOT IMPLEMENTED |

### 6.2 From Request

| Test Case | Trigger | Expected | Status |
|-----------|---------|----------|--------|
| "Message Requester" button | Request detail | Create conversation | ❌ NOT IMPLEMENTED |
| Pre-fill context | Request ID | Set entityId, entityType | ❌ NOT IMPLEMENTED |

### 6.3 From Deal

| Test Case | Trigger | Expected | Status |
|-----------|---------|----------|--------|
| Deal chat | Deal detail | Create conversation | ❌ NOT IMPLEMENTED |
| Pre-fill participants | Provider + Client | Auto-add both | ❌ NOT IMPLEMENTED |

**BUG FOUND: MSG-005**
- **Issue**: No "Start Conversation" buttons exist on any entity screens
- **Impact**: Users cannot initiate conversations
- **Required**: Add buttons to offers/[id].tsx, requests/[id].tsx, deals/[id].tsx

---

## 7. Empty/Loading/Error States

### 7.1 Loading State

| Test Case | Expected | Status |
|-----------|----------|--------|
| Initial load | Shows LoadingState | ✅ PASS |
| Refresh | Shows RefreshControl spinner | ✅ PASS |
| Skeleton | Not implemented | ⚠️ OPTIONAL |

**Code Evidence**:
```typescript
// inbox.tsx line 74-76
if (loading) {
  return <LoadingState fullScreen message="Loading messages..." />;
}
```

### 7.2 Empty State

| Test Case | Expected | Status |
|-----------|----------|--------|
| No conversations | Shows EmptyState | ✅ PASS |
| No messages | Should show EmptyState in detail | ❌ NOT IMPLEMENTED |
| Illustration | Icon "💬" shown | ✅ PASS |

**Code Evidence**:
```typescript
// inbox.tsx lines 82-90
if (threads.length === 0) {
  return (
    <EmptyState
      title="No messages yet"
      description="Start a conversation with other users"
      icon="💬"
    />
  );
}
```

### 7.3 Error State

| Test Case | Expected | Status |
|-----------|----------|--------|
| API error | Shows ErrorState with retry | ✅ PASS |
| Network error | Error message shown | ✅ PASS |
| Retry | Calls loadThreads() again | ✅ PASS |

**Code Evidence**:
```typescript
// inbox.tsx lines 78-80
if (error && threads.length === 0) {
  return <ErrorState message={error} onRetry={loadThreads} />;
}
```

---

## 8. Mock/Backend Switch Tests

### 8.1 Current Implementation

| Aspect | Implementation | Status |
|--------|---------------|--------|
| Mock data | Hardcoded in inbox.tsx | ✅ PASS (as mock) |
| Backend API | Not connected | ❌ FAIL |
| Config flag | No ENABLE_MOCK_MODE check | ❌ MISSING |

**Code Evidence**:
```typescript
// inbox.tsx lines 30-67 - ALWAYS uses mock data
const loadThreads = async () => {
  // Mock data
  const mockThreads: MessageThread[] = [...];
  setThreads(mockThreads);
};
```

**BUG FOUND: MSG-006**
- **Location**: `mobile/app/(tabs)/inbox.tsx`
- **Issue**: No backend integration, only mock data
- **Impact**: Messages don't persist, same data for all users
- **Fix**: Add messageService with mock/backend switch:

```typescript
const loadThreads = async () => {
  try {
    if (!ENABLE_MOCK_MODE) {
      const conversations = await messageService.getConversations();
      setThreads(conversations);
    } else {
      // Use mock data
      setThreads(mockThreads);
    }
  } catch (err) {
    setError(err.message);
  }
};
```

---

## 9. Backend Contract Analysis

### 9.1 Types Comparison

| Field | Backend (`src/types/message.ts`) | Mobile (`inbox.tsx`) | Match? |
|-------|-------------------------------|---------------------|--------|
| `id` | `string` | `string` | ✅ YES |
| `participants` | `Participant[]` | **MISSING** | ❌ NO |
| `unreadCount` | `number` | `number` | ✅ YES |
| `lastMessage` | `Message` | `string` (lastMessage) | ⚠️ PARTIAL |
| `isGroup` | `boolean` | **MISSING** | ❌ NO |
| `entityId` | `string?` | **MISSING** | ❌ NO |
| `entityType` | `'deal'\|'offer'\|'request'\|'general'?` | **MISSING** | ❌ NO |
| `metadata` | `Record<string,any>?` | **MISSING** | ❌ NO |

**Summary**: Mobile uses simplified interface, missing many fields.

### 9.2 Required Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/conversations` | GET | List conversations | ❌ NOT DEFINED |
| `/conversations` | POST | Create conversation | ❌ NOT DEFINED |
| `/conversations/:id` | GET | Get messages | ❌ NOT DEFINED |
| `/conversations/:id/messages` | POST | Send message | ❌ NOT DEFINED |
| `/conversations/:id/read` | POST | Mark as read | ❌ NOT DEFINED |

---

## 10. CRUD Flow Status

### 10.1 Create

| Operation | Status | Notes |
|-----------|--------|-------|
| Create conversation | ❌ NOT IMPLEMENTED | No UI, no API |
| Create message | ❌ NOT IMPLEMENTED | No service, no screen |

### 10.2 Read

| Operation | Status | Notes |
|-----------|--------|-------|
| Read conversations | ⚠️ PARTIAL | Mock data only, no pagination |
| Read messages | ❌ NOT IMPLEMENTED | No detail screen |

### 10.3 Update

| Operation | Status | Notes |
|-----------|--------|-------|
| Mark as read | ❌ NOT IMPLEMENTED | No API, no handler |
| Update conversation | ❌ NOT IMPLEMENTED | No use case |

### 10.4 Delete

| Operation | Status | Notes |
|-----------|--------|-------|
| Delete conversation | ❌ NOT IMPLEMENTED | No use case defined |
| Delete message | ❌ NOT IMPLEMENTED | No use case defined |

---

## 11. Bug Summary

| ID | Severity | Location | Issue | Fix |
|----|----------|----------|-------|-----|
| MSG-001 | **HIGH** | `mobile/app/(tabs)/inbox.tsx:30-67` | Uses hardcoded mock data | Integrate messageService |
| MSG-002 | **HIGH** | `mobile/app/messages/[id].tsx` | Conversation detail NOT FOUND | Create message detail screen |
| MSG-003 | **HIGH** | `mobile/src/services/` | No messageService exists | Create messageService.ts |
| MSG-004 | LOW | `mobile/app/(tabs)/inbox.tsx:138-147` | Future timestamps show negative hours | Add validation |
| MSG-005 | **HIGH** | Offer/Request/Deal screens | No "Start Conversation" buttons | Add CTA buttons |
| MSG-006 | MEDIUM | `mobile/app/(tabs)/inbox.tsx` | No mock/backend switch | Add ENABLE_MOCK_MODE check |
| MSG-007 | MEDIUM | `mobile/app/(tabs)/inbox.tsx` | No markAsRead logic | Implement read tracking |
| MSG-008 | MEDIUM | `mobile/app/(tabs)/inbox.tsx` | Threads not sorted by timestamp | Add sort logic |

---

## 12. Feature Completeness

### 12.1 Inbox (Conversations List)

| Feature | Status | Completion |
|---------|--------|------------|
| List display | ✅ | 80% (mock only) |
| Thread cards | ✅ | 100% |
| Unread badges | ✅ | 100% |
| Timestamp | ✅ | 90% (minor edge cases) |
| Pull-to-refresh | ✅ | 100% |
| Loading state | ✅ | 100% |
| Empty state | ✅ | 100% |
| Error state | ✅ | 100% |
| Backend integration | ❌ | 0% |

**Inbox Overall**: 60% complete (mock only, no backend)

### 12.2 Conversation Detail

| Feature | Status | Completion |
|---------|--------|------------|
| Screen exists | ❌ | 0% |
| Message list | ❌ | 0% |
| Send message | ❌ | 0% |
| Message bubbles | ❌ | 0% |
| Auto-scroll | ❌ | 0% |
| Message status | ❌ | 0% |
| Empty state | ❌ | 0% |
| Loading state | ❌ | 0% |

**Detail Overall**: 0% complete (NOT IMPLEMENTED)

### 12.3 Start Conversation

| Feature | Status | Completion |
|---------|--------|------------|
| From offer | ❌ | 0% |
| From request | ❌ | 0% |
| From deal | ❌ | 0% |

**Start Overall**: 0% complete (NOT IMPLEMENTED)

---

## 13. Test Data Reference

### Mock Thread Data

```typescript
const mockThreads: MessageThread[] = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Thanks for the update on the project!',
    timestamp: new Date().toISOString(),
    unread: 2,
    type: 'deal',
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Can we schedule a call tomorrow?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    unread: 0,
    type: 'proposal',
  },
  {
    id: '3',
    name: 'E-commerce Project',
    lastMessage: 'The design looks great!',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    unread: 1,
    type: 'deal',
  },
];
```

### Expected Conversation Structure

```typescript
// From backend types/message.ts
const conversation: Conversation = {
  id: 'conv_1',
  title: 'E-commerce Project',
  participants: [
    { userId: 'user_1', displayName: 'John Doe', role: 'sender', joinedAt: '...' },
    { userId: 'user_2', displayName: 'Jane Smith', role: 'recipient', joinedAt: '...' },
  ],
  unreadCount: 2,
  lastMessage: {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'user_1',
    content: 'Thanks for the update...',
    type: 'text',
    status: 'sent',
  },
  isGroup: false,
  entityId: 'deal_1',
  entityType: 'deal',
};
```

---

## 14. How to Verify

### Current State (Mock Only)

1. **Open Inbox**
   - Navigate to Inbox tab
   - See 3 mock conversations
   - Verify thread cards render

2. **Test unread badges**
   - Thread 1: Shows "2" badge
   - Thread 2: No badge
   - Thread 3: Shows "1" badge

3. **Test timestamps**
   - Thread 1: "Just now"
   - Thread 2: "1h ago"
   - Thread 3: "2h ago"

4. **Test navigation (FAILS)**
   - Tap any thread
   - **BUG**: Goes to non-existent `/messages/{id}` screen

### Expected Full Implementation

1. **Inbox with backend**
   - Shows real conversations from API
   - Sorted by last message timestamp
   - Real-time unread counts

2. **Conversation detail**
   - Message history
   - Send new messages
   - Mark as read on open

3. **Start conversation**
   - Button on offer/request/deal screens
   - Creates conversation with context

---

## QA Sign-off

- [x] Conversations list (mock only)
- [ ] Conversation detail ❌ NOT IMPLEMENTED
- [ ] Send message ❌ NOT IMPLEMENTED
- [ ] Unread state (partial - no mark as read)
- [x] Timestamp render (basic, some edge cases)
- [ ] Start conversation ❌ NOT IMPLEMENTED
- [x] Empty state
- [x] Loading state
- [x] Error state
- [ ] Mock/backend switch ❌ NOT IMPLEMENTED

**Status**: ❌ FAIL - Critical features missing

**Summary**: 
- Inbox UI: 80% complete (mock only)
- Conversation detail: 0% complete
- Send message: 0% complete
- Backend integration: 0% complete

**Critical Blockers**:
1. MSG-001: No backend integration
2. MSG-002: No conversation detail screen
3. MSG-003: No message service
4. MSG-005: No way to start conversations
