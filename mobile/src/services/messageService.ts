import apiClient from './apiClient';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
  }[];
  title?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationInput {
  participantIds: string[];
  title?: string;
  initialMessage?: string;
}

export interface SendMessageInput {
  content: string;
  attachments?: string[];
}

const USE_MOCK_FALLBACK = true;

// Mock data generators
function generateMockConversations(count: number = 5): Conversation[] {
  const conversations: Conversation[] = [];
  
  for (let i = 0; i < count; i++) {
    const now = new Date().toISOString();
    const lastMessage: Message = {
      id: `msg-${i}`,
      conversationId: `conv-${i}`,
      senderId: `user-${i % 2}`,
      senderName: i % 2 === 0 ? 'Alice Smith' : 'Bob Johnson',
      content: ['Hey, are you available?', 'Thanks for the update!', 'Can we discuss the project?', 'Looking forward to working with you', 'Payment sent successfully'][i % 5],
      createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
    };
    
    conversations.push({
      id: `conv-${i}`,
      participantIds: ['user-me', `user-${i}`],
      participants: [
        {
          id: `user-${i}`,
          displayName: ['Alice Smith', 'Bob Johnson', 'Carol Williams', 'David Brown', 'Emma Davis'][i % 5],
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
          trustScore: 70 + Math.floor(Math.random() * 30),
        },
      ],
      title: ['Project Discussion', 'Deal Inquiry', 'Payment Question', 'Service Request', 'Follow-up'][i % 5],
      lastMessage,
      unreadCount: i % 3 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      updatedAt: lastMessage.createdAt,
    });
  }
  
  return conversations;
}

function generateMockMessages(conversationId: string, count: number = 10): Message[] {
  const messages: Message[] = [];
  const contents = [
    'Hi there! I\'m interested in your services.',
    'Thanks for reaching out! I\'d be happy to help.',
    'Can you tell me more about your experience?',
    'I have 5+ years of experience in this field.',
    'What\'s your availability like?',
    'I\'m available to start next week.',
    'Great! Let\'s discuss the details.',
    'Perfect. I\'ll send over the requirements.',
    'Received. I\'ll review and get back to you.',
    'Sounds good, looking forward to working together!',
  ];
  
  for (let i = 0; i < count; i++) {
    const isMe = i % 2 === 0;
    messages.push({
      id: `msg-${conversationId}-${i}`,
      conversationId,
      senderId: isMe ? 'user-me' : `user-${i}`,
      senderName: isMe ? 'Me' : 'Alice Smith',
      senderAvatar: isMe ? undefined : 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      content: contents[i % contents.length],
      readAt: i < count - 2 ? new Date(Date.now() - ((count - i) * 3600000)).toISOString() : undefined,
      createdAt: new Date(Date.now() - ((count - i) * 3600000)).toISOString(),
    });
  }
  
  return messages;
}

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiClient.get('/conversations');
      return response.data?.data || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('messageService.getConversations failed, using mock fallback');
        return generateMockConversations();
      }
      throw error;
    }
  },

  async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await apiClient.get(`/conversations/${id}`);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`messageService.getConversation(${id}) failed, using mock fallback`);
        const conversations = generateMockConversations(1);
        return { ...conversations[0], id };
      }
      throw error;
    }
  },

  async createConversation(data: CreateConversationInput): Promise<Conversation> {
    try {
      const response = await apiClient.post('/conversations', data);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('messageService.createConversation failed, using mock fallback');
        const now = new Date().toISOString();
        return {
          id: `conv-${Date.now()}`,
          participantIds: data.participantIds,
          participants: data.participantIds.map((id, i) => ({
            id,
            displayName: `User ${i + 1}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
            trustScore: 80,
          })),
          title: data.title,
          lastMessage: data.initialMessage ? {
            id: `msg-${Date.now()}`,
            conversationId: `conv-${Date.now()}`,
            senderId: 'user-me',
            senderName: 'Me',
            content: data.initialMessage,
            createdAt: now,
          } : undefined,
          unreadCount: 0,
          createdAt: now,
          updatedAt: now,
        };
      }
      throw error;
    }
  },

  async getMessages(conversationId: string, page?: number, limit?: number): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const query = params.toString();
      const response = await apiClient.get(`/conversations/${conversationId}/messages${query ? `?${query}` : ''}`);
      return response.data?.data || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`messageService.getMessages(${conversationId}) failed, using mock fallback`);
        return generateMockMessages(conversationId, limit || 10);
      }
      throw error;
    }
  },

  async sendMessage(conversationId: string, data: SendMessageInput): Promise<Message> {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`messageService.sendMessage(${conversationId}) failed, using mock fallback`);
        return {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId: 'user-me',
          senderName: 'Me',
          content: data.content,
          attachments: data.attachments,
          createdAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  async markAsRead(conversationId: string): Promise<void> {
    try {
      await apiClient.post(`/conversations/${conversationId}/read`);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`messageService.markAsRead(${conversationId}) failed, using mock fallback`);
        return;
      }
      throw error;
    }
  },

  async deleteConversation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/conversations/${id}`);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`messageService.deleteConversation(${id}) failed, using mock fallback`);
        return;
      }
      throw error;
    }
  },
};

export default messageService;
