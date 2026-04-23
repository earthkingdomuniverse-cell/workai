import { offerRepository } from './repository';
import { Offer, OfferInput, OfferFilter } from './types';
import { AppError } from '../../lib/errors';
import { mockOffers } from '../../mocks/offers';

export async function getOffers(filters?: OfferFilter): Promise<Offer[]> {
  return offerRepository.findAll(filters);
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const offer = await offerRepository.findById(id);
  if (!offer) {
    throw new AppError('Offer not found', { code: 'NOT_FOUND_ERROR', statusCode: 404 });
  }
  return offer;
}

export async function getOffersByProviderId(providerId: string): Promise<Offer[]> {
  return offerRepository.findByProviderId(providerId);
}

export async function createOffer(providerId: string, data: OfferInput): Promise<Offer> {
  // Validate
  if (!data.title.trim()) {
    throw new AppError('Title is required', { code: 'VALIDATION_ERROR' });
  }
  if (!data.description.trim()) {
    throw new AppError('Description is required', { code: 'VALIDATION_ERROR' });
  }
  if (data.price <= 0) {
    throw new AppError('Price must be positive', { code: 'VALIDATION_ERROR' });
  }

  return offerRepository.create({ ...data, providerId });
}

export async function updateOffer(
  id: string,
  userId: string,
  data: Partial<OfferInput>,
): Promise<Offer> {
  const offer = await getOfferById(id);

  if (offer?.providerId !== userId) {
    throw new AppError('Not authorized to update this offer', {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    });
  }

  return offerRepository.update(id, data);
}

export async function deleteOffer(id: string, userId: string): Promise<void> {
  const offer = await getOfferById(id);

  if (offer?.providerId !== userId) {
    throw new AppError('Not authorized to delete this offer', {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    });
  }

  await offerRepository.delete(id);
}

export async function updateOfferStatus(
  id: string,
  userId: string,
  status: 'active' | 'inactive' | 'archived' | 'completed',
): Promise<Offer> {
  const offer = await getOfferById(id);

  if (offer?.providerId !== userId) {
    throw new AppError('Not authorized to update this offer', {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
    });
  }

  return offerRepository.update(id, { status } as any);
}

export async function incrementOfferViews(id: string): Promise<void> {
  await offerRepository.incrementViews(id);
}

export async function incrementOfferLikes(id: string): Promise<void> {
  await offerRepository.incrementLikes(id);
}

export async function incrementOfferProposals(id: string): Promise<void> {
  await offerRepository.incrementProposals(id);
}

export async function getOfferStats(providerId?: string): Promise<{
  total: number;
  active: number;
  inactive: number;
  archived: number;
  completed: number;
  totalViews: number;
  totalLikes: number;
  totalProposals: number;
  averagePrice: number;
}> {
  const offers = providerId ? await getOffersByProviderId(providerId) : mockOffers;

  return {
    total: offers.length,
    active: offers.filter((o) => o.status === 'active').length,
    inactive: offers.filter((o) => o.status === 'inactive').length,
    archived: offers.filter((o) => o.status === 'archived').length,
    completed: offers.filter((o) => o.status === 'completed').length,
    totalViews: offers.reduce((sum, o) => sum + (o.views || 0), 0),
    totalLikes: offers.reduce((sum, o) => sum + (o.likes || 0), 0),
    totalProposals: offers.reduce((sum, o) => sum + (o.proposalsCount || 0), 0),
    averagePrice:
      offers.length > 0 ? offers.reduce((sum, o) => sum + o.price, 0) / offers.length : 0,
  };
}
