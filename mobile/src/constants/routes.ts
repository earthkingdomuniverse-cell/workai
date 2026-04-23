export const ROUTES = {
  // Auth
  LOGIN: '/(auth)/login',
  SIGNUP: '/(auth)/signup',
  FORGOT_PASSWORD: '/(auth)/forgot-password',

  // Onboarding
  ONBOARDING: '/(onboarding)',
  ONBOARDING_INTRO: '/(onboarding)/intro',
  ONBOARDING_ROLE_SELECT: '/(onboarding)/role-select',
  ONBOARDING_PROFILE_SETUP: '/(onboarding)/profile-setup',
  ONBOARDING_SKILLS_SETUP: '/(onboarding)/skills-setup',
  ONBOARDING_GOALS_SETUP: '/(onboarding)/goals-setup',

  // Main Tabs
  HOME: '/(tabs)/home',
  EXPLORE: '/(tabs)/explore',
  OFFERS: '/(tabs)/offers',
  REQUESTS: '/(tabs)/requests',
  DEALS: '/(tabs)/deals',
  AI: '/(tabs)/ai',
  INBOX: '/(tabs)/inbox',
  ACTIVITY: '/(tabs)/activity',
  PROFILE: '/(tabs)/profile',
  ADMIN: '/(tabs)/admin',

  // Offers
  OFFERS_CREATE: '/offers/create',
  OFFERS_EDIT: '/offers/edit',
  OFFERS_DETAIL: (id: string) => `/offers/${id}`,
  OFFERS_MANAGE: '/offers/manage',

  // Requests
  REQUESTS_CREATE: '/requests/create',
  REQUESTS_EDIT: '/requests/edit',
  REQUESTS_DETAIL: (id: string) => `/requests/${id}`,
  REQUESTS_MANAGE: '/requests/manage',

  // Deals
  DEALS_DETAIL: (id: string) => `/deals/${id}`,
  DEALS_CREATE: '/deals/create',
  DEALS_TIMELINE: (id: string) => `/deals/timeline?dealId=${id}`,
  DEALS_PAYMENT: (id: string) => `/deals/payment?dealId=${id}`,
  DEALS_DISPUTE: (id: string) => `/deals/dispute?id=${id}`,
  DEALS_RECEIPTS: (id: string) => `/deals/receipts?dealId=${id}`,

  // AI
  AI_MATCH: '/ai/match',
  AI_PRICE: '/ai/price',
  AI_SUPPORT: '/ai/support',
  AI_NEXT_ACTION: '/ai/next-action',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_PRIVACY: '/settings/privacy',

  // Admin
  ADMIN_OVERVIEW: '/admin/overview',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_RISK: '/admin/risk',
  ADMIN_FRAUD: '/admin/fraud',
  ADMIN_REVIEWS: '/admin/reviews',
} as const;

export type RouteKey = keyof typeof ROUTES;
