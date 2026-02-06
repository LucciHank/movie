import axios from 'axios';

const testUrl = "http://localhost:5000/api/v1/user/debug/schema";

const testRequest = async () => {
    try {
        console.log("Fetching:", testUrl);
        const response = await axios.get(testUrl);
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("Data:", err.response.data);
        }
    }
};

testRequest();
