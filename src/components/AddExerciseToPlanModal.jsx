import { useState, useEffect } from 'react';
import { getUserPlans, addExerciseToPlan, createCustomPlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';

export default function AddExerciseToPlanModal({ isOpen, onClose, exercise }) {
    const [userPlans, setUserPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreatePlan, setShowCreatePlan] = useState(false);

    const [formData, setFormData] = useState({
        planId: '',
        dayIdentifier: '',
        sets: 3,
        reps: 10,
        restTime: 60,
    });
    
    // Stan dla formularza tworzenia nowego planu
    const [newPlanData, setNewPlanData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (isOpen) {
            // Reset stanu przy każdym otwarciu
            setIsLoading(true);
            setShowCreatePlan(false);
            setFormData({ planId: '', dayIdentifier: '', sets: 3, reps: 10, restTime: 60 });

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
    }, [isOpen]);

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
            setUserPlans(prev => [...prev, { id: createdPlan.id, name: createdPlan.name }]);
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
            sets: parseInt(formData.sets, 10),
            reps: parseInt(formData.reps, 10),
            restTime: parseInt(formData.restTime, 10),
        };

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

    return (
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-lg shadow-xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-whitePrimary">Add "{exercise.name}" to plan</h2>
                {isLoading ? (
                    <p>Loading plans...</p>
                ) : showCreatePlan ? (
                    // Widok tworzenia planu
                    <div>
                        <p className="text-borderGrayHover mb-4">You don't have a plan yet. Create one first to continue.</p>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                             <div>
                                <label htmlFor="newPlanName" className="block text-sm font-medium text-borderGrayHover">New plan name</label>
                                <input type="text" id="newPlanName" name="name" value={newPlanData.name} onChange={handleNewPlanChange} className="mt-1 block w-full p-2 border text-whitePrimary focus:outline-none focus:ring-1 focus:ring-bluePrimary border-gray-300 rounded-md" required />
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-whitePrimary hover:bg-borderGrayHover rounded-md cursor-pointer">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-md disabled:bg-green-300 cursor-pointer">{isSubmitting ? 'Creating...' : 'Create and continue'}</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Widok dodawania ćwiczenia
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="planId" className="block text-sm font-medium text-borderGrayHover">Choose a plan</label>
                            <select id="planId" name="planId" value={formData.planId} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-whitePrimary cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-bluePrimary focus:text-borderGrayHover">
                                {userPlans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={() => setShowCreatePlan(true)} className="text-sm text-bluePrimary hover:underline mt-1 cursor-pointer">Create new plan</button>
                        </div>
                        <div>
                            <label htmlFor="dayIdentifier" className="block text-sm font-medium text-borderGrayHover">Training Day (e.g. Push, Legs, A-Day)</label>
                            <input type="text" id="dayIdentifier" name="dayIdentifier" value={formData.dayIdentifier} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 text-whitePrimary focus:outline-none focus:ring-1 focus:ring-bluePrimary rounded-md" required />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="sets" className="block text-sm font-medium text-borderGrayHover">Sets</label>
                                <input type="number" id="sets" name="sets" min="1" value={formData.sets} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 text-whitePrimary focus:outline-none focus:ring-1 focus:ring-bluePrimary rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="reps" className="block text-sm font-medium text-borderGrayHover">Reps</label>
                                <input type="number" id="reps" name="reps" min="1" value={formData.reps} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 text-whitePrimary focus:outline-none focus:ring-1 focus:ring-bluePrimary rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="restTime" className="block text-sm font-medium text-borderGrayHover">Rest Time (s)</label>
                                <input type="number" id="restTime" name="restTime" min="0" step="5" value={formData.restTime} onChange={handleFormChange} className="mt-1 block w-full p-2 border border-gray-300 text-whitePrimary focus:outline-none focus:ring-1 focus:ring-bluePrimary rounded-md" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-whitePrimary hover:bg-borderGrayHover rounded-md cursor-pointer">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-bluePrimary hover:bg-blueHover text-whitePrimary rounded-md disabled:bg-blueLight cursor-pointer">{isSubmitting ? 'Adding...' : 'Add exercise'}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}