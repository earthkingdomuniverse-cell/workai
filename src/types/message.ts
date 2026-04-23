import { Timestamps } from './common';

export interface Conversation extends Timestamps {
  id: string;
  title?: string;
  participants: Participant[];
  unreadCount: number;
  lastMessage?: Message;
  isGroup: boolean;
  entityId?: string; // Associated entity (deal, offer, request)
  entityType?: 'deal' | 'offer' | 'request' | 'general';
  metadata?: Record<string, any>;
}

export interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  lastReadMessageId?: string;
  role: 'sender' | 'recipient';
  joinedAt: string;
}

export interface Message extends Timestamps {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'system' | 'file' | 'image';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface MessageInput {
  conversationId: string;
  content: string;
  type?: 'text' | 'file' | 'image';
  attachments?: Attachment[];
}

export interface ConversationInput {
  participantIds: string[];
  title?: string;
  entityId?: string;
  entityType?: 'deal' | 'offer' | 'request' | 'general';
}

export interface ConversationFilter {
  userId?: string;
  entityId?: string;
  entityType?: string;
  unreadOnly?: boolean;
  sortBy?: 'createdAt' | 'lastMessage';
  sortOrder?: 'asc' | 'desc';
}

export interface MessageFilter {
  conversationId: string;
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
}
