import axios from "axios";
import queryString from "query-string";

let baseURL = "http://localhost:5000/api/v1/";
if (process.env.NODE_ENV === "production") {
  baseURL = "/api/v1/";
}

const publicClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

publicClient.interceptors.request.use(async config => {
  return {
    ...config,
    headers: {
      "Content-Type": "application/json"
    }
  };
});

publicClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  console.error("API Error:", err.response?.data || err.message); // Log full error details
  const error = new Error(err?.response?.data?.message || err?.message || "Network error");
  error.status = err?.response?.status || 500;
  throw error;
});

export default publicClient;
