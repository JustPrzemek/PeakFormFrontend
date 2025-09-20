import api from "./api";

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        //zapis tokena po usanym logowaniu
        if (response.data.accessToken && response.data.refreshToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response.data;
    } catch (error) {
        // Rzucamy błąd dalej, żeby komponent mógł go obsłużyć
        throw error.response.data.message || 'Invalid credentials';
    }
}


// Funkcja do rejestracji
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data; 
        }
        throw new Error('Registration failed due to a network error.');
    }
};

// Funkcja do wylogowania (na przyszłość)
export const logoutUser = async (refreshToken) => {
    try {
        const response = await api.post('/auth/logout', {
            refreshToken: refreshToken
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to logout';
    }
    
};

// Funkcja do wysyłania prośby o reset hasła
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response.data.message || 'Failed to send password reset email.';
    }
};

// Funkcja do ustawiania nowego hasła
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        throw error.response.data.message || 'Failed to reset password.';
    }
};


export const verifyEmail = async (token) => {
    try {
        const response = await api.get(`/auth/verify?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Verification failed';
    }
};
