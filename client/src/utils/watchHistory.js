// Watch history utility for Continue Watching feature
// Stores watch progress in localStorage

const WATCH_HISTORY_KEY = 'tomflix_watch_history';
const MAX_HISTORY_ITEMS = 20;

export const getWatchHistory = () => {
    try {
        const history = localStorage.getItem(WATCH_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
};

export const saveWatchProgress = ({ mediaId, mediaType, title, poster, progress, duration, season, episode }) => {
    try {
        const history = getWatchHistory();

        // Find existing entry
        const existingIndex = history.findIndex(
            item => item.mediaId === mediaId &&
                (mediaType !== 'tv' || (item.season === season && item.episode === episode))
        );

        const entry = {
            mediaId,
            mediaType,
            title,
            poster,
            progress, // Current time in seconds
            duration, // Total duration in seconds
            season,
            episode,
            lastWatched: Date.now(),
            percentage: duration > 0 ? Math.floor((progress / duration) * 100) : 0
        };

        if (existingIndex !== -1) {
            // Update existing entry
            history[existingIndex] = entry;
        } else {
            // Add new entry at the beginning
            history.unshift(entry);
        }

        // Keep only last MAX_HISTORY_ITEMS
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmedHistory));

        return trimmedHistory;
    } catch (error) {
        console.error('Failed to save watch progress:', error);
        return [];
    }
};

export const getMediaProgress = (mediaId, season, episode) => {
    try {
        const history = getWatchHistory();
        const entry = history.find(
            item => item.mediaId === mediaId &&
                (item.season === season || !season) &&
                (item.episode === episode || !episode)
        );
        return entry ? entry.progress : 0;
    } catch {
        return 0;
    }
};

export const removeFromHistory = (mediaId) => {
    try {
        const history = getWatchHistory();
        const filtered = history.filter(item => item.mediaId !== mediaId);
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filtered));
        return filtered;
    } catch {
        return [];
    }
};

export const clearWatchHistory = () => {
    try {
        localStorage.removeItem(WATCH_HISTORY_KEY);
        return [];
    } catch {
        return [];
    }
};
