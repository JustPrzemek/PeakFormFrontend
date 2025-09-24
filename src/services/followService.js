import api from "./api";

export const followUser = async (usernameToFollow) => {
    await api.post(`/users/${usernameToFollow}/follow`);
};

export const unfollowUser = async (usernameToUnfollow) => {
    await api.delete(`/users/${usernameToUnfollow}/unfollow`);
};


const getFollowers = async (username, page = 0, size = 20, search = "") => {
    const response = await api.get(`/users/${username}/followers`, {
        params: { page, size, search }
    });
    return response.data;
};

const getFollowing = async (username, page = 0, size = 20, search = "") => {
    const response = await api.get(`/users/${username}/following`, {
        params: { page, size, search }
    });
    return response.data;
};

const getMyFollowers = async (page = 0, size = 20, search = "") => {
    const response = await api.get(`/users/my/followers`, {
        params: { page, size, search }
    });
    return response.data;
};

const getMyFollowing = async (page = 0, size = 20, search = "") => {
    const response = await api.get(`/users/my/following`, {
        params: { page, size, search }
    });
    return response.data;
};


export const followsService = {
    getFollowers,
    getFollowing,
    getMyFollowers,
    getMyFollowing
};