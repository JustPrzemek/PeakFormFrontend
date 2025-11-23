import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`; // lub Twoje URL

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Ważne dla ciasteczek refresh token
});

// 1. Request Interceptor - Dodawanie tokena do każdego zapytania
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && !config.url.includes('/auth/refresh')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Zmienne do obsługi kolejkowania refreshu (Race Condition Fix)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 2. Response Interceptor - Obsługa 401 i Refresh Token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Jeśli dostaliśmy 401 i nie jest to zapytanie o logowanie ani sam refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            
            if (isRefreshing) {
                // Jeśli odświeżanie już trwa, dodaj zapytanie do kolejki
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Wywołanie endpointu refresh (ciasteczko idzie automatycznie dzięki withCredentials: true)
                const response = await api.post('/auth/refresh');
                const { accessToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                
                // Ustawienie nowego tokena w nagłówkach axios
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Przetworzenie kolejki oczekujących zapytań
                processQueue(null, accessToken);
                
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Jeśli refresh się nie udał, wyloguj użytkownika
                localStorage.removeItem('accessToken');
                window.location.href = '/login'; 
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;