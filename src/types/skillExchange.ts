export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Proposal {
  id: string;
  threadId: string;
  mentorId: string;
  plan: string;
  price?: number;
  durationDays?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  topic: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  proposals?: Proposal[];
}
