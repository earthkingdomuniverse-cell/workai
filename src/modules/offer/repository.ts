import { Offer, OfferInput, OfferFilter } from './types';
import { mockOffers } from '../../mocks/offers';

export interface OfferRepository {
  findAll(filters?: OfferFilter): Promise<Offer[]>;
  findById(id: string): Promise<Offer | null>;
  findByProviderId(providerId: string): Promise<Offer[]>;
  create(data: OfferInput & { providerId: string }): Promise<Offer>;
  update(id: string, data: Partial<OfferInput>): Promise<Offer>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  incrementLikes(id: string): Promise<void>;
  incrementProposals(id: string): Promise<void>;
}

class InMemoryOfferRepository implements OfferRepository {
  private offers: Offer[] = [...mockOffers];

  async findAll(filters?: OfferFilter): Promise<Offer[]> {
    let result = [...this.offers];

    if (filters) {
      const {
        query,
        category,
        minPrice,
        maxPrice,
        pricingType,
        skills,
        status,
        providerId,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      if (query) {
        const queryLower = query.toLowerCase();
        result = result.filter(
          (o) =>
            o.title.toLowerCase().includes(queryLower) ||
            o.description.toLowerCase().includes(queryLower),
        );
      }

      if (category) {
        result = result.filter((o) => o.category === category);
      }

      if (minPrice !== undefined) {
        result = result.filter((o) => o.price >= minPrice);
      }

      if (maxPrice !== undefined) {
        result = result.filter((o) => o.price <= maxPrice);
      }

      if (pricingType) {
        result = result.filter((o) => o.pricingType === pricingType);
      }

      if (skills && skills.length > 0) {
        result = result.filter((o) => o.skills?.some((skill) => skills.includes(skill)));
      }

      if (status) {
        result = result.filter((o) => o.status === status);
      }

      if (providerId) {
        result = result.filter((o) => o.providerId === providerId);
      }

      // Sort
      const sorted = [...result].sort((a, b) => {
        let compare = 0;
        switch (sortBy) {
          case 'price':
            compare = a.price - b.price;
            break;
          case 'popularity':
            compare = (b.views || 0) - (a.views || 0);
            break;
          case 'createdAt':
          default:
            compare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });

      result = sorted;
    }

    return result;
  }

  async findById(id: string): Promise<Offer | null> {
    return this.offers.find((o) => o.id === id) || null;
  }

  async findByProviderId(providerId: string): Promise<Offer[]> {
    return this.offers.filter((o) => o.providerId === providerId);
  }

  async create(data: OfferInput & { providerId: string }): Promise<Offer> {
    const offer: Offer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      providerId: data.providerId,
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
      currency: data.currency || 'USD',
      pricingType: data.pricingType || 'fixed',
      status: 'active',
      skills: data.skills,
      deliveryDays: data.deliveryDays,
      revisions: data.revisions,
      images: data.images,
      views: 0,
      likes: 0,
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.offers.push(offer);
    return offer;
  }

  async update(id: string, data: Partial<OfferInput>): Promise<Offer> {
    const index = this.offers.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Offer ${id} not found`);
    }

    const updated: Offer = {
      ...this.offers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.offers[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.offers.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Offer ${id} not found`);
    }
    this.offers.splice(index, 1);
  }

  async incrementViews(id: string): Promise<void> {
    const offer = await this.findById(id);
    if (offer) {
      offer.views = (offer.views || 0) + 1;
    }
  }

  async incrementLikes(id: string): Promise<void> {
    const offer = await this.findById(id);
    if (offer) {
      offer.likes = (offer.likes || 0) + 1;
    }
  }

  async incrementProposals(id: string): Promise<void> {
    const offer = await this.findById(id);
    if (offer) {
      offer.proposalsCount = (offer.proposalsCount || 0) + 1;
    }
  }
}

export const offerRepository: OfferRepository = new InMemoryOfferRepository();
