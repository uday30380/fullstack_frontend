// App API Utility for backend communication

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('edu_user') || '{}');
    } catch {
        return {};
    }
};

export const getAuthHeaders = (headers = {}) => {
    const user = getStoredUser();
    return user.token
        ? { ...headers, Authorization: `Bearer ${user.token}` }
        : headers;
};

export const authFetch = async (url, options = {}) => {
    // Prevent calls to "undefined" or "null" endpoints commonly caused by JS variable interpolation
    if (url.includes('/undefined') || url.includes('/null')) {
        console.warn("Blocking API call to invalid endpoint:", url);
        return { ok: false, status: 400, json: async () => ({}) };
    }

    const headers = getAuthHeaders(options.headers || {});
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            console.warn("Unauthorized access detected. Clearing session.");
            const user = getStoredUser();
            if (user.token) {
                localStorage.removeItem('edu_user');
            }
        }
        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

export const getUserId = () => {
    try {
        const user = getStoredUser();
        if (!user || !user.id || user.id === 'undefined' || user.id === 'null') return null;
        return user.id;
    } catch {
        return null;
    }
};

export const getDownloads = async () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
        const response = await authFetch(`/api/resources/${userId}/actions`);
        if (!response.ok) throw new Error('Failed to load download history');
        const data = await response.json();
        return Array.isArray(data) ? data.filter(a => (a.actionType || '').toUpperCase() === 'DOWNLOAD') : [];
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return [];
    }
};

export const addDownload = async (resource) => {
    const userId = getUserId();
    if (!userId) return { success: false, error: 'User not authenticated' };
    if (!resource?.id || resource.id === 'undefined') return { success: false, error: 'Invalid asset ID' };

    try {
        const response = await authFetch('/api/resources/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                resourceId: resource.id,
                resourceTitle: resource.title,
                actionType: 'DOWNLOAD'
            })
        });
        const errorText = response.ok ? null : await response.text();
        return { success: response.ok, error: response.ok ? null : (errorText || 'Failed to record download') };
    } catch (error) {
        console.error('Error adding download:', error);
        return { success: false, error: error.message };
    }
};

export const getBookmarks = async () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
        const response = await authFetch(`/api/resources/${userId}/actions`);
        if (!response.ok) throw new Error('Repository Offline');
        const data = await response.json();
        return Array.isArray(data) ? data.filter(a => (a.actionType || '').toUpperCase() === 'BOOKMARK') : [];
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
    }
};

export const addBookmark = async (resource) => {
    const userId = getUserId();
    if (!userId) return { success: false, error: 'Identity verification failed' };
    if (!resource?.id || resource.id === 'undefined') return { success: false, error: 'Invalid asset ID' };

    try {
        const response = await authFetch('/api/resources/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                resourceId: resource.id,
                resourceTitle: resource.title,
                actionType: 'BOOKMARK'
            })
        });
        const errorText = response.ok ? null : await response.text();
        return { success: response.ok, error: response.ok ? null : (errorText || 'Vault access denied') };
    } catch (error) {
        console.error('Error adding bookmark:', error);
        return { success: false, error: error.message };
    }
};

export const removeBookmark = async (id) => {
    const userId = getUserId();
    if (!userId || !id || id === 'undefined') return { success: false, error: 'Invalid identifiers' };
    try {
        const response = await authFetch(`/api/resources/action/${userId}/${id}/BOOKMARK`, {
            method: 'DELETE'
        });
        return { success: response.ok, error: response.ok ? null : 'Vault deletion failed' };
    } catch (error) {
        console.error('Error removing bookmark:', error);
        return { success: false, error: error.message };
    }
};

export const isBookmarked = async (id) => {
    if (!id || id === 'undefined') return false;
    try {
        const bookmarks = await getBookmarks();
        return Array.isArray(bookmarks) && bookmarks.some(b => b.resourceId == id);
    } catch {
        return false;
    }
};

export const getFeedback = async () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
        const response = await authFetch(`/api/feedback/user/${userId}`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return [];
    }
};

export const addFeedback = async (feedbackItem) => {
    const userId = getUserId();
    if (!userId) return { success: false, error: 'Identity required' };
    try {
        const response = await authFetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...feedbackItem,
                userId
            })
        });
        return { success: response.ok, error: response.ok ? null : 'Appraisal rejected' };
    } catch (error) {
        console.error('Error adding feedback:', error);
        return { success: false, error: error.message };
    }
};

