import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logPastWorkout } from '../services/trainingService';
import { getUserPlans } from '../services/workoutPlanService';
import FillWorkoutForm from '../components/FillWorkoutForm';
import { FaArrowLeft, FaRegCalendarAlt } from 'react-icons/fa';
import { GrPlan } from 'react-icons/gr';
import { CgSpinner } from 'react-icons/cg';

// --- Komponent Wskaźnika Postępu (Stepper) ---
const Stepper = ({ currentStep }) => {
    const steps = ["Select Plan", "Select Day & Date", "Log Details"];
    return (
        <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center">
                {steps.map((stepName, stepIdx) => (
                    <li key={stepName} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {currentStep > stepIdx + 1 ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-bluePrimary" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-bluePrimary rounded-full">
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                                </span>
                            </>
                        ) : currentStep === stepIdx + 1 ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-borderGrayHover" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-bluePrimary rounded-full border-2 border-bluePrimary">
                                    <span className="h-2.5 w-2.5 bg-white rounded-full" aria-hidden="true" />
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-borderGrayHover" />
                                </div>
                                <span className="relative flex h-8 w-8 items-center justify-center bg-surfaceDarkGray rounded-full border-2 border-borderGrayHover"></span>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
const localDateTime = now.toISOString().slice(0, 16);

export default function LogPastWorkoutPage() {
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [workoutDate, setWorkoutDate] = useState(localDateTime);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        getUserPlans()
            .then(setPlans)
            .catch(err => toast.error(err.toString()))
            .finally(() => setLoading(false));
    }, []);

    const handleSaveWorkout = async (payload) => {
        try {
            await logPastWorkout(payload);
            toast.success("Trening został pomyślnie zapisany!");
            navigate('/training/history');
        } catch (error) {
            toast.error(error.toString());
        }
    };

    const handleGoBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            navigate(-1);
        }
    };

    // Funkcje do obsługi wyboru i przechodzenia dalej
    const selectPlan = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const selectDay = (day) => {
        setSelectedDay(day);
        setStep(3);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-center mb-8">Select a Plan</h2>
                        {loading ? <CgSpinner className="mx-auto animate-spin text-4xl" /> : (
                            // --- POCZĄTEK ZMIAN ---
                            // Sprawdzamy, czy tablica z planami ma jakieś elementy
                            plans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.map(plan => (
                                        <div key={plan.id} onClick={() => selectPlan(plan)}
                                            className="bg-surfaceDarkGray p-6 rounded-2xl cursor-pointer border border-transparent hover:border-bluePrimary hover:-translate-y-1 transition-all flex items-center gap-4">
                                            <GrPlan className="text-2xl text-bluePrimary flex-shrink-0" />
                                            <div className="flex-grow">
                                                <p className="font-bold text-lg">{plan.name}</p>
                                                <p className="text-xs text-borderGrayHover capitalize">{plan.goal}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Jeśli tablica jest pusta, pokazujemy ten komunikat
                                <div className="text-center py-8">
                                    <p className="mb-4 text-lg text-borderGrayHover">Nie masz jeszcze żadnych planów treningowych.</p>
                                    <p className="mb-6">Dodaj plan, aby móc rejestrować swoje treningi.</p>
                                    <button
                                        onClick={() => navigate('/training/plans')}
                                        className="bg-bluePrimary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                                    >
                                        Przejdź do tworzenia planu
                                    </button>
                                </div>
                            )
                            // --- KONIEC ZMIAN ---
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Select Day & Date</h2>
                        <div className="mb-8">
                            <label htmlFor="workout-date" className="font-semibold text-borderGrayHover mb-2 block">Workout Date</label>
                            <input
                                id="workout-date"
                                type="datetime-local"
                                value={workoutDate}
                                onChange={e => setWorkoutDate(e.target.value)}
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-borderGrayHover mb-2 block">Training Day</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedPlan.days.map(day => (
                                    <div key={day} onClick={() => selectDay(day)}
                                        className="bg-surfaceDarkGray p-6 rounded-2xl cursor-pointer border border-transparent hover:border-bluePrimary hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
                                        <FaRegCalendarAlt className="text-2xl text-bluePrimary" />
                                        <p className="font-bold text-lg capitalize">{day.toLowerCase()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <FillWorkoutForm
                        plan={selectedPlan}
                        day={selectedDay}
                        date={workoutDate}
                        onSave={handleSaveWorkout}
                    />
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary p-4 sm:p-8 flex flex-col">
            <div className="w-full max-w-5xl mx-auto">
                <button
                    onClick={handleGoBack}
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="go back"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </button>

                <div className="bg-surfaceDarkGray rounded-2xl p-6 sm:p-10 shadow-lg">
                    <Stepper currentStep={step} />
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
}