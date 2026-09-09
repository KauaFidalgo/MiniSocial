import { Platform } from 'react-native';

/**
 * Configuração centralizada da API
 * Suporta Web, iOS e Android com URLs diferentes
 */

const API_PORT = 3001;

// IP local da máquina (substitua se necessário)
const LOCAL_IP = '172.16.1.154';

// URLs de API para diferentes plataformas
const API_URLS = {
  // Web (localhost)
  web: `http://localhost:${API_PORT}`,

  // iOS (emulador e físico)
  ios: `http://${LOCAL_IP}:${API_PORT}`,

  // Android emulador
  android_emulator: `http://10.0.2.2:${API_PORT}`,

  // Android físico
  android_device: `http://${LOCAL_IP}:${API_PORT}`,
};

/**
 * Obtém a URL base da API baseada na plataforma
 */
export function getAPIBaseURL() {
  if (Platform.OS === 'web') {
    return API_URLS.web;
  }

  if (Platform.OS === 'ios') {
    return API_URLS.ios;
  }

  if (Platform.OS === 'android') {
    // Tenta detectar se é emulador ou device físico
    // Emuladores geralmente têm "emulator" ou "Android SDK" no modelo
    const isEmulator = __DEV__; // Simplificado: em dev, assume device real
    return isEmulator ? API_URLS.android_device : API_URLS.android_device;
  }

  // Fallback
  return API_URLS.web;
}

/**
 * Valida se uma URL é válida antes de fazer fetch
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    console.warn(`[API Config] URL inválida: ${url}`);
    return false;
  }
}

export const API_CONFIG = {
  baseURL: getAPIBaseURL(),
  timeout: 10000,
  retries: 3,
};

export default API_CONFIG;
