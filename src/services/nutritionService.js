import api from './api';

/**
 * 1. Pobiera cele żywieniowe zalogowanego użytkownika
 * (kalorie, białko, węglowodany, tłuszcze)
 */
export const getNutritionGoals = async () => {
    try {
        const response = await api.get('/nutrition/goals');
        return response.data; // NutritionGoalsDto
    } catch (error) {
        // Przekazujemy błąd z backendu, np. "User profile is incomplete"
        throw new Error(error.response?.data?.message || error.response?.data || "Failed to fetch nutrition goals.");
    }
};

/**
 * 2. Wyszukuje produkty spożywcze w zewnętrznym API (przez nasze proxy)
 * @param {string} query - Frazes do wyszukania (np. "mleko")
 * @param {AbortSignal} signal - Opcjonalny AbortSignal do anulowania requestu
 */
export const searchFoodProducts = async (query, signal = null) => {
    try {
        // Używamy `params`, aby axios poprawnie sformatował URL
        // na /api/nutrition/search?query=mleko
        // signal - pozwala anulować request (np. gdy użytkownik wpisuje dalej)
        const response = await api.get('/nutrition/search', {
            params: { query },
            signal // Axios automatycznie obsługuje anulowanie przez AbortController
        });
        return response.data; // List<ProductSearchResultDto>
    } catch (error) {
        // Jeśli request został anulowany, rzuć specjalny błąd
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
            throw error; // Przekaż dalej, żeby komponent mógł to obsłużyć
        }
        throw new Error(error.response?.data?.message || "Failed to search for food.");
    }
};

/**
 * 3. Pobiera dziennik żywieniowy dla konkretnej daty
 * @param {Date} date - Obiekt daty
 */
export const getDailyLog = async (date) => {
    // Formatujemy datę na YYYY-MM-DD
    const isoDate = date.toISOString().split('T')[0];
    try {
        const response = await api.get(`/nutrition/log/${isoDate}`);
        return response.data; // DailyLogDto
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch daily log.");
    }
};

/**
 * 4. Loguje (zapisuje) nowy produkt do dziennika
 * @param {object} logData - Obiekt AddFoodLogDto
 * @param {string} logData.externalApiId
 * @param {Date} logData.date
 * @param {string} logData.mealType - 'BREAKFAST', 'LUNCH', etc.
 * @param {number} logData.quantity
 */
export const logFood = async (logData) => {
    try {
        // Formatujemy datę na YYYY-MM-DD
        const payload = {
            ...logData,
            date: logData.date.toISOString().split('T')[0],
        };
        const response = await api.post('/nutrition/log', payload);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to log food.");
    }
};

/**
 * 5. Usuwa wpis z dziennika żywieniowego
 * @param {number} logId - ID wpisu z daily_food_log
 */
export const deleteFoodLog = async (logId) => {
    try {
        await api.delete(`/nutrition/log/${logId}`);
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete food entry.");
    }
};

/**
 * 6. Dodaje lub aktualizuje dzisiejszy pomiar wagi
 * @param {number} weight - Waga użytkownika (jako float)
 */
export const addWeightLog = async (weight) => {
    try {
        const response = await api.post('/nutrition/stats/weight', { weight });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to save weight.");
    }
};

/**
 * 7. Pobiera historię pomiarów wagi
 */
export const getWeightHistory = async () => {
    try {
        const response = await api.get('/nutrition/stats/weight');
        return response.data; // List<WeightHistoryDto>
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch weight history.");
    }
};