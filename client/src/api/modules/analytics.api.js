import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const analyticsEndpoints = {
    track: "analytics/track",
    stats: "analytics/stats"
};

const analyticsApi = {
    track: async ({ eventType, mediaId, mediaTitle, duration }) => {
        try {
            await publicClient.post(analyticsEndpoints.track, {
                eventType,
                mediaId,
                mediaTitle,
                duration
            });
        } catch (err) { console.error(err); }
    },
    getStats: async () => {
        try {
            const response = await privateClient.get(analyticsEndpoints.stats);
            return { response };
        } catch (err) { return { err }; }
    }
};

export default analyticsApi;
