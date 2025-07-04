import publicClient from "../client/public.client";

const personEndpoints = {
  detail: ({ personId }) => `person/${personId}`,
  medias: ({ personId }) => `person/${personId}/medias`,
  list: ({ page }) => `person/popular?page=${page}`,
  search: ({ query, page }) => `search/person?query=${query}&page=${page}`
};

const personApi = {
  detail: async ({ personId }) => {
    try {
      const response = await publicClient.get(personEndpoints.detail({ personId }));

      return { response };
    } catch (err) { return { err }; }
  },
  medias: async ({ personId }) => {
    try {
      const response = await publicClient.get(personEndpoints.medias({ personId }));

      return { response };
    } catch (err) { return { err }; }
  },
  list: async ({ page = 1 }) => {
    try {
      const response = await publicClient.get(personEndpoints.list({ page }));

      return { response };
    } catch (err) { return { err }; }
  },
  search: async ({ query, page = 1 }) => {
    try {
      const response = await publicClient.get(personEndpoints.search({ query, page }));

      return { response };
    } catch (err) { return { err }; }
  }
};

export default personApi;