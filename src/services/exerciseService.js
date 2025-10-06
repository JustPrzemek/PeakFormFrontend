import api from "./api";

/**
 * Pobiera listę ćwiczeń z serwera z opcjonalnym filtrowaniem i paginacją.
 * @param {object} params - Obiekt z parametrami: name, muscleGroup, difficulty, page, size.
 * @returns {Promise<object>} Paginowana odpowiedź z listą ćwiczeń.
 */
export const getExercises = async (params) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.name) queryParams.append('name', params.name);
        if (params.muscleGroup) queryParams.append('muscleGroup', params.muscleGroup);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        queryParams.append('page', params.page || 0);
        queryParams.append('size', params.size || 10);
        
        const response = await api.get(`/exercises?${queryParams.toString()}`);
        return response.data; // Zwraca obiekt PagedResponse<ExerciseDto>
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch exercises";
    }
};

/**
 * Pobiera szczegółowe dane jednego ćwiczenia.
 * @param {number} id - ID ćwiczenia.
 * @returns {Promise<object>} Obiekt SingleExerciseDto.
 */
export const getExerciseById = async (id) => {
    try {
        const response = await api.get(`/exercises/${id}`);
        return response.data; // Zwraca obiekt SingleExerciseDto
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch exercise details";
    }
};