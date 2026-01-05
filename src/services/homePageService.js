import api from './api';

export const getSuggestedUsers = async () => {
    try {
        const response = await api.get('/userProfile/home/suggestedUsers');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch users";
    }
};