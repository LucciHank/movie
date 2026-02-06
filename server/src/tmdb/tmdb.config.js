const baseUrl = process.env.TMDB_BASE_URL;
const key = process.env.TMDB_KEY;

const getUrl = (endpoint, params) => {
  const qs = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qs.append(key, value);
      }
    });
  }

  const queryString = qs.toString();

  const url = `${baseUrl}${endpoint}?api_key=${key}${queryString ? '&' + queryString : ''}`;
  console.log("Generated TMDB URL:", url); // Debug log
  return url;
};

export default { getUrl };