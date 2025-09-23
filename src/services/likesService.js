import api from "./api";

export const addLikeToPost = async (postId) => {
    try {
        const response = await api.post(`/likes/${postId}/like`);
        return response.data; // Zwraca { totalLikes, isLikedByUser }
    } catch (error) {
        throw error.response?.data?.message || "Failed to add like";
    }
};

export const removeLikeFromPost = async (postId) => {
    try {
        const response = await api.delete(`/likes/${postId}/like`);
        return response.data; // Zwraca { totalLikes, isLikedByUser }
    } catch (error) {
        throw error.response?.data?.message || "Failed to remove like";
    }
};