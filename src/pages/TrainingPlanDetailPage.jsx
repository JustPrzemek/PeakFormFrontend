import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlanDetails, removeExerciseFromPlan, updateExerciseInPlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaPencilAlt, FaTrash, FaSave, FaTimes, FaPlus, FaDumbbell, FaCheckCircle, FaHeartbeat, FaRunning } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';
import Footer from "../components/Footer";
import { GrPlan } from "react-icons/gr";
import { makeActivePlan } from '../services/userProfileService';
import { CgSpinner } from 'react-icons/cg';

const PlanDetailSkeleton = () => (
    <div className="container mx-auto p-4 sm:p-8 animate-pulse">
        <div className="h-10 w-10 bg-surfaceDarkGray rounded-lg mb-8"></div>
        <div className="h-10 bg-surfaceDarkGray rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-surfaceDarkGray rounded w-3/4 mb-10"></div>
        <div className="bg-surfaceDarkGray rounded-2xl p-6">
            <div className="flex gap-2 mb-6">
                <div className="h-8 w-24 bg-borderGrayHover/30 rounded-full"></div>
                <div className="h-8 w-24 bg-borderGrayHover/30 rounded-full"></div>
            </div>
            <div className="space-y-3">
                <div className="h-12 w-full bg-borderGrayHover/30 rounded-lg"></div>
                <div className="h-12 w-full bg-borderGrayHover/30 rounded-lg"></div>
                <div className="h-12 w-full bg-borderGrayHover/30 rounded-lg"></div>
            </div>
        </div>
    </div>
);

export default function TrainingPlanDetailPage() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(null);
    const [editingExerciseId, setEditingExerciseId] = useState(null);
    
    const [editingData, setEditingData] = useState({ 
        sets: '', reps: '', restTime: '',
        durationMinutes: '', distanceKm: '' 
    });

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
            sets: exercise.sets || '',
            reps: exercise.reps || '',
            restTime: exercise.restTime || '',
            durationMinutes: exercise.durationMinutes || '',
            distanceKm: exercise.distanceKm || ''
        });
    };

    const handleCancelEditing = () => {
        setEditingExerciseId(null);
        setEditingData({ sets: '', reps: '', restTime: '', durationMinutes: '', distanceKm: '' });
    };

    const handleEditingChange = (e) => {
        const { name, value } = e.target;
        setEditingData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateConfirm = async () => {
        if (!editingExerciseId) return;

        const exerciseToUpdate = plan.days[activeDay].find(ex => ex.id === editingExerciseId);
        if (!exerciseToUpdate) return;
        
        let updateDto = {};
        if (exerciseToUpdate.exerciseType === 'STRENGTH') {
            updateDto = {
                sets: parseInt(editingData.sets, 10),
                reps: parseInt(editingData.reps, 10),
                restTime: parseInt(editingData.restTime, 10)
            };
        } else if (exerciseToUpdate.exerciseType === 'CARDIO') {
            updateDto = {
                durationMinutes: parseInt(editingData.durationMinutes, 10),
                distanceKm: parseFloat(editingData.distanceKm)
            };
        }
        
        try {
            const updatedPlan = await updateExerciseInPlan(planId, editingExerciseId, updateDto);
            setPlan(updatedPlan);
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

    if (loading) return <PlanDetailSkeleton />;
    if (!plan) return <div className="text-center mt-20 text-whitePrimary">Plan not found.</div>;

    const sortedDays = plan.days ? Object.keys(plan.days).sort() : [];

    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                <Link to="/training/plans" className="inline-block mb-8 text-bluePrimary">
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                {/* --- NOWY NAGŁÓWEK PLANU --- */}
                <header className="mb-10">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-whitePrimary flex items-center gap-3">
                                <GrPlan /> {plan.name}
                            </h1>
                            <p className="text-borderGrayHover mt-2">{plan.description || "No description for this plan."}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {plan.active ? (
                                <span className="flex items-center bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-lg text-sm">
                                    <FaCheckCircle className="mr-2"/> Active Plan
                                </span>
                            ) : (
                                <button onClick={handleMakeActive} className="bg-bluePrimary text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-blueHover transition-colors duration-300 text-sm">
                                    Set as Active
                                </button>
                            )}
                            <button onClick={() => navigate('/training/exercises')} className="bg-surfaceDarkGray border border-borderGrayHover text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-borderGrayHover transition-colors duration-300 text-sm">
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* --- GŁÓWNA TREŚĆ: DNI I ĆWICZENIA --- */}
                {sortedDays.length > 0 ? (
                    <div className="bg-surfaceDarkGray rounded-2xl p-6">
                        {/* --- NOWOCZESNE TABY --- */}
                        <nav className="flex flex-wrap gap-2 mb-6">
                            {sortedDays.map((dayKey) => (
                                <button
                                    key={dayKey} onClick={() => setActiveDay(dayKey)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                        activeDay === dayKey ? 'bg-bluePrimary text-white' : 'bg-backgoudBlack text-borderGrayHover hover:bg-borderGrayHover hover:text-whitePrimary'
                                    }`}
                                >
                                    {dayKey.replace('_', ' ')}
                                </button>
                            ))}
                        </nav>

                        {/* --- NOWA TABELA Z ĆWICZENIAMI --- */}
                        <div className="overflow-x-auto">
                            <div className="min-w-[700px]"> {/* Lekko poszerzamy min-width */}
                                {/* Dynamiczne nagłówki tabeli */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-borderGrayHover uppercase tracking-wider">
                                    <div className="col-span-5">Exercise</div>
                                    <div className="col-span-6">Details</div>
                                    <div className="col-span-1 text-right">Actions</div>
                                </div>
                                {/* Wiersze tabeli */}
                                <div className="space-y-2">
                                {activeDay && plan.days[activeDay]?.map((exercise) => (
                                    <div key={exercise.id} className="grid grid-cols-12 gap-4 items-center bg-backgoudBlack p-4 rounded-lg group">
                                    {editingExerciseId === exercise.id ? (
                                        <> {/* --- WIDOK EDYCJI --- */}
                                            <div className="col-span-5 font-semibold text-bluePrimary">{exercise.exerciseName}</div>
                                            <div className="col-span-6">
                                                {exercise.exerciseType === 'STRENGTH' ? (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" name="sets" placeholder="Sets" value={editingData.sets} onChange={handleEditingChange} className="w-full p-2 bg-borderGrayHover/20 rounded text-center" />
                                                        <input type="number" name="reps" placeholder="Reps" value={editingData.reps} onChange={handleEditingChange} className="w-full p-2 bg-borderGrayHover/20 rounded text-center" />
                                                        <input type="number" name="restTime" placeholder="Rest (s)" value={editingData.restTime} onChange={handleEditingChange} className="w-full p-2 bg-borderGrayHover/20 rounded text-center" />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input type="number" name="durationMinutes" placeholder="Mins" value={editingData.durationMinutes} onChange={handleEditingChange} className="w-full p-2 bg-borderGrayHover/20 rounded text-center" />
                                                        <input type="number" step="0.1" name="distanceKm" placeholder="KM" value={editingData.distanceKm} onChange={handleEditingChange} className="w-full p-2 bg-borderGrayHover/20 rounded text-center" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-1 flex items-center justify-end gap-3">
                                                <button onClick={handleUpdateConfirm} title="Save"><FaSave className="text-green-500 hover:text-green-400" /></button>
                                                <button onClick={handleCancelEditing} title="Cancel"><FaTimes className="text-gray-500 hover:text-white" /></button>
                                            </div>
                                        </>
                                    ) : (
                                        <> {/* --- WIDOK WYŚWIETLANIA --- */}
                                            <div className="col-span-5 font-semibold text-whitePrimary flex items-center gap-3">
                                               {exercise.exerciseType === 'STRENGTH' ? 
                                                    <FaDumbbell className="text-bluePrimary/50"/> :
                                                    <FaRunning className="text-green-400/50"/>
                                               }
                                                <span className="hover:underline cursor-pointer" onClick={() => navigate(`/training/exercises/${exercise.exerciseId}`)}>
                                                    {exercise.exerciseName}
                                                </span>
                                            </div>
                                            <div className="col-span-6 text-center text-borderGrayHover flex items-center justify-start text-sm">
                                                {exercise.exerciseType === 'STRENGTH' ? (
                                                    <div className="flex gap-4">
                                                        <span><span className="font-bold text-whitePrimary">{exercise.sets}</span> sets</span>
                                                        <span><span className="font-bold text-whitePrimary">{exercise.reps}</span> reps</span>
                                                        <span><span className="font-bold text-whitePrimary">{exercise.restTime}</span>s rest</span>
                                                    </div>
                                                ) : (
                                                     <div className="flex gap-4">
                                                        <span><span className="font-bold text-whitePrimary">{exercise.durationMinutes}</span> min</span>
                                                        {exercise.distanceKm && <span><span className="font-bold text-whitePrimary">{exercise.distanceKm}</span> km</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-1 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleStartEditing(exercise)} title="Edit"><FaPencilAlt className="text-borderGrayHover hover:text-white" /></button>
                                                <button onClick={() => handleOpenDeleteModal(exercise)} title="Delete"><FaTrash className="text-borderGrayHover hover:text-red-500" /></button>
                                            </div>
                                        </>
                                    )}
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover">
                        <FaDumbbell className="mx-auto text-5xl text-borderGrayHover mb-4" />
                        <h2 className="text-2xl font-bold text-whitePrimary">This plan is empty</h2>
                        <p className="text-borderGrayHover mt-2 mb-6 max-w-md mx-auto">Add some exercises from the library to get started.</p>
                        <button onClick={() => navigate('/training/exercises')} className="flex items-center mx-auto bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors">
                            <FaPlus className="mr-2" />
                            Add Exercises
                        </button>
                    </div>
                )}
            </main>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm deletion"
                message={`Are you sure you want to delete "${exerciseToDelete?.exerciseName}" from this day?`}
            />

            <Footer />
        </div>
    );
}