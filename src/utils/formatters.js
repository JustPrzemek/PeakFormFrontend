// src/utils/formatters.js

/**
 * Formatuje czas trwania z sekund do formatu 1h 30m 15s.
 * @param {number} totalSeconds - Całkowita liczba sekund.
 */
export const formatDuration = (totalSeconds) => {
    if (!totalSeconds && totalSeconds !== 0) return 'N/A';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
};

/**
 * Formatuje datę i czas do lokalnego formatu.
 * @param {string} dateTimeString - Data jako string ISO.
 */
export const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};