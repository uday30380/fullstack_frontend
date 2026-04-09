
/**
 * Institutional Multimedia Synchronizer
 * Robustly extracts YouTube Video IDs and Playlist IDs for scholarly embedding
 */
export const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle standard, shorts, and live videos
    // This regex catches most variants including shorts, live, and embed urls
    const videoRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const videoMatch = url.match(videoRegExp);
    
    // Check if we found a valid 11-char video ID
    if (videoMatch && videoMatch[2].length === 11) {
        const videoId = videoMatch[2];
        const playlistMatch = url.match(/[?&]list=([^#&?]+)/);
        
        // If it's a video in a playlist, embed the video with the playlist context
        if (playlistMatch) {
            return `https://www.youtube.com/embed/${videoId}?list=${playlistMatch[1]}`;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle standalone playlists
    const playlistMatch = url.match(/[?&]list=([^#&?]+)/);
    if (playlistMatch) {
        return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
    }
    
    // Fallback for direct embed URLs that might already be correct
    if (url.includes('youtube.com/embed/')) {
        return url;
    }
    
    return null;
};

export const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    return null;
};
