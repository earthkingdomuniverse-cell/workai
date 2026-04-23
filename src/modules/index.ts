export const modules = {
  auth: 'auth',
  onboarding: 'onboarding',
  profile: 'profile',
  offers: 'offers',
  requests: 'requests',
  proposals: 'proposals',
  deals: 'deals',
  payments: 'payments',
  receipts: 'receipts',
  reviews: 'reviews',
  trust: 'trust',
  risk: 'risk',
  fraud: 'fraud',
  ai: 'ai',
  messages: 'messages',
  notifications: 'notifications',
  activity: 'activity',
  operator: 'operator',
  admin: 'admin',
};

export type ModuleName = keyof typeof modules;
