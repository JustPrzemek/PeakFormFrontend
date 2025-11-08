import api from "./api";

/**
 * Pobiera paginowaną i filtrowaną listę planów treningowych zalogowanego użytkownika.
 * @param {object} params - Obiekt zawierający filtry, sortowanie i paginację.
 * @param {string} params.name - Filtr nazwy.
 * @param {string} params.goal - Filtr celu.
 * @param {boolean | null} params.isActive - Filtr statusu 'aktywny'.
 * @param {number} params.page - Numer strony (zaczynając od 0).
 * @param {number} params.size - Liczba elementów na stronie.
 * @param {object} params.sort - Obiekt sortowania.
 * @param {string} params.sort.field - Pole do sortowania (np. 'createdAt').
 * @param {string} params.sort.direction - Kierunek ('asc' lub 'desc').
 * @returns {Promise<object>} Obiekt Page (np. { content: [], totalPages: 5, ... }).
 */
export const getUserPlans = async ({ name, goal, isActive, page, size, sort }) => {
    try {
        // Budujemy parametry URL
        const params = new URLSearchParams();
        
        if (name) params.append('name', name);
        if (goal) params.append('goal', goal);
        // Sprawdzamy jawnie, czy nie jest null/undefined, aby wysłać 'true' lub 'false'
        if (isActive !== null && isActive !== undefined) {
            params.append('isActive', isActive);
        }
        
        params.append('page', page);
        params.append('size', size);
        
        if (sort && sort.field) {
            params.append('sort', `${sort.field},${sort.direction}`);
        }

        // Przekazujemy 'params' do api.get
        const response = await api.get('/workout-plans', { params });
        return response.data; // Oczekujemy obiektu Page, np. { content: [...] }
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



export const updatePlanDetails = async (planId, updateData) => {
    try {
        const response = await api.put(`/workout-plans/updateDetails/${planId}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Błąd podczas zmiany danyuch planu.";
    }
};


export const createBasicPlan = async () => {
    try {
        const response = await api.post(`/workout-plans/generateBasic`);
        return response.data;
    } catch (error)  {
        throw error.response?.data?.message || "Bład podczas generowania basic planu.";
    }
}