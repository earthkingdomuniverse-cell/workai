import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { aiService } from '../services/aiService';
import { aiSupportService } from '../services/aiSupportService';

function buildNextActions(input: any) {
  const context = input?.context || input || {};
  const role = context.role || 'member';
  const hasOffer = Boolean(context.hasOffer || context.offersCount > 0);
  const hasRequest = Boolean(context.hasRequest || context.requestsCount > 0);
  const hasProposal = Boolean(context.hasProposal || context.proposalsCount > 0);
  const hasDeal = Boolean(context.hasDeal || context.dealsCount > 0);
  const onboardingCompleted = Boolean(context.onboardingCompleted);

  const actions = [];

  if (!onboardingCompleted) {
    actions.push({
      id: 'complete_onboarding',
      type: 'onboarding',
      title: 'Complete your WorkAI setup',
      description: 'Finish your profile, skills, and goals so matching can improve.',
      priority: 'high',
      route: '/(onboarding)/intro',
    });
  }

  if (!hasOffer && (role === 'member' || role === 'provider')) {
    actions.push({
      id: 'create_first_offer',
      type: 'offer',
      title: 'Create your first offer',
      description: 'Turn one of your skills into a clear service people can buy or request.',
      priority: 'high',
      route: '/offers/create',
    });
  }

  if (!hasRequest) {
    actions.push({
      id: 'create_first_request',
      type: 'request',
      title: 'Post a request',
      description: 'Describe what you need and let WorkAI help match useful providers.',
      priority: hasOffer ? 'medium' : 'high',
      route: '/requests/create',
    });
  }

  if (!hasProposal && (hasOffer || hasRequest)) {
    actions.push({
      id: 'send_or_review_proposal',
      type: 'proposal',
      title: 'Move toward a proposal',
      description: 'Review matching offers/requests and start the first transaction conversation.',
      priority: 'medium',
      route: '/(tabs)/proposals',
    });
  }

  if (hasDeal) {
    actions.push({
      id: 'check_deal_progress',
      type: 'deal',
      title: 'Check deal progress',
      description: 'Review active deals and complete the next funding, submit, release, or review step.',
      priority: 'high',
      route: '/(tabs)/deals',
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: 'explore_marketplace',
      type: 'explore',
      title: 'Explore marketplace matches',
      description: 'Browse offers and requests to find your next useful exchange.',
      priority: 'medium',
      route: '/(tabs)/explore',
    });
  }

  return {
    actions: actions.slice(0, 5),
    summary: 'Next actions generated from current WorkAI context.',
  };
}

const ai: FastifyPluginAsync = async (fastify) => {
  fastify.post('/ai/match', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = await aiService.match(body as any);
      return successResponse(reply, result, { message: 'AI match completed successfully' });
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'AI_MATCH_ERROR',
          message: 'Failed to perform AI match',
        },
      });
    }
  });

  fastify.post('/ai/price', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = await aiService.suggestPrice(body);
      return successResponse(reply, result, { message: 'Price suggestion completed successfully' });
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'AI_PRICE_ERROR',
          message: 'Failed to generate price suggestion',
        },
      });
    }
  });

  fastify.post('/ai/support', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = await aiSupportService.classifyAndRespond(body);
      return successResponse(reply, result, { message: 'Support classification completed successfully' });
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'AI_SUPPORT_ERROR',
          message: 'Failed to process support request',
        },
      });
    }
  });

  fastify.post('/ai/next-action', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = buildNextActions(body);
      return successResponse(reply, result, { message: 'Next actions generated successfully' });
    } catch (_error) {
      return reply.status(500).send({
        error: {
          code: 'AI_NEXT_ACTION_ERROR',
          message: 'Failed to generate next actions',
        },
      });
    }
  });
};

export default ai;
