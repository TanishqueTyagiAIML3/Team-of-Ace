export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
