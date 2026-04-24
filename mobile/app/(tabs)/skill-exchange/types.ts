export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Thread {
  id: string;
  topic: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  proposals?: any[];
}
