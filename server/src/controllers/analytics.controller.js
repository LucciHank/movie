import supabase from "../supabase.js";
import responseHandler from "../handlers/response.handler.js";

const track = async (req, res) => {
    try {
        const { eventType, mediaId, mediaTitle, duration } = req.body;
        const userId = req.user ? req.user.id : null;

        const { error } = await supabase
            .from('analytics')
            .insert({
                event_type: eventType,
                media_id: mediaId,
                media_title: mediaTitle,
                user_id: userId,
                duration: duration || 0
            });

        if (error) {
            console.error("Analytics track error:", error);
            return responseHandler.error(res);
        }

        responseHandler.ok(res);
    } catch {
        responseHandler.error(res);
    }
};

const getStats = async (req, res) => {
    try {
        // Check admin
        if (req.user.username !== "admin2004" && req.user.username !== "hoanganhdo181@gmail.com" && req.user.role !== "admin") {
            return responseHandler.unauthorize(res);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get today views
        const { count: todayViews, error: todayError } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'media_view')
            .gte('created_at', today.toISOString());

        // Get weekly views
        const { count: weeklyViews, error: weeklyError } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'media_view')
            .gte('created_at', weekAgo.toISOString());

        // Get top movies (most viewed)
        // Since we can't do complex group by easily with basic client without RPC, 
        // we will fetch recent views and aggregate in memory (limit 1000 for performance)
        const { data: recentViews } = await supabase
            .from('analytics')
            .select('media_id, media_title, created_at')
            .eq('event_type', 'media_view')
            .gte('created_at', weekAgo.toISOString())
            .limit(1000);

        const mediaCounts = {};
        recentViews?.forEach(view => {
            if (!view.media_id) return;
            if (!mediaCounts[view.media_id]) {
                mediaCounts[view.media_id] = {
                    id: view.media_id,
                    title: view.media_title,
                    views: 0
                };
            }
            mediaCounts[view.media_id].views++;
        });

        const topMovies = Object.values(mediaCounts)
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        responseHandler.ok(res, {
            todayViews: todayViews || 0,
            weeklyViews: weeklyViews || 0,
            topMovies
        });
    } catch (err) {
        console.error("Get stats error:", err);
        responseHandler.error(res);
    }
};

export default { track, getStats };
