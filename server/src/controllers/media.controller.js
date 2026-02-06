import responseHandler from "../handlers/response.handler.js";
import tmdbApi from "../tmdb/tmdb.api.js";
import supabase from "../supabase.js";
import tokenMiddlerware from "../middlewares/token.middleware.js";

const getList = async (req, res) => {
  try {
    const { page } = req.query;
    const { mediaType, mediaCategory } = req.params;

    const response = await tmdbApi.mediaList({ mediaType, mediaCategory, page });

    return responseHandler.ok(res, response);
  } catch (e) {
    console.log("getList error:", e.message);
    responseHandler.error(res, e);
  }
};

const discover = async (req, res) => {
  try {
    const { mediaType } = req.params;
    const params = req.query;

    const response = await tmdbApi.mediaDiscover({ mediaType, ...params });

    return responseHandler.ok(res, response);
  } catch (e) {
    console.error("discover error detail:", e);
    responseHandler.error(res, e);
  }
};

const getGenres = async (req, res) => {
  try {
    const { mediaType } = req.params;

    const response = await tmdbApi.mediaGenres({ mediaType });

    return responseHandler.ok(res, response);
  } catch (e) {
    responseHandler.error(res, e);
  }
};

const search = async (req, res) => {
  try {
    const { mediaType } = req.params;
    const { query, page } = req.query;

    const response = await tmdbApi.mediaSearch({
      query,
      page,
      mediaType: mediaType === "people" ? "person" : mediaType
    });

    responseHandler.ok(res, response);
  } catch (e) {
    responseHandler.error(res, e);
  }
};

const getDetail = async (req, res) => {
  try {
    const { mediaType, mediaId } = req.params;

    const params = { mediaType, mediaId };

    const media = await tmdbApi.mediaDetail(params);

    media.credits = await tmdbApi.mediaCredits(params);

    const videos = await tmdbApi.mediaVideos(params);

    media.videos = videos;

    const recommend = await tmdbApi.mediaRecommend(params);

    media.recommend = recommend.results;

    media.images = await tmdbApi.mediaImages(params);

    const tokenDecoded = tokenMiddlerware.tokenDecode(req);

    if (tokenDecoded) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', tokenDecoded.data)
        .single();

      if (user) {
        const { data: isFavorite } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .single();
        media.isFavorite = isFavorite !== null;
      }
    }

    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (id, display_name)
      `)
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false });

    media.reviews = (reviews || []).map(review => ({
      id: review.id,
      content: review.content,
      rating: review.rating,
      createdAt: review.created_at,
      user: {
        id: review.users.id,
        displayName: review.users.display_name
      }
    }));

    responseHandler.ok(res, media);
  } catch (e) {
    console.log("getDetail error:", e.message);
    responseHandler.error(res, e);
  }
};

export default { getList, getGenres, search, getDetail, discover };