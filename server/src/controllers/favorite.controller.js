import supabase from "../supabase.js";
import responseHandler from "../handlers/response.handler.js";

const addFavorite = async (req, res) => {
  try {
    const { mediaId, mediaType, mediaTitle, mediaPoster, mediaRate } = req.body;

    // Check if already favorite
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('media_id', mediaId)
      .single();

    if (existing) {
      return responseHandler.ok(res, existing);
    }

    // Add favorite
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: req.user.id,
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
        media_rate: mediaRate
      })
      .select()
      .single();

    if (error) {
      console.error("Add favorite error:", error);
      return responseHandler.error(res);
    }

    responseHandler.created(res, favorite);
  } catch (err) {
    console.error("Add favorite error:", err);
    responseHandler.error(res);
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', req.user.id);

    if (error) {
      return responseHandler.notfound(res);
    }

    responseHandler.ok(res);
  } catch {
    responseHandler.error(res);
  }
};

const getFavoritesOfUser = async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return responseHandler.error(res);
    }

    responseHandler.ok(res, favorites);
  } catch {
    responseHandler.error(res);
  }
};

export default { addFavorite, removeFavorite, getFavoritesOfUser };