export default {
  id: 'oss.sample',
  name: 'Open Source Sample Plugin',
  version: '0.1.0',
  init: async () => {
    // Demo initialization hook
    console.log('[OSS] Sample plugin initialized');
  },
} as const;
