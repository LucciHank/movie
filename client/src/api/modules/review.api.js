import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const reviewEndpoints = {
  list: "reviews",
  add: "reviews",
  getByMedia: ({ mediaId }) => `reviews/media/${mediaId}`,
  remove: ({ reviewId }) => `reviews/${reviewId}`
};

const reviewApi = {
  add: async ({
    mediaId,
    mediaType,
    mediaTitle,
    mediaPoster,
    content,
    rating
  }) => {
    try {
      const response = await privateClient.post(
        reviewEndpoints.add,
        {
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster,
          content,
          rating
        }
      );

      return { response };
    } catch (err) { return { err }; }
  },
  remove: async ({ reviewId }) => {
    try {
      const response = await privateClient.delete(reviewEndpoints.remove({ reviewId }));

      return { response };
    } catch (err) { return { err }; }
  },
  getList: async ({ mediaId }) => {
    try {
      // Use public client so non-logged users can see reviews
      const response = await publicClient.get(reviewEndpoints.getByMedia({ mediaId }));

      return { response };
    } catch (err) { return { err }; }
  },
  getUserReviews: async () => {
    try {
      const response = await privateClient.get(reviewEndpoints.list);

      return { response };
    } catch (err) { return { err }; }
  }
};

export default reviewApi;