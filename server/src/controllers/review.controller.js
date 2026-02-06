import supabase from "../supabase.js";
import responseHandler from "../handlers/response.handler.js";

const create = async (req, res) => {
  try {
    const { mediaId, mediaType, mediaTitle, mediaPoster, content, rating } = req.body;

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: req.user.id,
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
        content,
        rating: rating || 5
      })
      .select(`
        *,
        users:user_id (id, display_name)
      `)
      .single();

    if (error) {
      console.error("Create review error:", error);
      return responseHandler.error(res);
    }

    responseHandler.created(res, {
      id: review.id,
      content: review.content,
      rating: review.rating,
      createdAt: review.created_at,
      user: {
        id: review.users.id,
        displayName: review.users.display_name
      }
    });
  } catch (err) {
    console.error("Create review error:", err);
    responseHandler.error(res);
  }
};

const remove = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', req.user.id);

    if (error) {
      return responseHandler.notfound(res);
    }

    responseHandler.ok(res);
  } catch {
    responseHandler.error(res);
  }
};

const getReviewsOfUser = async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return responseHandler.error(res);
    }

    responseHandler.ok(res, reviews);
  } catch {
    responseHandler.error(res);
  }
};

const getReviewsByMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (id, display_name)
      `)
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false });

    if (error) {
      return responseHandler.error(res);
    }

    // Format response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      content: review.content,
      rating: review.rating,
      createdAt: review.created_at,
      user: {
        id: review.users.id,
        displayName: review.users.display_name
      }
    }));

    responseHandler.ok(res, formattedReviews);
  } catch {
    responseHandler.error(res);
  }
};

export default { create, remove, getReviewsOfUser, getReviewsByMedia };