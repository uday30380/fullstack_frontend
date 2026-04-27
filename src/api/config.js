// Central API configuration for production and development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Add a helper to ensure URLs are correctly formed
export const getApiUrl = (path) => {
    // If path starts with http, it's already an absolute URL
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // In development with Vite proxy, API_BASE_URL is empty, so it uses the proxy
    // In production, API_BASE_URL will be the Railway backend URL
    return `${API_BASE_URL}${normalizedPath}`;
};
