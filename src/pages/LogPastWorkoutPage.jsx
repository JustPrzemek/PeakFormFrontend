import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logPastWorkout } from '../services/trainingService';
import { getUserPlans } from '../services/workoutPlanService';
import FillWorkoutForm from '../components/FillWorkoutForm';
import { FaArrowLeft, FaRegCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { GrPlan } from 'react-icons/gr';
import { CgSpinner } from 'react-icons/cg';
import PlanFilterBar from '../components/PlanFilterBar';

// --- Komponent Wskaźnika Postępu (Stepper) ---
const Stepper = ({ currentStep }) => {
    const steps = ["Select Plan", "Select Day & Date", "Log Details"];
    return (
        <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center justify-center">
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

const PlanCard = ({ plan, onClick }) => (
    <div
        onClick={onClick}
        className="relative bg-surfaceDarkGray text-whitePrimary rounded-2xl shadow-lg border border-transparent p-6 cursor-pointer hover:border-bluePrimary hover:-translate-y-1 transition-all duration-300 group"
    >
        {plan.active && (
            <div className="absolute top-4 right-4 flex items-center bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                <FaCheckCircle className="mr-1.5" /> Active
            </div>
        )}
        <h2 className="text-2xl flex items-center gap-3 font-semibold mb-2 pr-20">
            <GrPlan className="text-bluePrimary flex-shrink-0" />
            <span className="flex-1 truncate min-w-0">{plan.name}</span>
        </h2>
        <p className="text-gray-500 text-sm mb-4">
            Created: {new Date(plan.createdAt).toLocaleDateString()}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-borderGrayHover/20 text-borderGrayHover px-2.5 py-1 rounded-full">{plan.days?.length || 0} training days</span>
            <span className="bg-borderGrayHover/20 text-borderGrayHover px-2.5 py-1 rounded-full capitalize">{plan.goal || 'General'}</span>
        </div>
    </div>
);

const PlanCardSkeleton = () => (
    <div className="bg-surfaceDarkGray rounded-2xl p-6 animate-pulse">
        <div className="h-7 w-3/4 bg-borderGrayHover/30 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-borderGrayHover/30 rounded mb-6"></div>
        <div className="flex gap-2">
            <div className="h-5 w-16 bg-borderGrayHover/30 rounded-full"></div>
            <div className="h-5 w-16 bg-borderGrayHover/30 rounded-full"></div>
        </div>
    </div>
);

const EmptyState = ({ onGoToPlans }) => (
    <div className="text-center py-20 px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover col-span-1 md:col-span-2 lg:col-span-3">
        <GrPlan className="mx-auto text-5xl text-borderGrayHover mb-4" />
        <h2 className="text-2xl font-bold text-whitePrimary">No training plans found</h2>
        <p className="text-borderGrayHover mt-2 mb-6 max-w-md mx-auto">No plans match your filters, or you haven't created any yet.</p>
        <button
            onClick={onGoToPlans}
            className="flex items-center mx-auto bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors"
        >
            Create or manage plans
        </button>
    </div>
);

const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
const localDateTime = now.toISOString().slice(0, 16);

export default function LogPastWorkoutPage() {
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [workoutDateStart, setWorkoutDateStart] = useState(localDateTime);
    const [workoutDateEnd, setWorkoutDateEnd] = useState(localDateTime);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filters, setFilters] = useState({ name: '', goal: null, isActive: null });
    const [inputFilters, setInputFilters] = useState({ name: '', goal: null, isActive: null });
    const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' });

    const PAGE_SIZE = 6;

    const loadPlans = useCallback(async (currentPage, currentFilters, currentSort, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const params = {
                ...currentFilters,
                page: currentPage,
                size: PAGE_SIZE,
                sort: currentSort
            };
            
            const data = await getUserPlans(params); 
            
            setPlans(prev => isLoadMore ? [...prev, ...data.content] : data.content);
            setPage(data.number);
            setTotalPages(data.totalPages);
            
        } catch (error) {
            toast.error("Failed to download training plans.");
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

     useEffect(() => {
        if (step === 1) { // Ładuj plany tylko na pierwszym kroku
            loadPlans(0, filters, sort, false); 
        }
    }, [filters, sort, loadPlans, step]);

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
            // Resetuj plany, aby odświeżyć je po powrocie do kroku 1
            if (step === 2) {
                setPlans([]); 
            }
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

    const handleLoadMore = () => {
        const nextPage = page + 1;
        if (nextPage < totalPages && !loadingMore) {
            loadPlans(nextPage, filters, sort, true);
        }
    };

    const handleSortChange = (field) => {
        setSort(prevSort => {
            const isCurrentField = prevSort.field === field;
            const direction = isCurrentField && prevSort.direction === 'asc' ? 'desc' : 'asc';
            return { field, direction };
        });
    };

    const handleFilterChange = (filterName, value, isDebouncing) => {
        setInputFilters(prev => ({ ...prev, [filterName]: value }));
        if (!isDebouncing) {
            setFilters(prev => ({ ...prev, [filterName]: value }));
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-center mb-8">Select a Plan</h2>
                        
                        <PlanFilterBar
                            filters={inputFilters}
                            onFilterChange={handleFilterChange}
                            sort={sort}
                            onSortChange={handleSortChange}
                            loading={loading && plans.length === 0}
                        />

                        {/* --- ZAKTUALIZOWANA LISTA PLANÓW --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {loading && plans.length === 0 ? (
                                <>
                                    <PlanCardSkeleton />
                                    <PlanCardSkeleton />
                                    <PlanCardSkeleton />
                                </>
                            ) : plans.length > 0 ? (
                                <>
                                    {plans.map((plan) => (
                                        <PlanCard 
                                            key={plan.id} 
                                            plan={plan} 
                                            onClick={() => selectPlan(plan)} 
                                        />
                                    ))}
                                </>
                            ) : (
                                <EmptyState onGoToPlans={() => navigate('/training/plans')} />
                            )}
                        </div>

                        {/* --- PRZYCISK LOAD MORE --- */}
                        {!loading && page < totalPages - 1 && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="bg-bluePrimary text-whitePrimary font-bold py-3 px-8 rounded-lg hover:bg-blueHover transition-colors duration-300 disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <>
                                            <CgSpinner className="animate-spin inline-block w-6 h-6 mr-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More Plans'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 2:
                // Ten krok używa `selectedPlan.days`, który jest listą stringów
                // z `WorkoutPlanSummaryDto`, więc jest poprawny.
                return (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Select Day & Date</h2>
                        <div className="mb-8">
                            <label htmlFor="workout-date" className="font-semibold text-borderGrayHover mb-2 block">Workout Date Start</label>
                            <input
                                id="workout-date"
                                type="datetime-local"
                                value={workoutDateStart}
                                onChange={e => setWorkoutDateStart(e.target.value)}
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div className="mb-8">
                            <label htmlFor="workout-date" className="font-semibold text-borderGrayHover mb-2 block">Workout Date End</label>
                            <input
                                id="workout-date"
                                type="datetime-local"
                                value={workoutDateEnd}
                                onChange={e => setWorkoutDateEnd(e.target.value)}
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
                                        <p className="font-bold text-lg capitalize truncate">{day.toLowerCase().replace('_', ' ')}</p>
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
                        dateStart={workoutDateStart}
                        dateEnd={workoutDateEnd}
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