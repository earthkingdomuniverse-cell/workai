import { Offer } from '../../types/offer';
import { Request as RequestType } from '../../types/request';
import { mockOffers } from '../../mocks/offers';
import { mockRequests } from '../../mocks/requests';

export interface ExploreFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  skills?: string[];
  type?: 'offers' | 'requests' | 'all';
  sortBy?: 'relevance' | 'newest' | 'price' | 'popularity';
  page?: number;
  limit?: number;
}

export interface ExploreData {
  offers: Offer[];
  requests: RequestType[];
  categories: Category[];
  popularSkills: string[];
  stats: {
    totalOffers: number;
    totalRequests: number;
    activeUsers: number;
  };
  filters: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
    skills: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export async function getExploreData(filters: ExploreFilters): Promise<ExploreData> {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    skills,
    type = 'all',
    sortBy = 'relevance',
    page = 1,
    limit = 20,
  } = filters;

  let filteredOffers = [...mockOffers];
  let filteredRequests = [...mockRequests];

  // Apply filters
  if (query) {
    const queryLower = query.toLowerCase();
    filteredOffers = filteredOffers.filter(
      (o) =>
        o.title.toLowerCase().includes(queryLower) ||
        o.description.toLowerCase().includes(queryLower),
    );
    filteredRequests = filteredRequests.filter(
      (r) =>
        r.title.toLowerCase().includes(queryLower) ||
        r.description.toLowerCase().includes(queryLower),
    );
  }

  if (category) {
    filteredOffers = filteredOffers.filter((o) => o.category === category);
    filteredRequests = filteredRequests.filter((r) => r.category === category);
  }

  if (minPrice !== undefined) {
    filteredOffers = filteredOffers.filter((o) => o.price >= minPrice);
    filteredRequests = filteredRequests.filter((r) => r.budget?.min >= minPrice);
  }

  if (maxPrice !== undefined) {
    filteredOffers = filteredOffers.filter((o) => o.price <= maxPrice);
    filteredRequests = filteredRequests.filter((r) => r.budget?.max <= maxPrice);
  }

  if (skills && skills.length > 0) {
    filteredOffers = filteredOffers.filter((o) =>
      o.skills?.some((skill) => skills.includes(skill)),
    );
    filteredRequests = filteredRequests.filter((r) =>
      r.skills?.some((skill) => skills.includes(skill)),
    );
  }

  // Sort
  const sortFns = {
    relevance: () => 0,
    newest: (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    price: (a: any, b: any) => a.price - b.price,
    popularity: (a: any, b: any) => (b.views || 0) - (a.views || 0),
  };

  if (sortBy !== 'relevance') {
    filteredOffers.sort(sortFns[sortBy] as any);
    filteredRequests.sort(sortFns[sortBy] as any);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const paginatedOffers = filteredOffers.slice(startIndex, startIndex + limit);
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + limit);

  const categories: Category[] = [
    { id: 'cat_1', name: 'Software Development', icon: '💻', count: 45 },
    { id: 'cat_2', name: 'Design', icon: '🎨', count: 32 },
    { id: 'cat_3', name: 'Data Science', icon: '📊', count: 28 },
    { id: 'cat_4', name: 'Marketing', icon: '📈', count: 21 },
    { id: 'cat_5', name: 'Writing', icon: '✍️', count: 18 },
  ];

  const popularSkills = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'UI/UX',
    'Data Analysis',
    'Machine Learning',
    'Mobile Development',
  ];

  return {
    offers: type === 'requests' ? [] : paginatedOffers,
    requests: type === 'offers' ? [] : paginatedRequests,
    categories,
    popularSkills,
    stats: {
      totalOffers: mockOffers.length,
      totalRequests: mockRequests.length,
      activeUsers: 1250,
    },
    filters: {
      categories: ['Software Development', 'Design', 'Data Science', 'Marketing', 'Writing'],
      priceRange: {
        min: 0,
        max: 50000,
      },
      skills: popularSkills,
    },
  };
}
