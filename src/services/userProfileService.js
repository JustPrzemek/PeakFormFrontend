import api from "./api";

// Profil zalogowanego użytkownika (/me)
export const getMyProfile = async () => {
    try {
        const response = await api.get("/userProfile/me");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch profile";
    }
};

// Profil innego użytkownika po username
export const getUserProfile = async (username) => {
    try {
        const response = await api.get(`/userProfile/${username}/profile`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch user profile";
    }
};

export const getMyProfilePicture = async () => {
    try {
        const response = await api.get("/userProfile/myProfilePhoto");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch user profile picture";
    }
};

export const getEditData = async () => {
    try {
        const response = await api.get("/userProfile/getEditData");
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch data for user";
    }
};

export const updateUserData = async (userData) => {
    try {
        const response = await api.patch("/userProfile/updateProfileData", userData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || "Failed to update user data";    
        throw new Error(message);
    }
};

export const uploadProfileImage = async (file) => {
    // 1. Stwórz obiekt FormData
    const formData = new FormData();
    
    // 2. Dodaj plik do FormData. Nazwa 'file' musi być taka sama
    //    jak w adnotacji @RequestPart("file") w kontrolerze!
    formData.append('file', file);

    try {
        // 3. Wyślij zapytanie POST z obiektem FormData.
        //    Axios automatycznie ustawi poprawny nagłówek 'Content-Type'.
        const response = await api.post("/userProfile/image", formData);
        return response.data; // Endpoint zwraca nowy URL obrazu
    } catch (error) {
        throw error.response?.data?.message || "Failed to upload image";
    }
};

export const searchUsers = async (query, size = 5) => {
    // Jeśli zapytanie jest puste, nie wysyłamy requestu
    if (!query.trim()) {
        return { content: [] };
    }

    try {
        const response = await api.get("/userProfile/search", {
            params: { 
                query,
                size 
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to search users:", error);
        throw error.response?.data?.message || "Failed to search users";
    }
};

export const makeActivePlan = async (planId) => {
    try {
        const response = await api.post("/userProfile/me/active-plan", planId);
        return response.data;
    } catch (error) {
        console.error("Failed to update active plan: ", error);
        throw error.response?.data?.message || "Failed to save active plan";
    }
}
