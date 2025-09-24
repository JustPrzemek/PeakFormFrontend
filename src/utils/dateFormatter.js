export const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const interval = seconds / 31536000; // Liczba sekund w roku

    // ZMIANA TUTAJ: Jeśli post jest starszy niż rok, pokaż pełną datę
    if (interval > 1) {
        // Używamy opcji, aby uzyskać format "dzień miesiąc rok"
        // 'pl-PL' zapewni polskie nazwy miesięcy
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Reszta logiki pozostaje bez zmian
    let months = seconds / 2592000;
    if (months > 1) return Math.floor(months) + " months ago";
    
    let days = seconds / 86400;
    if (days > 1) return Math.floor(days) + " days ago";
    
    let hours = seconds / 3600;
    if (hours > 1) return Math.floor(hours) + " hours ago";
    
    let minutes = seconds / 60;
    if (minutes > 1) return Math.floor(minutes) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
};