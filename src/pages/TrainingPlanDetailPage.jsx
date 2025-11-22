import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlanDetails, removeExerciseFromPlan, updateExerciseInPlan, updatePlanDetails } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaPencilAlt, FaTrash, FaSave, FaTimes, FaPlus, FaDumbbell, FaCheckCircle, FaRunning } from 'react-icons/fa';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Footer from "../components/Footer";
import { GrPlan } from "react-icons/gr";
import { makeActivePlan } from '../services/userProfileService';
import { CgSpinner } from 'react-icons/cg';

// --- SKELETON ---
const PlanDetailSkeleton = () => (
    <div className="bg-backgoudBlack min-h-screen">
        <div className="container mx-auto p-4 sm:p-8 animate-pulse">
            <div className="h-10 w-10 bg-surfaceDarkGray rounded-lg mb-8"></div>
            <div className="h-10 bg-surfaceDarkGray rounded w-3/4 md:w-1/2 mb-4"></div>
            <div className="h-4 bg-surfaceDarkGray rounded w-full md:w-3/4 mb-10"></div>
            <div className="bg-surfaceDarkGray rounded-2xl p-6">
                <div className="flex gap-3 mb-6 overflow-hidden">
                    <div className="h-10 w-24 bg-borderGrayHover/30 rounded-full flex-shrink-0"></div>
                    <div className="h-10 w-24 bg-borderGrayHover/30 rounded-full flex-shrink-0"></div>
                    <div className="h-10 w-24 bg-borderGrayHover/30 rounded-full flex-shrink-0"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-16 w-full bg-borderGrayHover/30 rounded-lg"></div>
                    <div className="h-16 w-full bg-borderGrayHover/30 rounded-lg"></div>
                    <div className="h-16 w-full bg-borderGrayHover/30 rounded-lg"></div>
                </div>
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
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Edycja ćwiczenia
    const [editingExerciseId, setEditingExerciseId] = useState(null);
    const [editingData, setEditingData] = useState({ 
        sets: '', reps: '', restTime: '',
        durationMinutes: '', distanceKm: '' 
    });

    // Usuwanie
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

    // Edycja planu
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [planEditData, setPlanEditData] = useState({ name: '', description: '', goal: '' });

    const fetchPlanDetails = async () => {
        try {
            const data = await getPlanDetails(planId);
            setPlan(data);
            if (data.days && Object.keys(data.days).length > 0) {
                if (!activeDay || !data.days[activeDay]) {
                    setActiveDay(Object.keys(data.days).sort()[0]);
                }
            }
        } catch (error) {
            toast.error("Failed to fetch plan details.");
            console.error(error);
            navigate("/training/plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchPlanDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planId]);

    // --- HANDLERS ---
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

    const handleOpenDeleteModal = (exercise) => {
        setExerciseToDelete(exercise);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!exerciseToDelete) return;
        try {
            await removeExerciseFromPlan(planId, exerciseToDelete.id);
            await fetchPlanDetails(); 
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

    const handleStartPlanEditing = () => {
        setPlanEditData({
            name: plan.name,
            description: plan.description || '',
            goal: plan.goal || 'maintenance'
        });
        setIsEditingPlan(true);
    };

    const handleCancelPlanEditing = () => setIsEditingPlan(false);

    const handlePlanEditChange = (e) => {
        const { name, value } = e.target;
        setPlanEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdatePlanConfirm = async () => {
        setIsUpdating(true);
        try {
            if (!planEditData.name.trim()) {
                toast.error("Plan name cannot be empty.");
                return;
            }
            const updatedPlan = await updatePlanDetails(planId, planEditData);
            setPlan(updatedPlan);
            setIsEditingPlan(false);
            toast.success("Plan details updated!");
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <PlanDetailSkeleton />;
    if (!plan) return <div className="text-center mt-20 text-whitePrimary">Plan not found.</div>;

    const sortedDays = plan.days ? Object.keys(plan.days).sort() : [];

    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                
                {/* Przycisk Powrotu */}
                <Link to="/training/plans" className="inline-block mb-6 text-bluePrimary">
                    <FaArrowLeft className="text-3xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                {/* --- NAGŁÓWEK PLANU --- */}
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                        
                        {isEditingPlan ? (
                            // --- TRYB EDYCJI PLANU ---
                            <div className="w-full bg-surfaceDarkGray p-6 rounded-2xl border border-bluePrimary/30">
                                <h3 className="text-xl font-bold mb-4 text-bluePrimary">Edit Plan Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-borderGrayHover block mb-1" htmlFor="name">Plan Name</label>
                                        <input type="text" name="name" id="name" value={planEditData.name} onChange={handlePlanEditChange}
                                            className="w-full text-lg font-bold text-whitePrimary bg-backgoudBlack border border-borderGrayHover rounded-lg p-3 focus:border-bluePrimary outline-none" maxLength={50} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-borderGrayHover block mb-1" htmlFor="description">Description</label>
                                        <textarea name="description" id="description" value={planEditData.description} onChange={handlePlanEditChange} rows="3"
                                            className="w-full text-sm text-whitePrimary bg-backgoudBlack border border-borderGrayHover rounded-lg p-3 focus:border-bluePrimary outline-none" placeholder="Describe your plan..." maxLength={500} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-borderGrayHover block mb-1" htmlFor="goal">Goal</label>
                                        <select name="goal" id="goal" value={planEditData.goal} onChange={handlePlanEditChange}
                                            className="w-full text-sm text-whitePrimary bg-backgoudBlack border border-borderGrayHover rounded-lg p-3 focus:border-bluePrimary outline-none">
                                            <option value="reduction">Reduction</option>
                                            <option value="bulk">Bulk</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button onClick={handleCancelPlanEditing} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition">Cancel</button>
                                        <button onClick={handleUpdatePlanConfirm} disabled={isUpdating} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-500 transition flex items-center gap-2">
                                            {isUpdating ? <CgSpinner className="animate-spin"/> : <FaSave />} Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // --- TRYB WYŚWIETLANIA PLANU ---
                            <>
                                <div className="min-w-0 w-full lg:w-2/3">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-whitePrimary flex items-center gap-3 break-words">
                                            <GrPlan className="flex-shrink-0 text-bluePrimary" />
                                            <span>{plan.name}</span>
                                        </h1>
                                        <span className="bg-borderGrayHover/20 text-borderGrayHover px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold">
                                            {plan.goal || 'General'}
                                        </span>
                                    </div>
                                    <p className="text-borderGrayHover text-sm md:text-base leading-relaxed break-words">
                                        {plan.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Przyciski Akcji */}
                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    {plan.active ? (
                                        <span className="flex items-center justify-center bg-green-500/20 text-green-400 font-bold py-3 px-6 rounded-lg text-sm border border-green-500/30 w-full sm:w-auto">
                                            <FaCheckCircle className="mr-2"/> Active Plan
                                        </span>
                                    ) : (
                                        <button onClick={handleMakeActive} className="bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors text-sm w-full sm:w-auto">
                                            Set as Active
                                        </button>
                                    )}
                                    <button onClick={handleStartPlanEditing} className="flex items-center justify-center gap-2 bg-surfaceDarkGray border border-borderGrayHover text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-borderGrayHover transition-colors text-sm w-full sm:w-auto">
                                        <FaPencilAlt /> Edit
                                    </button>
                                    <button onClick={() => navigate('/training/exercises')} className="flex items-center justify-center gap-2 bg-surfaceDarkGray border border-borderGrayHover text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-borderGrayHover transition-colors text-sm w-full sm:w-auto">
                                        <FaPlus /> Add Exercises
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>
                
                {/* --- ZAWARTOŚĆ PLANU --- */}
                {sortedDays.length > 0 ? (
                    <div className="bg-surfaceDarkGray rounded-2xl p-4 sm:p-6 shadow-xl">
                        
                        {/* Pasek Dni (Scrollowany na mobile) */}
                        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                            {sortedDays.map((dayKey) => (
                                <button
                                    key={dayKey} onClick={() => setActiveDay(dayKey)}
                                    className={`px-5 py-2.5 text-sm font-bold rounded-full whitespace-nowrap transition-all ${
                                        activeDay === dayKey 
                                            ? 'bg-bluePrimary text-white shadow-lg shadow-bluePrimary/20' 
                                            : 'bg-backgoudBlack text-borderGrayHover hover:bg-borderGrayHover/20 hover:text-white'
                                    }`}
                                >
                                    {dayKey.replace('_', ' ')}
                                </button>
                            ))}
                        </nav>

                        {/* --- LISTA ĆWICZEŃ --- */}
                        <div className="space-y-3">
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-borderGrayHover uppercase tracking-wider">
                                <div className="col-span-5">Exercise</div>
                                <div className="col-span-6">Details</div>
                                <div className="col-span-1 text-right">Actions</div>
                            </div>

                            {activeDay && plan.days[activeDay]?.map((exercise) => (
                                <div key={exercise.id} className="bg-backgoudBlack rounded-xl p-4 border border-transparent hover:border-borderGrayHover/30 transition-all group">
                                    
                                    {editingExerciseId === exercise.id ? (
                                        // --- TRYB EDYCJI ĆWICZENIA (RESPONSYWNY) ---
                                        <div className="flex flex-col gap-4">
                                            <div className="font-bold text-bluePrimary text-lg">{exercise.exerciseName}</div>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {exercise.exerciseType === 'STRENGTH' ? (
                                                    <>
                                                        <div><label className="text-xs text-borderGrayHover">Sets</label><input type="number" name="sets" value={editingData.sets} onChange={handleEditingChange} className="w-full p-2 bg-surfaceDarkGray rounded text-white border border-borderGrayHover" /></div>
                                                        <div><label className="text-xs text-borderGrayHover">Reps</label><input type="number" name="reps" value={editingData.reps} onChange={handleEditingChange} className="w-full p-2 bg-surfaceDarkGray rounded text-white border border-borderGrayHover" /></div>
                                                        <div><label className="text-xs text-borderGrayHover">Rest (s)</label><input type="number" name="restTime" value={editingData.restTime} onChange={handleEditingChange} className="w-full p-2 bg-surfaceDarkGray rounded text-white border border-borderGrayHover" /></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div><label className="text-xs text-borderGrayHover">Minutes</label><input type="number" name="durationMinutes" value={editingData.durationMinutes} onChange={handleEditingChange} className="w-full p-2 bg-surfaceDarkGray rounded text-white border border-borderGrayHover" /></div>
                                                        <div><label className="text-xs text-borderGrayHover">KM</label><input type="number" step="0.1" name="distanceKm" value={editingData.distanceKm} onChange={handleEditingChange} className="w-full p-2 bg-surfaceDarkGray rounded text-white border border-borderGrayHover" /></div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2 border-t border-borderGrayHover/20 mt-2">
                                                <button onClick={handleCancelEditing} className="px-3 py-1.5 text-sm text-gray-400 font-bold hover:text-white">Cancel</button>
                                                <button onClick={handleUpdateConfirm} className="px-4 py-1.5 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-500 flex items-center gap-2"><FaSave/> Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        // --- TRYB WYŚWIETLANIA (RESPONSYWNY) ---
                                        <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center">
                                            
                                            {/* Nazwa + Ikona */}
                                            <div className="col-span-5 flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${exercise.exerciseType === 'STRENGTH' ? 'bg-bluePrimary/10 text-bluePrimary' : 'bg-green-500/10 text-green-400'}`}>
                                                    {exercise.exerciseType === 'STRENGTH' ? <FaDumbbell/> : <FaRunning/>}
                                                </div>
                                                <span className="font-bold text-whitePrimary text-lg md:text-base cursor-pointer hover:text-bluePrimary transition" onClick={() => navigate(`/training/exercises/${exercise.exerciseId}`)}>
                                                    {exercise.exerciseName}
                                                </span>
                                            </div>

                                            {/* Szczegóły (Grid na mobile, Flex na desktop) */}
                                            <div className="col-span-6 grid grid-cols-3 md:flex md:gap-6 gap-2 text-sm text-borderGrayHover mt-2 md:mt-0">
                                                {exercise.exerciseType === 'STRENGTH' ? (
                                                    <>
                                                        <div className="bg-surfaceDarkGray md:bg-transparent p-2 md:p-0 rounded flex flex-col md:block text-center md:text-left">
                                                            <span className="block md:inline font-bold text-whitePrimary text-lg md:text-sm">{exercise.sets}</span> 
                                                            <span className="text-xs md:text-sm"> sets</span>
                                                        </div>
                                                        <div className="bg-surfaceDarkGray md:bg-transparent p-2 md:p-0 rounded flex flex-col md:block text-center md:text-left">
                                                            <span className="block md:inline font-bold text-whitePrimary text-lg md:text-sm">{exercise.reps}</span> 
                                                            <span className="text-xs md:text-sm"> reps</span>
                                                        </div>
                                                        <div className="bg-surfaceDarkGray md:bg-transparent p-2 md:p-0 rounded flex flex-col md:block text-center md:text-left">
                                                            <span className="block md:inline font-bold text-whitePrimary text-lg md:text-sm">{exercise.restTime}s</span> 
                                                            <span className="text-xs md:text-sm"> rest</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="bg-surfaceDarkGray md:bg-transparent p-2 md:p-0 rounded flex flex-col md:block text-center md:text-left">
                                                            <span className="block md:inline font-bold text-whitePrimary text-lg md:text-sm">{exercise.durationMinutes}</span> 
                                                            <span className="text-xs md:text-sm"> min</span>
                                                        </div>
                                                        {exercise.distanceKm && (
                                                            <div className="bg-surfaceDarkGray md:bg-transparent p-2 md:p-0 rounded flex flex-col md:block text-center md:text-left">
                                                                <span className="block md:inline font-bold text-whitePrimary text-lg md:text-sm">{exercise.distanceKm}</span> 
                                                                <span className="text-xs md:text-sm"> km</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Akcje (Ikony) */}
                                            <div className="col-span-1 flex items-center justify-end gap-4 md:gap-2 border-t border-borderGrayHover/20 md:border-0 pt-3 md:pt-0 mt-2 md:mt-0">
                                                <button onClick={() => handleStartEditing(exercise)} className="p-2 text-borderGrayHover hover:text-white hover:bg-surfaceDarkGray rounded-full transition md:opacity-0 md:group-hover:opacity-100">
                                                    <FaPencilAlt />
                                                </button>
                                                <button onClick={() => handleOpenDeleteModal(exercise)} className="p-2 text-borderGrayHover hover:text-red-500 hover:bg-surfaceDarkGray rounded-full transition md:opacity-0 md:group-hover:opacity-100">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover">
                        <FaDumbbell className="mx-auto text-5xl text-borderGrayHover mb-4" />
                        <h2 className="text-2xl font-bold text-whitePrimary">This plan is empty</h2>
                        <p className="text-borderGrayHover mt-2 mb-6 max-w-md mx-auto">Add some exercises from the library to get started.</p>
                        <button onClick={() => navigate('/training/exercises')} className="flex items-center mx-auto bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors">
                            <FaPlus className="mr-2" /> Add Exercises
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