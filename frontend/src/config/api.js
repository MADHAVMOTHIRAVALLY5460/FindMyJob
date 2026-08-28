/**
 * Base API URL configuration
 * Defaults to relative root so both Vite dev proxy and Vercel serverless functions work seamlessly.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default {
  API_BASE_URL,
};
