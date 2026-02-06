import axios from "axios";

const get = async (url) => {
  console.log("TMDB Request URL:", url);
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "identity"
      }
    });
    return response.data;
  } catch (error) {
    console.log("TMDB Request Error:", error.message);
    throw error;
  }
};

export default { get };