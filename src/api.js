import axios from 'axios';

// Create a configured instance of Axios
const api = axios.create({
    baseURL: 'https://syncspace-backend-gby5.onrender.com', // Point to your Spring Boot Backend
});

export default api;