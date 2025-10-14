// src/services/trainingService.js
import api from './api'; // Upewnij się, że masz skonfigurowany plik api.js

/**
 * Pobiera dostępne dni treningowe z aktywnego planu użytkownika.
 */
export const getActivePlanDays = async () => {
    try {
        const response = await api.get('/trainings/workout-plans/active/days');
        return response.data; // Zwraca List<String>
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się pobrać dni treningowych.";
    }
};

/**
 * Rozpoczyna nową sesję treningową dla wybranego dnia.
 * @param {string} dayIdentifier - Identyfikator dnia (np. "A", "B").
 */
export const startTrainingSession = async (dayIdentifier) => {
    try {
        const response = await api.post(`/trainings/sessions/start/${dayIdentifier}`);
        return response.data; // Zwraca TrainingDayDto
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się rozpocząć sesji treningowej.";
    }
};

/**
 * Dodaje wpis o wykonanym ćwiczeniu (serii) do sesji.
 * @param {number} sessionId - ID aktywnej sesji.
 * @param {object} logData - Dane logu (exerciseId, setNumber, reps, weight).
 */
export const addExerciseLog = async (sessionId, logData) => {
    try {
        const response = await api.post(`/trainings/sessions/${sessionId}/logs`, logData);
        return response.data; // Zwraca ExerciseLogDto
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się zapisać serii.";
    }
};

/**
 * Kończy aktywną sesję treningową.
 * @param {number} sessionId - ID sesji do zakończenia.
 */
export const finishTrainingSession = async (sessionId) => {
    try {
        const response = await api.post(`/trainings/sessions/${sessionId}/finish`);
        return response.data; // Zwraca TrainingSessionDto
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się zakończyć sesji.";
    }
};

/**
 * Sprawdza, czy użytkownik ma aktywną (niezakończoną) sesję treningową.
 * @returns {Promise<object|null>} Zwraca obiekt sesji lub null, jeśli brak aktywnej.
 */
export const getOrCreateSession = async (dayIdentifier) => {
    try {
        // Użyj nowego endpointu
        const response = await api.post(`/trainings/sessions/get-or-create/${dayIdentifier}`);
        return response.data; // Zwraca teraz LiveTrainingStateDto
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się pobrać lub rozpocząć sesji treningowej.";
    }
};

/**
 * Usuwa całą sesję treningową wraz z jej logami.
 * @param {number} sessionId - ID sesji do usunięcia.
 */
export const deleteTrainingSession = async (sessionId) => {
    try {
        // Używamy metody DELETE
        await api.delete(`/trainings/sessions/${sessionId}`);
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się usunąć sesji.";
    }
};

/**
 * Sprawdza, czy użytkownik ma aktywną (niezakończoną) sesję treningową.
 * @returns {Promise<object|null>} Zwraca obiekt sesji lub null, jeśli brak aktywnej.
 */
export const getActiveSession = async () => {
    try {
        const response = await api.get('/trainings/sessions/active');
        // Jeśli status to 200 OK, zwróć dane. Jeśli 204 No Content, axios zwróci `undefined`.
        return response.data || null;
    } catch (error) {
        // Jeśli serwer zwróci błąd (np. 401 Unauthorized), rzuć go dalej
        throw error.response?.data?.message || "Nie udało się sprawdzić sesji.";
    }
};

/**
 * Pobiera ćwiczenia dla konkretnego dnia z danego planu.
 * (Zakładam, że masz lub stworzysz taki endpoint: GET /api/trainings/workout-plans/{planId}/days/{dayIdentifier})
 */
export const getExercisesForPlanDay = async (planId, dayIdentifier) => {
    try {
        const response = await api.get(`/workout-plans/${planId}/days/${dayIdentifier}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się pobrać ćwiczeń.";
    }
};

/**
 * Zapisuje cały, uzupełniony trening jednym żądaniem.
 * @param {object} bulkLogData - Obiekt zgodny z BulkLogRequestDto.
 */
export const logPastWorkout = async (bulkLogData) => {
    try {
        const response = await api.post('/trainings/sessions/bulk-log', bulkLogData);
        return response.data; // Zwraca TrainingSessionDto
    } catch (error) {
        throw error.response?.data?.message || "Nie udało się zapisać treningu.";
    }
};