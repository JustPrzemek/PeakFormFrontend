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

export const getMyFollowersPosts = async (page = 0, size = 10) => {
    try {
        const response = await api.get(`/posts/feed`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch posts";
    }
};

export const getUserPosts = async (username, page = 0, size = 10) => {
    try {
        const response = await api.get(`/posts/users/${username}/posts`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || `Failed to fetch posts for user ${username}`;
    }
};

export const getPostDetails = async (postId, page = 0, size = 10) => {
    try {
        const response = await api.get(`/posts/${postId}`, {
            params: { page, size },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch post details";
    }
};