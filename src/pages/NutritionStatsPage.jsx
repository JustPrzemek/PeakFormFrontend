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
 */
const WeightInputForm = ({ onWeightSaved }) => {
    const [weight, setWeight] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- NOWA FUNKCJA OBSŁUGUJĄCA ZMIANĘ INPUTA ---
    const handleWeightChange = (e) => {
        const value = e.target.value;

        // 1. Walidacja znaków (Regex)
        // Pozwala tylko na cyfry i opcjonalnie jedną kropkę. Blokuje 'e', '-', '+' itp.
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
            return;
        }

        // 2. Walidacja limitu (Max 500)
        if (value !== '') {
            const numValue = parseFloat(value);
            if (numValue > 500) {
                toast.error("Maksymalna waga to 500kg", { id: 'weight-limit' });
                return;
            }
            // Opcjonalnie: blokada zbyt wielu miejsc po przecinku (np. max 1)
            if (value.includes('.') && value.split('.')[1].length > 1) return;
        }

        setWeight(value);
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        const weightValue = parseFloat(weight);
        if (!weightValue || weightValue <= 0 || isNaN(weightValue)) {
            toast.error("Please enter a valid weight (greater than 0).");
            return;
        }

        setIsSubmitting(true);
        try {
            await addWeightLog(weightValue);
            toast.success("Weight saved successfully!");
            setWeight('');
            onWeightSaved();
        } catch (error) {
            toast.error(error.message || 'Failed to save weight.');
        } finally {
            setIsSubmitting(false);
        }
    }, [weight, onWeightSaved]);

    return (
        <form 
            onSubmit={handleSubmit} 
            className="bg-surfaceDarkGray rounded-2xl p-6 mb-8"
        >
            <h2 className="text-2xl font-bold text-whitePrimary mb-4">Log Today's Weight</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <FaWeight className="absolute left-4 top-4 text-borderGrayHover" size={18} />
                    <label htmlFor="weight-input" className="sr-only">Enter your weight in kg</label>
                    <input
                        id="weight-input"
                        type="number" // Nadal number dla klawiatury numerycznej na mobilkach
                        placeholder="Enter your weight in kg"
                        value={weight}
                        onChange={handleWeightChange} // Tutaj podpięta nowa funkcja
                        className="p-3 bg-backgoudBlack text-whitePrimary rounded-lg w-full pl-12 focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                        step="0.1"
                        min="0"
                        max="500" // HTML walidacja
                        required
                    />
                </div>
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

const WeightHistoryChart = ({ data }) => {
    const formattedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data
            .map(item => ({
                date: new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }),
                weight: item.weight
            }))
            .reverse();
    }, [data]);

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

    return (
        <div className="bg-surfaceDarkGray rounded-2xl p-6 h-[400px]">
            <h2 className="text-2xl font-bold text-whitePrimary mb-6">Progress Chart</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                    data={formattedData} 
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                    />
                    <YAxis 
                        stroke="#9CA3AF"
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'var(--color-backgoudBlack)', 
                            border: '1px solid var(--color-borderGrayHover)' 
                        }} 
                        itemStyle={{ color: 'var(--color-whitePrimary)' }}
                        labelStyle={{ color: 'var(--color-bluePrimary)' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="var(--color-bluePrimary)" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 8 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function NutritionStatsPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleWeightSaved = useCallback(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                <Link 
                    to="/nutrition" 
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="Go back to nutrition dashboard"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                <h1 className="text-4xl font-bold text-whitePrimary mb-10">Weight Statistics</h1>

                <WeightInputForm onWeightSaved={handleWeightSaved} />

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