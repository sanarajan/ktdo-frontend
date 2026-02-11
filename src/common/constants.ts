// Cast import.meta to ensure env is typed even if editor tooling misses vite/client ambient types
const env = (import.meta as ImportMeta & { env: ImportMetaEnv }).env;
export const API_BASE_URL = env.VITE_API_URL || 'https://ktdo.duckdns.org/api/';

