// src/pages/NutritionDashboardPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNutritionGoals, getDailyLog, deleteFoodLog } from '../services/nutritionService';
import MacroProgressBar from '../components/nutrition/MacroProgressBar';
import AddFoodModal from '../components/nutrition/AddFoodModal';
import Footer from '../components/Footer';
import { CgSpinner } from 'react-icons/cg';
import toast from 'react-hot-toast';
import { FaFire, FaChevronLeft, FaChevronRight, FaChartLine } from 'react-icons/fa';
import MealCard from '../components/nutrition/MealCard';

/**
 * Komponent szkieletu (skeleton) wyświetlany podczas ładowania danych.
 * 
 * Skeleton loading - pokazuje strukturę strony z animowanymi placeholderami,
 * co daje użytkownikowi wrażenie, że strona się ładuje (lepsze UX niż pusty ekran).
 */
const DashboardSkeleton = () => (
    <div className="animate-pulse">
        {/* Skeleton dla sekcji kalorii */}
        <div className="bg-surfaceDarkGray rounded-2xl p-8 text-center mb-8">
            <div className="h-8 w-3/4 bg-borderGrayHover/30 rounded-lg mx-auto mb-6"></div>
            <div className="h-20 w-20 bg-borderGrayHover/30 rounded-full mx-auto mb-4"></div>
            <div className="h-6 w-1/2 bg-borderGrayHover/30 rounded-lg mx-auto"></div>
        </div>
        {/* Skeleton dla pasków makro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surfaceDarkGray rounded-2xl p-6 h-24"></div>
            <div className="bg-surfaceDarkGray rounded-2xl p-6 h-24"></div>
            <div className="bg-surfaceDarkGray rounded-2xl p-6 h-24"></div>
        </div>
    </div>
);

/**
 * Główna strona dashboardu żywieniowego.
 * 
 * Wyświetla:
 * - Podsumowanie kalorii i makroskładników dla wybranej daty
 * - Karty posiłków (Breakfast, Lunch, Dinner, Snacks) z możliwością dodawania/usuwania produktów
 * - Selektor daty do przeglądania historii
 * - Modal do dodawania produktów
 */
export default function NutritionDashboardPage() {
    // ========== STAN KOMPONENTU ==========
    const [goals, setGoals] = useState(null); // Cele żywieniowe użytkownika (z API)
    const [dailyLog, setDailyLog] = useState(null); // Dziennik żywieniowy dla wybranej daty
    const [selectedDate, setSelectedDate] = useState(new Date()); // Wybrana data (domyślnie dzisiaj)
    const [loadingGoals, setLoadingGoals] = useState(true); // Czy trwa ładowanie celów
    const [loadingLog, setLoadingLog] = useState(true); // Czy trwa ładowanie dziennika
    const [error, setError] = useState(null); // Błąd ładowania (np. brak profilu)
    const [isModalOpen, setIsModalOpen] = useState(false); // Czy modal dodawania produktu jest otwarty
    const [modalMealType, setModalMealType] = useState(null); // Typ posiłku dla modala
    
    const navigate = useNavigate();

    // ========== FUNKCJE POBIERANIA DANYCH ==========
    /**
     * Pobiera dziennik żywieniowy dla wybranej daty.
     * useCallback - memoizuje funkcję, żeby nie była tworzona na nowo przy każdym renderze
     */
    const fetchDailyLog = useCallback(async (date) => {
        try {
            setLoadingLog(true);
            const logData = await getDailyLog(date);
            setDailyLog(logData);
        } catch (err) {
            toast.error(err.message || 'Failed to fetch daily log.');
        } finally {
            setLoadingLog(false);
        }
    }, []);

    // ========== EFEKTY UBOCZNE ==========
    /**
     * Pobiera cele żywieniowe i dziennik przy pierwszym załadowaniu oraz przy zmianie daty.
     * 
     * Dependencies: [selectedDate, fetchDailyLog]
     * - Uruchomi się przy pierwszym renderze
     * - Uruchomi się ponownie, gdy zmieni się selectedDate
     */
    useEffect(() => {
        const fetchGoals = async () => {
            try {
                setLoadingGoals(true);
                const data = await getNutritionGoals();
                setGoals(data);
                setError(null); // Wyczyść błąd, jeśli udało się załadować
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoadingGoals(false);
            }
        };
        
        // Pobierz cele (tylko raz, bo nie zależą od daty)
        fetchGoals();
        // Pobierz dziennik dla wybranej daty
        fetchDailyLog(selectedDate);

    }, [selectedDate, fetchDailyLog]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY ==========
    /**
     * Otwiera modal do dodawania produktu dla określonego typu posiłku.
     * 
     * @param {string} mealType - Typ posiłku ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')
     */
    const handleOpenModal = useCallback((mealType) => {
        setModalMealType(mealType);
        setIsModalOpen(true);
    }, []);

    /**
     * Zamyka modal dodawania produktu.
     */
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setModalMealType(null);
    }, []);

    /**
     * Callback wywoływany po pomyślnym dodaniu produktu.
     * Odświeża dziennik, żeby pokazać nowy produkt.
     */
    const handleFoodLogged = useCallback(() => {
        fetchDailyLog(selectedDate);
    }, [selectedDate, fetchDailyLog]);

    /**
     * Zmienia wybraną datę o określoną liczbę dni.
     * 
     * @param {number} daysToAdd - Liczba dni do dodania (może być ujemna)
     */
    const handleDateChange = useCallback((daysToAdd) => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + daysToAdd);
            return newDate;
        });
    }, []);

    /**
     * Usuwa wpis z dziennika żywieniowego.
     * 
     * @param {number} logId - ID wpisu do usunięcia
     */
    const handleDeleteFoodLog = useCallback(async (logId) => {
        try {
            await deleteFoodLog(logId);
            toast.success("Entry deleted successfully.");
            // Odśwież dziennik, żeby zaktualizować sumy i listę
            fetchDailyLog(selectedDate); 
        } catch (error) {
            toast.error(error.message || 'Failed to delete entry.');
        }
    }, [selectedDate, fetchDailyLog]);

    // ========== OBLICZENIA (useMemo) ==========
    /**
     * Formatuje datę do wyświetlania w przyjazny sposób.
     * 
     * Zwraca:
     * - "Today" dla dzisiejszej daty
     * - "Yesterday" dla wczorajszej daty
     * - Sformatowaną datę dla pozostałych (np. "15 stycznia")
     */
    const formattedDate = useMemo(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (selectedDate.toDateString() === today.toDateString()) return 'Today';
        if (selectedDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return selectedDate.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long' });
    }, [selectedDate]);

    /**
     * Wyciąga podsumowanie z dziennika lub zwraca wartości domyślne.
     * useMemo - nie przelicza przy każdym renderze, tylko gdy zmieni się dailyLog
     */
    const summary = useMemo(() => {
        return dailyLog?.summary || { 
            totalCalories: 0, 
            totalProtein: 0, 
            totalCarbs: 0, 
            totalFat: 0 
        };
    }, [dailyLog]);

    /**
     * Oblicza procent wypełnienia celu kalorycznego.
     * useMemo - nie przelicza przy każdym renderze
     */
    const caloriePercentage = useMemo(() => {
        if (!goals || !goals.targetCalories || goals.targetCalories <= 0) return 0;
        return Math.min((summary.totalCalories / goals.targetCalories) * 100, 100);
    }, [summary.totalCalories, goals]);
    
    // ========== WARUNKOWE RENDEROWANIE - STANY ŁADOWANIA I BŁĘDÓW ==========
    
    // Jeśli trwa ładowanie celów, pokaż skeleton
    if (loadingGoals) {
        return (
            <div className="bg-backgoudBlack min-h-screen">
                <main className="container mx-auto p-4 sm:p-8">
                    <h1 className="text-4xl font-bold text-whitePrimary mb-10">Nutrition</h1>
                    <DashboardSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    // Jeśli wystąpił błąd (np. brak profilu), pokaż komunikat błędu
    if (error) {
        return (
            <div className="bg-backgoudBlack min-h-screen">
                <main className="container mx-auto p-4 sm:p-8 text-center">
                    <h1 className="text-4xl font-bold text-whitePrimary mb-10">Nutrition</h1>
                    <div className="bg-surfaceDarkGray rounded-2xl p-12 border border-dashed border-red-500/50">
                        <h2 className="text-2xl font-bold text-red-400">Loading Error</h2>
                        <p className="text-borderGrayHover mt-2 mb-6 max-w-md mx-auto">
                            {error}
                        </p>
                        {/* Jeśli błąd dotyczy profilu, pokaż przycisk do uzupełnienia profilu */}
                        {error.toLowerCase().includes("profile") && (
                             <button
                                onClick={() => navigate('/profile/settings/edit')}
                                className="bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300"
                            >
                                Complete Profile
                            </button>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ========== RENDEROWANIE GŁÓWNEJ TREŚCI ==========
    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                
                {/* Header z tytułem i przyciskiem statystyk */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
                    <h1 className="text-4xl font-bold text-whitePrimary">Nutrition</h1>
                    <button
                        onClick={() => navigate('/nutrition/stats')}
                        className="flex items-center justify-center gap-2 bg-surfaceDarkGray text-whitePrimary font-bold py-2 px-5 rounded-lg hover:bg-borderGrayHover transition-colors duration-300"
                        aria-label="View weight statistics"
                    >
                        <FaChartLine />
                        Statistics
                    </button>
                </div>

                {/* Selektor daty - nawigacja między dniami */}
                <div className="flex justify-between items-center mb-10">
                    <button 
                        onClick={() => handleDateChange(-1)} 
                        className="p-3 rounded-full text-borderGrayHover hover:bg-surfaceDarkGray hover:text-whitePrimary transition-colors"
                        aria-label="Previous day"
                    >
                        <FaChevronLeft size={20} />
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-whitePrimary text-center">
                        {formattedDate}
                    </h1>
                    <button 
                        onClick={() => handleDateChange(1)} 
                        className="p-3 rounded-full text-borderGrayHover hover:bg-surfaceDarkGray hover:text-whitePrimary transition-colors"
                        aria-label="Next day"
                    >
                        <FaChevronRight size={20} />
                    </button>
                </div>

                {/* Sekcja podsumowania kalorii */}
                <div className="bg-surfaceDarkGray rounded-2xl p-8 text-center mb-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-borderGrayHover mb-4">Calories</h2>
                    <div className="flex justify-center items-baseline gap-2 mb-4">
                        <span className="text-5xl font-bold text-whitePrimary">
                            {Math.round(summary.totalCalories)}
                        </span>
                        <span className="text-3xl text-borderGrayHover">
                            / {goals?.targetCalories || 0} kcal
                        </span>
                    </div>
                    {/* Wykres kołowy pokazujący postęp kaloryczny */}
                    {/* conic-gradient - tworzy koło wypełnione w zależności od procentu */}
                    <div 
                        className="w-40 h-40 mx-auto bg-backgoudBlack rounded-full flex items-center justify-center transition-all duration-500"
                        style={{
                            background: `
                                radial-gradient(closest-side, var(--color-backgoudBlack) 79%, transparent 80% 100%),
                                conic-gradient(var(--color-bluePrimary) ${caloriePercentage}%, var(--color-surfaceDarkGray) 0)
                            `
                        }}
                        role="progressbar"
                        aria-valuenow={caloriePercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Calories: ${Math.round(summary.totalCalories)} out of ${goals?.targetCalories || 0}`}
                    >
                        <FaFire className="text-bluePrimary" size={40} />
                    </div>
                </div>
                
                {/* Paski postępu dla makroskładników */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-surfaceDarkGray rounded-2xl p-6">
                        <MacroProgressBar 
                            label="Protein" 
                            current={summary.totalProtein}
                            target={goals?.targetProtein || 0}
                            colorClass="bg-bluePrimary"
                        />
                    </div>
                    <div className="bg-surfaceDarkGray rounded-2xl p-6">
                        <MacroProgressBar 
                            label="Carbs" 
                            current={summary.totalCarbs}
                            target={goals?.targetCarbs || 0}
                            colorClass="bg-green-500"
                        />
                    </div>
                    <div className="bg-surfaceDarkGray rounded-2xl p-6">
                        <MacroProgressBar 
                            label="Fat" 
                            current={summary.totalFat}
                            target={goals?.targetFat || 0}
                            colorClass="bg-yellow-500"
                        />
                    </div>
                </div>

                {/* Karty posiłków */}
                {loadingLog ? (
                    <div className="flex justify-center items-center py-20">
                        <CgSpinner className="animate-spin text-bluePrimary" size={60} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <MealCard 
                            title="Breakfast" 
                            entries={dailyLog?.meals.BREAKFAST || []}
                            onAddClick={() => handleOpenModal('BREAKFAST')}
                            onDeleteEntry={handleDeleteFoodLog}
                        />
                        <MealCard 
                            title="Lunch" 
                            entries={dailyLog?.meals.LUNCH || []}
                            onAddClick={() => handleOpenModal('LUNCH')}
                            onDeleteEntry={handleDeleteFoodLog}
                        />
                        <MealCard 
                            title="Dinner" 
                            entries={dailyLog?.meals.DINNER || []}
                            onAddClick={() => handleOpenModal('DINNER')}
                            onDeleteEntry={handleDeleteFoodLog}
                        />
                        <MealCard 
                            title="Snacks" 
                            entries={dailyLog?.meals.SNACK || []}
                            onAddClick={() => handleOpenModal('SNACK')}
                            onDeleteEntry={handleDeleteFoodLog}
                        />
                    </div>
                )}
            </main>
            
            <Footer />
            
            {/* Modal do dodawania produktów */}
            <AddFoodModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                onFoodLogged={handleFoodLogged}
                preselectedMealType={modalMealType}
                selectedDate={selectedDate}
            />
        </div>
    );
}