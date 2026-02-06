import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const watchSourceEndpoints = {
  byMedia: ({ mediaType, mediaId, region, season, episode }) => {
    const params = new URLSearchParams();
    if (region) params.append("region", region);
    if (season) params.append("season", season);
    if (episode) params.append("episode", episode);
    const queryString = params.toString();
    return `sources/${mediaType}/${mediaId}${queryString ? `?${queryString}` : ""}`;
  },
  report: ({ sourceId }) => `sources/${sourceId}/reports`,
  create: "sources",
  update: ({ sourceId }) => `sources/${sourceId}`,
  openReports: "sources/reports/open"
};

const watchSourceApi = {
  getByMedia: async ({ mediaType, mediaId, region, season, episode }) => {
    try {
      const response = await publicClient.get(
        watchSourceEndpoints.byMedia({ mediaType, mediaId, region, season, episode })
      );

      return { response };
    } catch (err) {
      return { err };
    }
  },
  report: async ({ sourceId, reason, email }) => {
    try {
      const response = await publicClient.post(
        watchSourceEndpoints.report({ sourceId }),
        { reason, email }
      );

      return { response };
    } catch (err) {
      return { err };
    }
  },
  create: async (payload) => {
    try {
      const response = await privateClient.post(watchSourceEndpoints.create, payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },
  update: async ({ sourceId, payload }) => {
    try {
      const response = await privateClient.patch(
        watchSourceEndpoints.update({ sourceId }),
        payload
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },
  getOpenReports: async () => {
    try {
      const response = await privateClient.get(watchSourceEndpoints.openReports);
      return { response };
    } catch (err) {
      return { err };
    }
  }
};

export default watchSourceApi;
