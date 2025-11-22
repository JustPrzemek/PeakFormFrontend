import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
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
                const res = await axios.post(
                    `${API_URL}/api/auth/refresh`, 
                    {}, // Puste body (lub cokolwiek wymaga Twój backend, ale tokena tu nie dajemy)
                    { withCredentials: true } 
                );

                if (res.data.accessToken) {
                    localStorage.setItem("accessToken", res.data.accessToken);
                    
                    // 3. ZMIANA: Nie zapisujemy refreshToken w localStorage!
                    // Backend sam zaktualizował ciasteczko w tle (Set-Cookie).
                    
                    originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // W razie błędu czyścimy tylko access token
                localStorage.removeItem("accessToken");
                // localStorage.removeItem("refreshToken"); // To już nie istnieje
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;