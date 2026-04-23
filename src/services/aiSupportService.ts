import { SUPPORT_CATEGORIES, SupportTicketInput, SupportTicketOutput } from '../types/support';

export interface AiSupportService {
  classifyAndRespond(input: SupportTicketInput): Promise<SupportTicketOutput>;
}

class AiSupportServiceImpl implements AiSupportService {
  async classifyAndRespond(input: SupportTicketInput): Promise<SupportTicketOutput> {
    const message = input.message.toLowerCase();
    const category =
      SUPPORT_CATEGORIES.find((item) =>
        item.keywords.some((keyword) => message.includes(keyword)),
      ) || SUPPORT_CATEGORIES.find((item) => item.id === 'general')!;

    const escalationRequired =
      category.priority === 'high' ||
      message.includes('urgent') ||
      message.includes('fraud') ||
      message.includes('chargeback');

    return {
      category: category.id,
      priority: escalationRequired ? 'urgent' : category.priority,
      answer: category.answer,
      confidence: category.id === 'general' ? 60 : 85,
      escalationRequired,
    };
  }
}

export const aiSupportService: AiSupportService = new AiSupportServiceImpl();
