import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_DATA_KEY = '@user_data';

export const storage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async setUserData(userData: any): Promise<void> {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  async getUserData(): Promise<any> {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
