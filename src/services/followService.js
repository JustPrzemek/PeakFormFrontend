import api from "./api";

export const followUser = async (username) => {
    const response = await api.post(`/users/${username}/follow`);
    return response.data;
};

export const unfollowUser = async (username) => {
    const response = await api.delete(`/users/${username}/follow`);
    return response.data;
};