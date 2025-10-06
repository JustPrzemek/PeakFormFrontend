import api from "./api";

/**
 * Pobiera listę wszystkich planów treningowych zalogowanego użytkownika.
 * @returns {Promise<Array<object>>} Lista planów w formacie WorkoutPlanSummaryDto.
 */
export const getUserPlans = async () => {
    try {
        const response = await api.get('/workout-plans');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się pobrać planów treningowych.";
    }
};

/**
 * Wysyła żądanie wygenerowania nowego planu treningowego na podstawie preferencji.
 * @param {object} generationData - Dane z formularza (goal, experience, daysPerWeek, type, setActive).
 * @returns {Promise<object>} Szczegóły nowo utworzonego planu (WorkoutPlanDetailDto).
 */
export const generatePlan = async (generationData) => {
    try {
        const response = await api.post('/workout-plans/generate', generationData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Błąd podczas generowania planu.";
    }
};

/**
 * Usuwa plan treningowy o podanym ID.
 * @param {number} planId - ID planu do usunięcia.
 * @returns {Promise<void>}
 */
export const deletePlan = async (planId) => {
    try {
        await api.delete(`/workout-plans/${planId}`);
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się usunąć planu.";
    }
};

/**
 * Pobiera szczegóły konkretnego planu treningowego.
 * @param {number} planId - ID planu.
 * @returns {Promise<object>} Szczegóły planu (WorkoutPlanDetailDto).
 */
export const getPlanDetails = async (planId) => {
    try {
        const response = await api.get(`/workout-plans/${planId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się pobrać szczegółów planu.";
    }
};

/**
 * Tworzy nowy, pusty plan treningowy z podaną nazwą i opisem.
 * @param {object} planData - Dane planu (name, description, setActive).
 * @returns {Promise<object>} Szczegóły nowo utworzonego planu (WorkoutPlanDetailDto).
 */
export const createCustomPlan = async (planData) => {
    try {
        const response = await api.post('/workout-plans', planData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Błąd podczas tworzenia planu.";
    }
};


/**
 * Dodaje ćwiczenie do konkretnego planu treningowego.
 * @param {number} planId ID planu.
 * @param {object} exerciseData Dane ćwiczenia (exerciseId, dayIdentifier, sets, reps, restTime).
 * @returns {Promise<object>} Zwraca zaktualizowane szczegóły planu (WorkoutPlanDetailDto).
 */
export const addExerciseToPlan = async (planId, exerciseData) => {
    try {
        const response = await api.post(`/workout-plans/${planId}/exercises`, exerciseData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Błąd podczas dodawania ćwiczenia do planu.";
    }
};

/**
 * Usuwa konkretne ćwiczenie z planu treningowego.
 * @param {number} planId ID planu.
 * @param {number} workoutPlanExerciseId ID wpisu ćwiczenia w planie (exercise.id).
 * @returns {Promise<void>}
 */
export const removeExerciseFromPlan = async (planId, workoutPlanExerciseId) => {
    try {
        await api.delete(`/workout-plans/${planId}/exercises/${workoutPlanExerciseId}`);
    } catch (error) {
        throw error.response?.data?.message || "Błąd podczas usuwania ćwiczenia z planu.";
    }
};

/**
 * Aktualizuje dane ćwiczenia (serie, powtórzenia, przerwa) w planie.
 * @param {number} planId ID planu.
 * @param {number} workoutPlanExerciseId ID wpisu ćwiczenia w planie (exercise.id).
 * @param {object} updateData Dane do aktualizacji (sets, reps, restTime).
 * @returns {Promise<object>} Zwraca zaktualizowane szczegóły całego planu.
 */
export const updateExerciseInPlan = async (planId, workoutPlanExerciseId, updateData) => {
    try {
        const response = await api.put(`/workout-plans/${planId}/exercises/${workoutPlanExerciseId}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Błąd podczas aktualizacji ćwiczenia.";
    }
};