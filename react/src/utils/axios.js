import axios from "axios";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("TOKEN");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Skip the auto-logout for login endpoint
            const isLoginRequest = error.config.url === '/login';
            
            if (error.response.status === 401 && !isLoginRequest) {
                localStorage.removeItem("token");
                sessionStorage.removeItem("TOKEN");
                window.location.reload();
                return error;
            }
            console.error("API error:", error.response.data);
        } else {
            console.error("Network error:", error);
        }
        throw error;
    }
);

export default axiosClient;