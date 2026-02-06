const baseUrl = process.env.TMDB_BASE_URL;
const key = process.env.TMDB_KEY;

const getUrl = (endpoint, params) => {
  // Filter out undefined values
  const cleanParams = params ? Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  ) : {};

  const qs = new URLSearchParams(cleanParams);
  const queryString = qs.toString();

  return `${baseUrl}${endpoint}?api_key=${key}${queryString ? '&' + queryString : ''}`;
};

export default { getUrl };