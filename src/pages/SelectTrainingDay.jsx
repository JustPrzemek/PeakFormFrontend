import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getActivePlanDays } from '../services/trainingService';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { FaDumbbell, FaRunning, FaHeartbeat, FaArrowLeft } from 'react-icons/fa';

// --- Komponent szkieletu ładowania (bez zmian) ---
const DayCardSkeleton = () => (
    <div className="bg-surfaceDarkGray rounded-2xl p-8 animate-pulse">
        <div className="h-10 w-10 bg-borderGrayHover/30 rounded-full mx-auto mb-6"></div>
        <div className="h-8 w-3/4 bg-borderGrayHover/30 rounded mx-auto mb-4"></div>
        <div className="h-4 w-1/2 bg-borderGrayHover/30 rounded mx-auto"></div>
    </div>
);

// --- Komponent stanu "pustego" (bez zmian) ---
const EmptyState = () => (
    <div className="text-center py-20 px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover">
        <h2 className="text-2xl font-bold text-whitePrimary">No Active Plan Or Day Found</h2>
        <p className="text-borderGrayHover mt-2 mb-6 max-w-md mx-auto">You don't seem to have an active training plan. Or you don't have exercise in your active plan. Please set a plan as active or add exercise to active plan to begin your workout.</p>
        <Link to="/training/plans" className="bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors">
            Go to My Plans
        </Link>
    </div>
);


export default function SelectTrainingDay() {
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Słownik ikon, aby łatwo nimi zarządzać
    const dayIcons = {
        DEFAULT: <FaDumbbell size={40} className="text-bluePrimary" />,
        PUSH: <FaHeartbeat size={40} className="text-red-400" />,
        PULL: <FaHeartbeat size={40} className="text-purple-400" />, // Przykład dla PULL
        LEGS: <FaRunning size={40} className="text-green-400" />,
    };

    // --- NOWA, INTELIGENTNA FUNKCJA DOBIERAJĄCA IKONY ---
    const getDayIcon = (focus) => {
        const upperCaseFocus = focus.toUpperCase();
        if (upperCaseFocus.includes('LEGS') || upperCaseFocus.includes('QUADS')) return dayIcons.LEGS;
        if (upperCaseFocus.includes('CHEST') || upperCaseFocus.includes('SHOULDERS')) return dayIcons.PUSH;
        if (upperCaseFocus.includes('BACK') || upperCaseFocus.includes('BICEPS')) return dayIcons.PULL;
        return dayIcons.DEFAULT;
    };

    useEffect(() => {
        const fetchDays = async () => {
            try {
                // Krok 1: Pobierz dane bezpośrednio z API (już w nowym formacie)
                const availableDays = await getActivePlanDays(); 
                
                // Krok 2: Dodaj do każdego obiektu odpowiednią ikonę
                const daysWithIcons = availableDays.map(day => ({
                    ...day, // Kopiuje istniejące pola: key, name, focus
                    icon: getDayIcon(day.focus) // Dodaje nowe pole z ikoną
                }));

                setDays(daysWithIcons);

            } catch (error) {
                toast.error("Could not find an active plan.");
                console.log(error)
                navigate('/training');
            } finally {
                setLoading(false);
            }
        };
        fetchDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handleDaySelect = (dayKey) => {
        navigate(`/training/live/${dayKey}`);
    };

    const handleGoBack = () => {
        navigate(`/training`);
    }

    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                <button
                    onClick={handleGoBack}
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="go back to previous page"
                    >
                    <FaArrowLeft
                        className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110"
                    />
                </button>
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold tracking-tight text-whitePrimary sm:text-6xl">
                        Time to Train
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-borderGrayHover">
                        Consistency is key. Select the day you're training today and let's get started.
                    </p>
                </header>
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <DayCardSkeleton />
                        <DayCardSkeleton />
                        <DayCardSkeleton />
                    </div>
                ) : days.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {days.map((day) => (
                            <div
                                key={day.key}
                                onClick={() => handleDaySelect(day.key)}
                                className="bg-surfaceDarkGray p-8 rounded-2xl text-center cursor-pointer 
                                           border border-transparent hover:border-bluePrimary hover:-translate-y-2 
                                           transition-all duration-300 shadow-lg hover:shadow-bluePrimary/10 group"
                            >
                                <div className="mb-6 flex justify-center items-center h-10">
                                    {day.icon}
                                </div>
                                <h2 className="text-3xl font-bold text-whitePrimary capitalize">{day.name.toLowerCase()}</h2>
                                <p className="text-borderGrayHover mt-2 capitalize">{day.focus.toLowerCase()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </main>
            <Footer />
        </div>
    );
}