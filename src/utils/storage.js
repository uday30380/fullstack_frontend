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
    const headers = getAuthHeaders(options.headers || {});
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            console.warn("Unauthorized access detected. Clearing session.");
            localStorage.removeItem('edu_user');
            // We don't force a redirect here to avoid breaking background sync, 
            // but the components will react to the missing user.
        }
        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

const getUserId = () => {
    const user = getStoredUser();
    return user.id;
};

export const getDownloads = async () => {
    const userId = getUserId();
    if (!userId) return [];
    try {
        const response = await authFetch(`/api/resources/${userId}/actions`);
        if (!response.ok) throw new Error('Failed to load download history');
        const data = await response.json();
        return data.filter(a => (a.actionType || '').toUpperCase() === 'DOWNLOAD');
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return [];
    }
};

export const addDownload = async (resource) => {
    const userId = getUserId();
    if (!userId) return { success: false, error: 'User not authenticated' };
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
        return data.filter(a => (a.actionType || '').toUpperCase() === 'BOOKMARK');
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
    }
};

export const addBookmark = async (resource) => {
    const userId = getUserId();
    if (!userId) return { success: false, error: 'Identity verification failed' };
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
    if (!userId) return { success: false, error: 'Identity verification failed' };
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
    try {
        const bookmarks = await getBookmarks();
        return bookmarks.some(b => b.resourceId === id);
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
        return await response.json();
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return [];
    }
};

export const addFeedback = async (feedbackItem) => {
    const userId = getUserId();
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
