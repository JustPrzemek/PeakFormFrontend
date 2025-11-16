import axios from "axios";
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

// Dodanie access tokena do nagłówków
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Obsługa błędu 401 i refresh tokena
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    // Jeśli nie ma refresh tokena, od razu wyloguj
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                const res = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                if (res.data.accessToken) {
                    localStorage.setItem("accessToken", res.data.accessToken);
                    
                    // Ulepszenie: Zapisz nowy refresh token, jeśli istnieje
                    if (res.data.refreshToken) {
                        localStorage.setItem("refreshToken", res.data.refreshToken);
                    }
                    
                    originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                toast.error(refreshError);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;