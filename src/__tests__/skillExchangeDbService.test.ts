import { describe, it, expect } from 'vitest';
import { skillExchangeDbService } from '../services/skillExchangeDbService';

describe('SkillExchangeDbService MVP (DB path wrapper)', () => {
  it('should create a thread and perform a simple lifecycle through Prisma persistence', async () => {
    const t = await skillExchangeDbService.createThread('db_user', 'DB Thread');
    expect(t?.id).toBeTruthy();
    // add a message
    const m = await skillExchangeDbService.postMessage(t.id, 'db_user', 'Hello via DB path');
    expect(m?.id).toBeTruthy();
    // create a proposal
    const p = await skillExchangeDbService.propose(t.id, 'mentor_db', 'db-plan', 50, 5);
    expect(p?.id).toBeTruthy();
    // accept proposal
    const a = await skillExchangeDbService.acceptProposal(t.id, p.id);
    expect(a?.id).toBe(p.id);
    // close thread
    await skillExchangeDbService.closeThread(t.id);
    const th = await skillExchangeDbService.getThread(t.id);
    expect(th?.status).toBe('closed');
  });
});
