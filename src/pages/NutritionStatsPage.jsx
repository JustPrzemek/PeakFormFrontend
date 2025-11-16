// src/pages/NutritionStatsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { addWeightLog, getWeightHistory } from '../services/nutritionService';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaWeight, FaSave } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Komponent formularza do logowania wagi.
 * 
 * Pozwala użytkownikowi wprowadzić swoją wagę i zapisać ją w systemie.
 * Po zapisaniu wywołuje callback, który odświeża wykres historii wagi.
 * 
 * @param {object} props
 * @param {function} props.onWeightSaved - Callback wywoływany po pomyślnym zapisaniu wagi
 */
const WeightInputForm = ({ onWeightSaved }) => {
    // ========== STAN KOMPONENTU ==========
    const [weight, setWeight] = useState(''); // Wartość wprowadzona przez użytkownika
    const [isSubmitting, setIsSubmitting] = useState(false); // Czy trwa zapisywanie

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY ==========
    /**
     * Obsługuje wysłanie formularza.
     * Waliduje dane i zapisuje wagę do API.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault(); // Zapobiega domyślnemu zachowaniu formularza
        
        // Walidacja - sprawdź, czy wartość jest prawidłową liczbą większą od 0
        const weightValue = parseFloat(weight);
        if (!weightValue || weightValue <= 0 || isNaN(weightValue)) {
            toast.error("Please enter a valid weight (greater than 0).");
            return;
        }

        setIsSubmitting(true);
        try {
            // Wyślij wagę do API
            await addWeightLog(weightValue);
            toast.success("Weight saved successfully!");
            setWeight(''); // Wyczyść pole po zapisaniu
            onWeightSaved(); // Wywołaj callback, żeby odświeżyć wykres
        } catch (error) {
            toast.error(error.message || 'Failed to save weight.');
        } finally {
            setIsSubmitting(false);
        }
    }, [weight, onWeightSaved]);

    // ========== RENDEROWANIE ==========
    return (
        <form 
            onSubmit={handleSubmit} 
            className="bg-surfaceDarkGray rounded-2xl p-6 mb-8"
        >
            <h2 className="text-2xl font-bold text-whitePrimary mb-4">Log Today's Weight</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Pole input z ikoną */}
                <div className="relative flex-grow">
                    <FaWeight className="absolute left-4 top-4 text-borderGrayHover" size={18} />
                    <label htmlFor="weight-input" className="sr-only">Enter your weight in kg</label>
                    <input
                        id="weight-input"
                        type="number"
                        placeholder="Enter your weight in kg"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="p-3 bg-backgoudBlack text-whitePrimary rounded-lg w-full pl-12 focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                        step="0.1"
                        min="0"
                        required
                    />
                </div>
                {/* Przycisk submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <CgSpinner className="animate-spin" size={20} />
                    ) : (
                        <FaSave />
                    )}
                    Save
                </button>
            </div>
        </form>
    );
};

/**
 * Komponent wykresu historii wagi.
 * 
 * Wyświetla liniowy wykres pokazujący zmiany wagi w czasie.
 * Używa biblioteki Recharts do renderowania wykresu.
 * 
 * @param {object} props
 * @param {Array} props.data - Tablica obiektów z historią wagi (z API)
 */
const WeightHistoryChart = ({ data }) => {
    // ========== OBLICZENIA (useMemo) ==========
    /**
     * Formatuje dane dla biblioteki Recharts.
     * 
     * Recharts wymaga danych w formacie:
     * - Tablica obiektów z kluczami odpowiadającymi dataKey
     * - Dane od najstarszej do najnowszej (stąd reverse())
     */
    const formattedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data
            .map(item => ({
                // Formatujemy datę na krótką formę (np. "Jan 15")
                date: new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }),
                weight: item.weight
            }))
            .reverse(); // API zwraca DESC, więc odwracamy dla Recharts
    }, [data]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    // Jeśli brak danych, pokaż placeholder
    if (data.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover">
                <FaWeight className="mx-auto text-5xl text-borderGrayHover mb-4" />
                <h2 className="text-2xl font-bold text-whitePrimary">No Weight History</h2>
                <p className="text-borderGrayHover mt-2">
                    Log your weight using the form above to see your progress chart.
                </p>
            </div>
        );
    }

    // ========== RENDEROWANIE WYKRESU ==========
    return (
        <div className="bg-surfaceDarkGray rounded-2xl p-6 h-[400px]">
            <h2 className="text-2xl font-bold text-whitePrimary mb-6">Progress Chart</h2>
            {/* ResponsiveContainer - automatycznie dostosowuje rozmiar do kontenera */}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                    data={formattedData} 
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                    {/* Siatka pomocnicza */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    
                    {/* Oś X - daty */}
                    <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" // Kolor osi (odpowiednik text-borderGrayHover)
                    />
                    
                    {/* Oś Y - waga */}
                    <YAxis 
                        stroke="#9CA3AF"
                        // domain - zakres wartości na osi Y
                        // 'dataMin - 2' i 'dataMax + 2' dają trochę przestrzeni na górze i dole
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    
                    {/* Tooltip - wyświetla się przy najechaniu na punkt */}
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'var(--color-backgoudBlack)', 
                            border: '1px solid var(--color-borderGrayHover)' 
                        }} 
                        itemStyle={{ color: 'var(--color-whitePrimary)' }}
                        labelStyle={{ color: 'var(--color-bluePrimary)' }}
                    />
                    
                    {/* Linia wykresu */}
                    <Line 
                        type="monotone" // Typ linii - płynna krzywa
                        dataKey="weight" // Klucz danych do wyświetlenia
                        stroke="var(--color-bluePrimary)" // Kolor linii
                        strokeWidth={2} // Grubość linii
                        dot={{ r: 4 }} // Rozmiar punktów na linii
                        activeDot={{ r: 8 }} // Rozmiar punktu przy najechaniu
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * Główna strona statystyk wagi.
 * 
 * Wyświetla:
 * - Formularz do logowania wagi
 * - Wykres historii wagi w czasie
 */
export default function NutritionStatsPage() {
    // ========== STAN KOMPONENTU ==========
    const [history, setHistory] = useState([]); // Historia pomiarów wagi
    const [loading, setLoading] = useState(true); // Czy trwa ładowanie danych

    // ========== FUNKCJE ==========
    /**
     * Pobiera historię wagi z API.
     * useCallback - memoizuje funkcję, żeby nie była tworzona na nowo przy każdym renderze
     */
    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getWeightHistory();
            setHistory(data);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch weight history.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== EFEKTY UBOCZNE ==========
    /**
     * Pobiera historię wagi przy pierwszym załadowaniu strony.
     * Pusta tablica dependencies [] oznacza, że uruchomi się tylko raz.
     */
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    /**
     * Callback wywoływany po zapisaniu wagi.
     * Odświeża wykres, żeby pokazać nowy pomiar.
     */
    const handleWeightSaved = useCallback(() => {
        fetchHistory();
    }, [fetchHistory]);

    // ========== RENDEROWANIE ==========
    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                {/* Przycisk powrotu */}
                <Link 
                    to="/nutrition" 
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="Go back to nutrition dashboard"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                <h1 className="text-4xl font-bold text-whitePrimary mb-10">Weight Statistics</h1>

                {/* Formularz logowania wagi */}
                <WeightInputForm onWeightSaved={handleWeightSaved} />

                {/* Warunkowe renderowanie - pokaż spinner podczas ładowania, w przeciwnym razie wykres */}
                {loading ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <CgSpinner className="animate-spin text-bluePrimary" size={60} />
                    </div>
                ) : (
                    <WeightHistoryChart data={history} />
                )}
            </main>
            <Footer />
        </div>
    );
}