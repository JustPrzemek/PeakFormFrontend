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

