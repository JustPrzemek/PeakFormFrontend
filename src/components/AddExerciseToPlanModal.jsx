import { useState, useEffect } from 'react';
import { getUserPlans, addExerciseToPlan, createCustomPlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import { CgSpinner } from "react-icons/cg";

const getInitialFormData = (exerciseType) => {
    const baseData = {
        planId: '',
        dayIdentifier: '',
    };
    if (exerciseType === 'STRENGTH') {
        return { ...baseData, sets: 3, reps: 10, restTime: 60 };
    }
    if (exerciseType === 'CARDIO') {
        return { ...baseData, durationMinutes: 30, distanceKm: 5.0 };
    }
    return baseData;
};

export default function AddExerciseToPlanModal({ isOpen, onClose, exercise }) {
    const [userPlans, setUserPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreatePlan, setShowCreatePlan] = useState(false);

    const [formData, setFormData] = useState(getInitialFormData(exercise?.type));
    
    const [newPlanData, setNewPlanData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (isOpen && exercise) {
            // Reset stanu przy każdym otwarciu
            setIsLoading(true);
            setShowCreatePlan(false);
            setFormData(getInitialFormData(exercise.type));

            const fetchUserPlans = async () => {
                try {
                    const plans = await getUserPlans();
                    setUserPlans(plans);
                    if (plans.length > 0) {
                        // Automatycznie wybierz pierwszy plan
                        setFormData(prev => ({ ...prev, planId: plans[0].id }));
                    } else {
                        // Jeśli nie ma planów, pokaż formularz tworzenia
                        setShowCreatePlan(true);
                    }
                } catch (error) {
                    toast.error("Your plans could not be downloaded.");
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserPlans();
        }
    }, [isOpen, exercise]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewPlanChange = (e) => {
        const { name, value } = e.target;
        setNewPlanData(prev => ({ ...prev, [name]: value }));
    }

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        if (!newPlanData.name.trim()) {
            toast.error("The name of the new plan is required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const createdPlan = await createCustomPlan({ ...newPlanData, setActive: false });
            toast.success(`Plan "${createdPlan.name}" has been created!`);
            const newPlans = [...userPlans, { id: createdPlan.id, name: createdPlan.name }];
            setUserPlans(newPlans);         
            setFormData(prev => ({ ...prev, planId: createdPlan.id })); // Wybierz nowy plan
            setShowCreatePlan(false); // Wróć do formularza dodawania ćwiczenia
            setNewPlanData({ name: '', description: '' });
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.planId) {
            toast.error("Choose a training plan.");
            return;
        }
        if (!formData.dayIdentifier.trim()) {
            toast.error("Specify a training day (e.g. 'A-Day', 'Legs').");
            return;
        }

        setIsSubmitting(true);
        const requestDto = {
            exerciseId: exercise.id,
            dayIdentifier: formData.dayIdentifier,
        };
        
        if (exercise.type === 'STRENGTH') {
            requestDto.sets = parseInt(formData.sets, 10);
            requestDto.reps = parseInt(formData.reps, 10);
            requestDto.restTime = parseInt(formData.restTime, 10);
        } else if (exercise.type === 'CARDIO') {
            requestDto.durationMinutes = parseInt(formData.durationMinutes, 10);
            if (formData.distanceKm) { // Dystans może być opcjonalny
                requestDto.distanceKm = parseFloat(formData.distanceKm);
            }
        }

        try {
            await addExerciseToPlan(formData.planId, requestDto);
            const selectedPlan = userPlans.find(p => p.id == formData.planId);
            toast.success(`Addded "${exercise.name}" to plan "${selectedPlan.name}"!`);
            onClose();
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const inputStyles = "mt-1 block w-full p-3 bg-backgoudBlack border border-borderGrayHover rounded-lg text-whitePrimary focus:outline-none focus:ring-2 focus:ring-bluePrimary transition";
    const buttonStyles = "px-4 py-2 rounded-md cursor-pointer transition-colors";
    const primaryButtonStyles = `${buttonStyles} bg-bluePrimary hover:bg-opacity-90 text-whitePrimary disabled:bg-opacity-50 disabled:cursor-not-allowed`;
    const secondaryButtonStyles = `${buttonStyles} bg-borderGrayHover hover:bg-opacity-80 text-whitePrimary`;

    return (
        <div className="fixed inset-0 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-whitePrimary">Add "<span className="text-bluePrimary">{exercise.name}</span>" to plan</h2>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                         <CgSpinner className="animate-spin text-bluePrimary text-4xl" />
                    </div>
                ) : showCreatePlan ? (
                    // Widok tworzenia planu
                    <div>
                        <p className="text-borderGrayHover mb-4">You don't have a plan yet. Create one first to continue.</p>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div>
                                <label htmlFor="newPlanName" className="block text-sm font-medium text-borderGrayHover">New plan name</label>
                                <input type="text" id="newPlanName" name="name" value={newPlanData.name} onChange={handleNewPlanChange} className={inputStyles} required />
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className={secondaryButtonStyles}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={primaryButtonStyles}>{isSubmitting ? 'Creating...' : 'Create and continue'}</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Widok dodawania ćwiczenia
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="planId" className="block text-sm font-medium text-borderGrayHover">Choose a plan</label>
                            <select id="planId" name="planId" value={formData.planId} onChange={handleFormChange} className={inputStyles}>
                                {userPlans.map(plan => (
                                    <option className="bg-surfaceDarkGray text-whitePrimary" key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={() => setShowCreatePlan(true)} className="text-sm text-bluePrimary hover:underline mt-2 cursor-pointer">Or create a new plan</button>
                        </div>
                        <div>
                            <label htmlFor="dayIdentifier" className="block text-sm font-medium text-borderGrayHover">Training Day (e.g. Push, Legs, A)</label>
                            <input type="text" id="dayIdentifier" name="dayIdentifier" value={formData.dayIdentifier} onChange={handleFormChange} className={inputStyles} required />
                        </div>
                        
                        {/* KROK 2: Warunkowe renderowanie pól */}
                        {exercise?.type === 'STRENGTH' && (
                             <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="sets" className="block text-sm font-medium text-borderGrayHover">Sets</label>
                                    <input type="number" id="sets" name="sets" min="1" value={formData.sets} onChange={handleFormChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label htmlFor="reps" className="block text-sm font-medium text-borderGrayHover">Reps</label>
                                    <input type="number" id="reps" name="reps" min="1" value={formData.reps} onChange={handleFormChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label htmlFor="restTime" className="block text-sm font-medium text-borderGrayHover">Rest (s)</label>
                                    <input type="number" id="restTime" name="restTime" min="0" step="5" value={formData.restTime} onChange={handleFormChange} className={inputStyles} />
                                </div>
                            </div>
                        )}

                        {exercise?.type === 'CARDIO' && (
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="durationMinutes" className="block text-sm font-medium text-borderGrayHover">Duration (min)</label>
                                    <input type="number" id="durationMinutes" name="durationMinutes" min="1" value={formData.durationMinutes} onChange={handleFormChange} className={inputStyles} />
                                </div>
                                <div>
                                    <label htmlFor="distanceKm" className="block text-sm font-medium text-borderGrayHover">Distance (km)</label>
                                    <input type="number" id="distanceKm" name="distanceKm" min="0" step="0.1" value={formData.distanceKm} onChange={handleFormChange} className={inputStyles} />
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-4 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className={secondaryButtonStyles}>Cancel</button>
                            <button type="submit" disabled={isSubmitting} className={primaryButtonStyles}>
                                {isSubmitting ? (
                                    <span className="flex items-center"><CgSpinner className="animate-spin mr-2" /> Adding...</span>
                                ) : 'Add exercise'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}