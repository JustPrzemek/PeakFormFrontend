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

export const createPost = async (postData) => {
    // 1. Stwórz obiekt FormData
    const formData = new FormData();
    
    // 2. Dodaj treść posta. Nazwa 'content' musi pasować do @RequestPart("content") w backendzie
    formData.append('content', postData.content);

    // 3. Dodaj plik, jeśli istnieje. Nazwa 'file' musi pasować do @RequestPart("file")
    if (postData.file) {
        formData.append('file', postData.file);
    }

    try {
        // 4. Wyślij żądanie POST. Axios automatycznie ustawi odpowiedni
        //    nagłówek 'Content-Type: multipart/form-data' gdy przekażesz obiekt FormData.
        const response = await api.post('/posts/post', formData);
        return response.data;
    } catch (error) {
        // Rzuć błąd, aby komponent mógł go obsłużyć
        throw error.response?.data?.message || "Failed to create post";
    }
};