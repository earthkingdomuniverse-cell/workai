import { AiAgent } from '../types/aiAgent';

class AiAgentService {
  private agents: Map<string, AiAgent> = new Map();

  registerAgent(id: string, name: string): AiAgent {
    const now = new Date().toISOString();
    if (this.agents.has(id)) {
      const a = this.agents.get(id)!;
      a.updatedAt = now;
      return a;
    }
    const a: AiAgent = { id, name, wallet: 0, createdAt: now, updatedAt: now };
    this.agents.set(id, a);
    return a;
  }

  getAgent(id: string): AiAgent | undefined {
    return this.agents.get(id);
  }

  getAgents(): AiAgent[] {
    return Array.from(this.agents.values());
  }

  addCredits(id: string, amount: number) {
    const a = this.agents.get(id);
    if (!a) throw new Error('Agent not found');
    a.wallet += amount;
    a.updatedAt = new Date().toISOString();
  }

  consumeCredits(id: string, amount: number) {
    const a = this.agents.get(id);
    if (!a) throw new Error('Agent not found');
    if (a.wallet < amount) throw new Error('Insufficient credits');
    a.wallet -= amount;
    a.updatedAt = new Date().toISOString();
  }

  getBalance(id: string): number {
    const a = this.agents.get(id);
    return a?.wallet ?? 0;
  }
}

export const aiAgentService = new AiAgentService();
export default aiAgentService;
