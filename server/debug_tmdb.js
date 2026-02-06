import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const baseUrl = process.env.TMDB_BASE_URL;
const key = process.env.TMDB_KEY;

const getUrl = (endpoint, params) => {
    const qs = new URLSearchParams(params);
    return `${baseUrl}${endpoint}?api_key=${key}&${qs}`;
};

console.log("Testing TMDB Discovery...");

const testUrl = getUrl('discover/movie', {
    page: '1',
    sort_by: 'popularity.desc',
    with_original_language: 'vi'
});

console.log("Request URL:", testUrl.replace(key, "HIDDEN_KEY"));

const testRequest = async () => {
    try {
        const response = await axios.get(testUrl);
        console.log("Success! Results:", response.data.results?.length);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
};

testRequest();
