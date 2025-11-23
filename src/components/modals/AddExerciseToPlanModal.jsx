// src/components/modals/AddExerciseToPlanModal.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUserPlans, addExerciseToPlan, createCustomPlan } from '../../services/workoutPlanService';
import toast from 'react-hot-toast';
import { CgSpinner } from "react-icons/cg";
import { FaChevronDown } from 'react-icons/fa';

const LIMITS = {
    MAX_SETS: 100,
    MAX_REPS: 1000,
    MAX_REST_TIME: 3600, // 1 godzina w sekundach
    MAX_DURATION: 1440,  // 24 godziny w minutach
    MAX_DISTANCE: 1000,  // km
    MAX_DAY_NAME: 20     // długość nazwy dnia
};

/**
 * Tworzy początkowy stan formularza w zależności od typu ćwiczenia.
 * 
 * @param {string} exerciseType - Typ ćwiczenia: 'STRENGTH' lub 'CARDIO'
 * @returns {object} Obiekt z początkowymi wartościami formularza
 */
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

/**
 * Modal do dodawania ćwiczenia do planu treningowego.
 * 
 * Funkcjonalności:
 * - Wybór planu treningowego z listy
 * - Wprowadzenie identyfikatora dnia treningowego (np. "Push", "Legs", "A")
 * - Wprowadzenie parametrów ćwiczenia (sets/reps dla STRENGTH, duration/distance dla CARDIO)
 * - Możliwość utworzenia nowego planu, jeśli użytkownik nie ma żadnego
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 * @param {object} props.exercise - Obiekt ćwiczenia do dodania (musi mieć: id, name, type)
 */
export default function AddExerciseToPlanModal({ isOpen, onClose, exercise }) {
    // ========== STAN KOMPONENTU ==========
    const [userPlans, setUserPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreatePlan, setShowCreatePlan] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData(exercise?.type));
    const [newPlanData, setNewPlanData] = useState({ name: '', description: '' });

    // ========== OBLICZENIA (useMemo) ==========
    
    /**
     * Zbiera wszystkie unikalne identyfikatory dni treningowych ze wszystkich planów.
     * Używane do autouzupełniania w polu "dayIdentifier".
     */
    const allDayIdentifiers = useMemo(() => {
        if (!userPlans || userPlans.length === 0) {
            return [];
        }
        // Używamy Set, aby automatycznie obsłużyć duplikaty
        const daySet = new Set();
        userPlans.forEach(plan => {
            if (plan.days) {
                plan.days.forEach(day => daySet.add(day));
            }
        });
        // Zwracamy posortowaną tablicę
        return Array.from(daySet).sort();
    }, [userPlans]);

    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Pobiera plany użytkownika przy otwarciu modala.
     * Resetuje stan formularza i automatycznie wybiera pierwszy plan (jeśli istnieje).
     */
    useEffect(() => {
        if (isOpen && exercise) {
            // Reset stanu przy każdym otwarciu
            setIsLoading(true);
            setShowCreatePlan(false);
            setFormData(getInitialFormData(exercise.type));
            setNewPlanData({ name: '', description: '' });

            const fetchUserPlans = async () => {
                try {
                    // Pobierz wszystkie plany użytkownika (duży rozmiar strony)
                    const params = {
                        page: 0,
                        size: 200, // Wystarczająco dużo dla modala
                        sort: { field: 'createdAt', direction: 'desc' },
                    };
                    
                    const pageData = await getUserPlans(params);
                    const plans = pageData.content;

                    setUserPlans(plans);
                    
                    if (plans.length > 0) {
                        // Automatycznie wybierz pierwszy plan
                        setFormData(prev => ({ ...prev, planId: plans[0].id }));
                    } else {
                        // Jeśli nie ma planów, pokaż formularz tworzenia
                        setShowCreatePlan(true);
                    }
                } catch (error) {
                    toast.error("Failed to load your plans.");
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserPlans();
        }
    }, [isOpen, exercise]);

    /**
     * Obsługa zamykania modala klawiszem Escape.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
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

    /**
     * Blokuje scrollowanie body, gdy modal jest otwarty.
     */
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY ==========
    
    /**
     * Obsługuje zmianę wartości w głównym formularzu (dodawanie ćwiczenia).
     */
    const handleFormChange = useCallback((e) => {
        const { name, value, type, max } = e.target;
        
        if (type === 'number') {
            const numValue = parseFloat(value);
            // Pozwól na pusty string (kasowanie)
            if (value === '') {
                 setFormData(prev => ({ ...prev, [name]: value }));
                 return;
            }
            // Sprawdź limity jeśli zdefiniowano max w html
            if (max && numValue > parseFloat(max)) {
                return; // Nie aktualizuj stanu jeśli przekracza max
            }
            if (numValue < 0) {
                return; // Nie aktualizuj jeśli ujemne
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Obsługuje zmianę wartości w formularzu tworzenia nowego planu.
     */
    const handleNewPlanChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewPlanData(prev => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Obsługuje utworzenie nowego planu.
     * Po utworzeniu planu, automatycznie go wybiera i wraca do formularza dodawania ćwiczenia.
     */
    const handleCreatePlan = useCallback(async (e) => {
        e.preventDefault();
        if (!newPlanData.name.trim()) {
            toast.error("Plan name is required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const createdPlan = await createCustomPlan({ ...newPlanData, setActive: false });
            toast.success(`Plan "${createdPlan.name}" has been created!`);
            
            // Tworzymy obiekt podsumowania planu, aby pasował do reszty danych
            const newPlanSummary = {
                id: createdPlan.id,
                name: createdPlan.name,
                goal: createdPlan.goal,
                days: [], // Nowy plan nie ma dni
                active: createdPlan.active 
            };
            
            // Dodaj nowy plan do listy
            const newPlans = [...userPlans, newPlanSummary];
            setUserPlans(newPlans);
            
            // Wybierz nowy plan i wróć do formularza dodawania ćwiczenia
            setFormData(prev => ({ ...prev, planId: createdPlan.id }));
            setShowCreatePlan(false);
            setNewPlanData({ name: '', description: '' });
        } catch (error) {
            toast.error(error.message || error.toString());
        } finally {
            setIsSubmitting(false);
        }
    }, [newPlanData, userPlans]);

    /**
     * Obsługuje dodanie ćwiczenia do planu.
     * Waliduje dane i wysyła request do API.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        // --- WALIDACJA FORMULARZA ---
        if (!formData.planId) {
            toast.error("Please choose a training plan.");
            return;
        }
        if (!formData.dayIdentifier.trim()) {
            toast.error("Please specify a training day.");
            return;
        }
        if (formData.dayIdentifier.length > LIMITS.MAX_DAY_NAME) {
            toast.error(`Day name too long (max ${LIMITS.MAX_DAY_NAME} chars).`);
            return;
        }

        // Walidacja szczegółowa parametrów
        if (exercise.type === 'STRENGTH') {
            if (formData.sets > LIMITS.MAX_SETS) return toast.error(`Max sets: ${LIMITS.MAX_SETS}`);
            if (formData.reps > LIMITS.MAX_REPS) return toast.error(`Max reps: ${LIMITS.MAX_REPS}`);
            if (formData.restTime > LIMITS.MAX_REST_TIME) return toast.error(`Max rest time: ${LIMITS.MAX_REST_TIME}s`);
        } else if (exercise.type === 'CARDIO') {
            if (formData.durationMinutes > LIMITS.MAX_DURATION) return toast.error(`Max duration: ${LIMITS.MAX_DURATION} min`);
            if (formData.distanceKm > LIMITS.MAX_DISTANCE) return toast.error(`Max distance: ${LIMITS.MAX_DISTANCE} km`);
        }

        setIsSubmitting(true);
        
        const requestDto = {
            exerciseId: exercise.id,
            dayIdentifier: formData.dayIdentifier.trim(),
        };
        
        if (exercise.type === 'STRENGTH') {
            requestDto.sets = parseInt(formData.sets, 10);
            requestDto.reps = parseInt(formData.reps, 10);
            requestDto.restTime = parseInt(formData.restTime, 10);
        } else if (exercise.type === 'CARDIO') {
            requestDto.durationMinutes = parseInt(formData.durationMinutes, 10);
            if (formData.distanceKm) {
                requestDto.distanceKm = parseFloat(formData.distanceKm);
            }
        }

        try {
            await addExerciseToPlan(formData.planId, requestDto);
            const selectedPlan = userPlans.find(p => p.id === formData.planId);
            toast.success(`"${exercise.name}" added to plan "${selectedPlan?.name || 'plan'}"!`);
            onClose();
        } catch (error) {
            toast.error(error.message || error.toString());
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, exercise, userPlans, onClose]);


    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

    // ========== STYLE (dla czytelności) ==========
    const inputStyles = "appearance-none mt-1 block w-full p-3 pr-10 bg-backgoudBlack border border-borderGrayHover rounded-lg text-whitePrimary focus:outline-none focus:ring-2 focus:ring-bluePrimary transition";
    const primaryButtonStyles = "px-4 py-2 rounded-lg bg-bluePrimary hover:bg-blueHover text-whitePrimary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2";
    const secondaryButtonStyles = "px-4 py-2 rounded-lg bg-backgoudBlack hover:bg-borderGrayHover/50 text-whitePrimary transition-colors";

    // ========== RENDEROWANIE ==========
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md border border-borderGrayHover" 
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4 text-whitePrimary">
                    Add "<span className="text-bluePrimary">{exercise?.name || 'exercise'}</span>" to plan
                </h2>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        {/* ZMIANA: Loader2 -> CgSpinner */}
                        <CgSpinner className="animate-spin text-bluePrimary" size={40} />
                    </div>
                ) : showCreatePlan ? (
                    <div>
                        <p className="text-borderGrayHover mb-4">
                            You don't have a plan yet. Create one first to continue.
                        </p>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div>
                                <label htmlFor="newPlanName" className="block text-sm font-medium text-borderGrayHover mb-2">
                                    New plan name
                                </label>
                                <input 
                                    type="text" 
                                    id="newPlanName" 
                                    name="name" 
                                    value={newPlanData.name} 
                                    onChange={handleNewPlanChange} 
                                    className={inputStyles} 
                                    required 
                                    maxLength={50}
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={onClose} className={secondaryButtonStyles}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className={primaryButtonStyles}>
                                    {/* ZMIANA: Loader2 -> CgSpinner */}
                                    {isSubmitting && <CgSpinner className="animate-spin" size={18} />}
                                    {isSubmitting ? 'Creating...' : 'Create and continue'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="planId" className="block text-sm font-medium text-borderGrayHover mb-2">
                                Choose a plan
                            </label>
                            <div className="relative">
                                <select 
                                    id="planId" 
                                    name="planId" 
                                    value={formData.planId} 
                                    onChange={handleFormChange} 
                                    className={inputStyles}
                                >
                                    {userPlans.map(plan => (
                                        <option className="bg-surfaceDarkGray text-whitePrimary" key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    {/* ZMIANA: ChevronDown -> FaChevronDown */}
                                    <FaChevronDown className="text-borderGrayHover" size={14} />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowCreatePlan(true)} 
                                className="text-sm text-bluePrimary hover:text-blueHover hover:underline mt-2 transition-colors"
                            >
                                Or create a new plan
                            </button>
                        </div>
                        
                        <div>
                            <label htmlFor="dayIdentifier" className="block text-sm font-medium text-borderGrayHover mb-2">
                                Training Day (e.g. Push, Legs, A)
                            </label>
                            <input 
                                type="text" 
                                id="dayIdentifier" 
                                name="dayIdentifier" 
                                value={formData.dayIdentifier} 
                                onChange={handleFormChange} 
                                className={inputStyles} 
                                required 
                                maxLength={LIMITS.MAX_DAY_NAME}
                                list="day-suggestions"
                                autoComplete="off"
                            />
                            <div className="text-xs text-borderGrayHover mt-1 text-right">
                                {formData.dayIdentifier.length}/{LIMITS.MAX_DAY_NAME}
                            </div>
                            <datalist id="day-suggestions">
                                {allDayIdentifiers.map(day => (
                                    <option key={day} value={day} />
                                ))}
                            </datalist>
                        </div>
                        
                        {exercise?.type === 'STRENGTH' && (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="sets" className="block text-sm font-medium text-borderGrayHover mb-2">Sets</label>
                                    <input 
                                        type="number" id="sets" name="sets" min="1" max={LIMITS.MAX_SETS}
                                        value={formData.sets} onChange={handleFormChange} className={inputStyles} 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reps" className="block text-sm font-medium text-borderGrayHover mb-2">Reps</label>
                                    <input 
                                        type="number" id="reps" name="reps" min="1" max={LIMITS.MAX_REPS}
                                        value={formData.reps} onChange={handleFormChange} className={inputStyles} 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="restTime" className="block text-sm font-medium text-borderGrayHover mb-2">Rest (s)</label>
                                    <input 
                                        type="number" id="restTime" name="restTime" min="0" max={LIMITS.MAX_REST_TIME} step="1"
                                        value={formData.restTime} onChange={handleFormChange} className={inputStyles} 
                                    />
                                </div>
                            </div>
                        )}

                        {exercise?.type === 'CARDIO' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="durationMinutes" className="block text-sm font-medium text-borderGrayHover mb-2">Duration (min)</label>
                                    <input 
                                        type="number" id="durationMinutes" name="durationMinutes" min="1" max={LIMITS.MAX_DURATION}
                                        value={formData.durationMinutes} onChange={handleFormChange} className={inputStyles} 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="distanceKm" className="block text-sm font-medium text-borderGrayHover mb-2">Distance (km)</label>
                                    <input 
                                        type="number" id="distanceKm" name="distanceKm" min="0" max={LIMITS.MAX_DISTANCE} step="0.1"
                                        value={formData.distanceKm} onChange={handleFormChange} className={inputStyles} 
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className={secondaryButtonStyles}>Cancel</button>
                            <button type="submit" disabled={isSubmitting} className={primaryButtonStyles}>
                                {/* ZMIANA: Loader2 -> CgSpinner */}
                                {isSubmitting && <CgSpinner className="animate-spin" size={18} />}
                                {isSubmitting ? 'Adding...' : 'Add exercise'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}