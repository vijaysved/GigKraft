// Token persistence in expo-secure-store (encrypted at rest on device).
// SecureStore is unavailable on web; fall back to in-memory storage there
// so `expo start --web` still works for previews.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'gk.access';
const REFRESH_KEY = 'gk.refresh';

const memory = new Map<string, string>();
const useMemoryStore = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (useMemoryStore) return memory.get(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (useMemoryStore) {
    memory.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (useMemoryStore) {
    memory.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export interface StoredTokens {
  access: string | null;
  refresh: string | null;
}

export async function loadTokens(): Promise<StoredTokens> {
  const [access, refresh] = await Promise.all([
    getItem(ACCESS_KEY),
    getItem(REFRESH_KEY),
  ]);
  return { access, refresh };
}

export async function saveTokens(access: string, refresh?: string): Promise<void> {
  await setItem(ACCESS_KEY, access);
  if (refresh !== undefined) {
    await setItem(REFRESH_KEY, refresh);
  }
}

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
}
