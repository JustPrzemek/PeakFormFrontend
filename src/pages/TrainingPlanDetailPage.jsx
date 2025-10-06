import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlanDetails, removeExerciseFromPlan, updateExerciseInPlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaPencilAlt, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';
import Footer from "../components/Footer";
import { GrPlan } from "react-icons/gr";
import { makeActivePlan } from '../services/userProfileService';

export default function TrainingPlanDetailPage() {
    const { planId } = useParams();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(null);

    const [editingExerciseId, setEditingExerciseId] = useState(null);
    const [editingData, setEditingData] = useState({ sets: '', reps: '', restTime: '' });
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

     const fetchPlanDetails = async () => {
        try {
            const data = await getPlanDetails(planId);
            setPlan(data);
            if (data.days && Object.keys(data.days).length > 0) {
                // Jeśli aktywny dzień nie jest już poprawny, ustaw pierwszy z listy
                if (!activeDay || !data.days[activeDay]) {
                    setActiveDay(Object.keys(data.days).sort()[0]);
                }
            }
        } catch (error) {
            toast.error("Failed to fetch plan details.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchPlanDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId]);

    const handleStartEditing = (exercise) => {
        setEditingExerciseId(exercise.id);
        setEditingData({
            sets: exercise.sets,
            reps: exercise.reps,
            restTime: exercise.restTime
        });
    };

    const handleCancelEditing = () => {
        setEditingExerciseId(null);
        setEditingData({ sets: '', reps: '', restTime: '' });
    };

    const handleEditingChange = (e) => {
        const { name, value } = e.target;
        setEditingData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateConfirm = async () => {
        if (!editingExerciseId) return;
        
        const updateDto = {
            sets: parseInt(editingData.sets, 10),
            reps: parseInt(editingData.reps, 10),
            restTime: parseInt(editingData.restTime, 10)
        };
        
        try {
            const updatedPlan = await updateExerciseInPlan(planId, editingExerciseId, updateDto);
            setPlan(updatedPlan); // API zwraca cały zaktualizowany plan, więc po prostu go ustawiamy
            toast.success("Exercise updated successfully!");
            handleCancelEditing();
        } catch (error) {
            toast.error(error.toString());
        }
    };


    // --- Obsługa Usuwania ---
    const handleOpenDeleteModal = (exercise) => {
        setExerciseToDelete(exercise);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!exerciseToDelete) return;
        try {
            await removeExerciseFromPlan(planId, exerciseToDelete.id);
            // Ręczna aktualizacja stanu, aby uniknąć ponownego pobierania danych
            setPlan(currentPlan => {
                const newDays = { ...currentPlan.days };
                const dayExercises = newDays[activeDay].filter(ex => ex.id !== exerciseToDelete.id);
                
                if (dayExercises.length > 0) {
                    newDays[activeDay] = dayExercises;
                } else {
                    // Jeśli to było ostatnie ćwiczenie danego dnia, usuń cały dzień
                    delete newDays[activeDay];
                    // Ustaw aktywny dzień na null lub pierwszy dostępny
                    setActiveDay(Object.keys(newDays).length > 0 ? Object.keys(newDays).sort()[0] : null);
                }

                return { ...currentPlan, days: newDays };
            });
            toast.success("Exercise removed from the plan.");
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setDeleteModalOpen(false);
            setExerciseToDelete(null);
        }
    };

    const handleMakeActive = async () => {
        try {
            const dto = { planId: planId };
            await makeActivePlan(dto);
            setPlan(currentPlan => ({ ...currentPlan, active: true }));
            toast.success("Plan has been set as active!");

        } catch (error) {
            toast.error("Failed to set active plan.");
            console.error(error);
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading plan details...</div>;
    }

    if (!plan) {
        return <div className="text-center mt-20">Plan not found.</div>;
    }

    const sortedDays = plan.days ? Object.keys(plan.days).sort() : [];

    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <div className="container mx-auto p-8 flex-grow">
                <Link to="/training/plans" className="flex items-center text-bluePrimary hover:text-blueLight mb-8">
                    <button>
                            <FaArrowLeft 
                                className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" 
                            />
                    </button>
                </Link>
                
                <div className="bg-surfaceDarkGray text-whitePrimary rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-baseline mb-2">
                        <h1 className="text-4xl font-bold flex items-baseline mb-2 gap-3 "><GrPlan /> {plan.name}</h1>
                        <div className="flex items-center gap-4">
                            {plan.active ? 
                                (
                                    <button
                                        disabled 
                                        className="flex items-center bg-green-500 text-whitePrimary font-bold py-2 px-4 rounded-lg transition duration-300 cursor-not-allowed opacity-90"
                                    >
                                    Active
                                    </button>
                                ) : (
                                    <button
                                        className="flex items-center bg-bluePrimary text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-blueHover transition duration-300 cursor-pointer"
                                        onClick={handleMakeActive}
                                    >
                                        Make Active
                                    </button>
                                )
                            }
                            
                        <Link to="/training/exercises">
                            <button
                                className="flex items-center bg-bluePrimary text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-blueHover transition duration-300 cursor-pointer"
                            >
                                <FaPlus className="mr-2" />
                                Add exercises
                            </button>
                        </Link>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-8">{plan.description}</p>

                    {sortedDays.length > 0 ? (
                        <>
                            <div className="border-b border-borderGrayHover mb-6">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    {sortedDays.map((dayKey) => (
                                        <button
                                            key={dayKey} onClick={() => setActiveDay(dayKey)}
                                            className={`${activeDay === dayKey ? 'border-bluePrimary text-bluePrimary' : 'border-transparent text-borderGrayHover hover:text-borderGrayHover hover:border-borderGrayHover'} cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            {dayKey.replace('_', ' ')}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            <div>
                                {activeDay && plan.days[activeDay] ? (
                                    <div className="space-y-6">
                                        {plan.days[activeDay].map((exercise) => (
                                            <div key={exercise.id} className="relative p-4 border border-borderGrayHover rounded-lg group">
                                                <Link to={`/training/exercises/${exercise.exerciseId}`}>
                                                    <h3 className="text-xl font-semibold text-bluePrimary pr-20 hover:text-blueLight">{exercise.exerciseName}</h3>
                                                </Link>
                                                
                                                {editingExerciseId === exercise.id ? (
                                                    // --- WIDOK EDYCJI ---
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                                                        <div className="flex flex-col">
                                                            <label htmlFor={`sets-${exercise.id}`} className="font-bold text-xs text-borderGrayHover mb-1">Sets:</label>
                                                            <input id={`sets-${exercise.id}`} type="number" name="sets" value={editingData.sets} onChange={handleEditingChange} className="p-1 border border-borderGrayHover rounded w-full" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label htmlFor={`reps-${exercise.id}`} className="font-bold text-xs text-borderGrayHover mb-1">Reps:</label>
                                                            <input id={`reps-${exercise.id}`} type="number" name="reps" value={editingData.reps} onChange={handleEditingChange} className="p-1 border border-borderGrayHover rounded w-full" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label htmlFor={`rest-${exercise.id}`} className="font-bold text-xs text-borderGrayHover mb-1">Rest Time (s):</label>
                                                            <input id={`rest-${exercise.id}`} type="number" name="restTime" value={editingData.restTime} onChange={handleEditingChange} className="p-1 border border-borderGrayHover rounded w-full" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // --- WIDOK WYŚWIETLANIA ---
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                                                        <div><span className="font-bold">Sets:</span> {exercise.sets}</div>
                                                        <div><span className="font-bold">Reps:</span> {exercise.reps}</div>
                                                        <div><span className="font-bold">Rest Time:</span> {exercise.restTime}s</div>
                                                    </div>
                                                )}

                                                {/* --- PRZYCISKI AKCJI --- */}
                                                <div className="absolute top-4 right-4 flex items-center space-x-3">
                                                    {editingExerciseId === exercise.id ? (
                                                        <>
                                                            <button onClick={handleUpdateConfirm} className="text-green-500 hover:text-green-700 cursor-pointer" title="Save"><FaSave size={18} /></button>
                                                            <button onClick={handleCancelEditing} className="text-gray-500 hover:text-gray-700 cursor-pointer" title="Cancel"><FaTimes size={20} /></button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleStartEditing(exercise)} className="text-bluePrimary hover:text-blueLight cursor-pointer" title="Edit"><FaPencilAlt size={16} /></button>
                                                            <button onClick={() => handleOpenDeleteModal(exercise)} className="text-red-500 hover:text-red-700 cursor-pointer" title="Delete"><FaTrash size={16} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Select a day to see the exercises.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-whitePrimary mt-8">This plan is empty. Add exercises from your library!</p>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Confirm deletion"
                    message={`Are you sure you want to delete the exercise "${exerciseToDelete?.exerciseName}" from this day?`}
                />
            </div>
            <Footer/>
        </div>
    );
}