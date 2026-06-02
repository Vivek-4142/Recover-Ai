import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
});

// Automatically inject JWT Bearer token if user session exists
api.interceptors.request.use(
    (config) => {
        try {
            const userStr = localStorage.getItem("recover-ai-user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.access_token) {
                    config.headers.Authorization = `Bearer ${user.access_token}`;
                }
            }
        } catch (e) {
            console.error("Error reading access token from localStorage:", e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;