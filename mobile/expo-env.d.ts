/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_ENABLE_MOCK_MODE?: string;
    EXPO_PUBLIC_ENABLE_ADMIN_TAB?: string;
    EXPO_PUBLIC_APP_NAME?: string;
  }
}
