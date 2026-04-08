const RAW_RESOURCES = [];

// Set exactly 25 items to 'Active' status
const INITIAL_RESOURCES = [];

const INITIAL_USERS = [];

const INITIAL_FEEDBACK = [];

export const MOCK_COMMENTS = [];

// Helper functions for Local Storage initialization and management
const initializeData = (key, data, validationFn) => {
    let existingDataStr = localStorage.getItem(key);
    let shouldInitialize = !existingDataStr;

    if (existingDataStr && validationFn) {
        try {
            const parsed = JSON.parse(existingDataStr);
            if (!validationFn(parsed)) {
                shouldInitialize = true;
            }
        } catch {
            shouldInitialize = true;
        }
    }

    if (shouldInitialize) {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

export const getStoredResources = () => {
    initializeData('libraryItems', INITIAL_RESOURCES, null);
    return JSON.parse(localStorage.getItem('libraryItems'));
};

export const setStoredResources = (data) => {
    localStorage.setItem('libraryItems', JSON.stringify(data));
};

export const getStoredUsers = () => {
    initializeData('libraryUsers', INITIAL_USERS, null);
    return JSON.parse(localStorage.getItem('libraryUsers'));
};

export const setStoredUsers = (data) => {
    localStorage.setItem('libraryUsers', JSON.stringify(data));
};

export const getStoredFeedback = () => {
    initializeData('libraryFeedback', INITIAL_FEEDBACK, null);
    return JSON.parse(localStorage.getItem('libraryFeedback'));
};

export const setStoredFeedback = (data) => {
    localStorage.setItem('libraryFeedback', JSON.stringify(data));
};


export const getResourceById = (id) => {
    const resources = getStoredResources();
    return resources.find(r => r.id === parseInt(id));
};

export const getCommentsForResource = (id) => {
    return MOCK_COMMENTS.filter(c => c.resourceId === parseInt(id));
};
