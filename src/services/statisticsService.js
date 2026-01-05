// src/services/statisticsService.js
import api from './api';

/**
 * Helper do formatowania parametrów daty.
 * Backend oczekuje stringów ISO, a my wysyłamy obiekt params.
 */
const getAuthoredParams = (startDate, endDate) => ({
    params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    }
});

/**
 * 1. Pobiera kluczowe wskaźniki (KPI)
 */
export const getKpiSummary = async (startDate, endDate) => {
    try {
        const response = await api.get('/statistics/kpi', getAuthoredParams(startDate, endDate));
        return response.data; // KpiSummaryDTO
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch KPI summary.";
    }
};

/**
 * 2. Pobiera dane do wykresu częstotliwości treningów
 */
export const getWorkoutFrequency = async (startDate, endDate) => {
    try {
        const response = await api.get('/statistics/frequency', getAuthoredParams(startDate, endDate));
        return response.data; // List<TimeSeriesDataPoint<Long>>
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch workout frequency.";
    }
};

/**
 * 3. Pobiera dane do wykresu całkowitej objętości
 */
export const getTotalVolume = async (startDate, endDate) => {
    try {
        const response = await api.get('/statistics/volume', getAuthoredParams(startDate, endDate));
        return response.data; // List<TimeSeriesDataPoint<Double>>
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch volume data.";
    }
};

/**
 * 4. Pobiera dane do wykresu dystansu cardio
 */
export const getCardioDistance = async (startDate, endDate) => {
    try {
        const response = await api.get('/statistics/cardio-distance', getAuthoredParams(startDate, endDate));
        return response.data; // List<TimeSeriesDataPoint<Double>>
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch cardio data.";
    }
};

/**
 * 5. Pobiera dane do wykresu rozkładu grup mięśniowych
 */
export const getMuscleGroupDistribution = async (startDate, endDate) => {
    try {
        const response = await api.get('/statistics/muscle-distribution', getAuthoredParams(startDate, endDate));
        return response.data; // List<LabelDataPoint<Long>>
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch muscle group distribution.";
    }
};

/**
 * 6. Pobiera dane do wykresu progresji dla danego ćwiczenia
 */
export const getExerciseProgression = async (exerciseId, startDate, endDate) => {
    try {
        const response = await api.get(`/statistics/progression/${exerciseId}`, getAuthoredParams(startDate, endDate));
        return response.data; // List<TimeSeriesDataPoint<Double>>
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch exercise progression.";
    }
};