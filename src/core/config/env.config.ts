export const ENV = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
    API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
};
