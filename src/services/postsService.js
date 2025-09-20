import api from "./api";

export const getMyPosts = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`/posts/myPosts`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch posts";
    }
};