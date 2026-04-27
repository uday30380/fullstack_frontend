// Central API configuration for production and development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log the active API endpoint for diagnostics (Visible in Browser Console F12)
if (import.meta.env.PROD) {
    console.log("🚀 Production Nexus Connectivity: ", API_BASE_URL ? "Absolute" : "Proxy/Local");
}

// Add a helper to ensure URLs are correctly formed
export const getApiUrl = (path) => {
    // If path starts with http, it's already an absolute URL
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // In development with Vite proxy, API_BASE_URL is empty, so it uses the proxy
    // In production, API_BASE_URL will be the Railway backend URL
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${normalizedPath}`;
};
