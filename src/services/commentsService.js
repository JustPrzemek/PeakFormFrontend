import api from "./api";


export const addComment = async (commentData) => {
    try {
        const response = await api.post("/comments/addCommentForPost", commentData); 
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to add comment";
    }
};