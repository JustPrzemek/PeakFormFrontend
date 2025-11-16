// src/components/modals/AiGeneratePlanModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePlan } from '../../services/workoutPlanService';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg';

/**
 * Modal do generowania planu treningowego przez AI.
 * 
 * Pozwala użytkownikowi wybrać:
 * - Cel treningowy (reduction, bulk, maintenance)
 * - Poziom zaawansowania (BEGINNER, INTERMEDIATE, ADVANCED)
 * - Liczbę dni treningowych w tygodniu (1-7)
 * - Czy ustawić plan jako aktywny
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 */
export default function AiGeneratePlanModal({ isOpen, onClose }) {
    // ========== STAN KOMPONENTU ==========
    const [formData, setFormData] = useState({
        goal: 'reduction',
        experience: 'BEGINNER',
        daysPerWeek: 3,
        setActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Resetuje formularz, gdy modal się otwiera.
     */
    useEffect(() => {
        if (isOpen) {
            setFormData({
                goal: 'reduction',
                experience: 'BEGINNER',
                daysPerWeek: 3,
                setActive: true,
            });
        }
    }, [isOpen]);

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
     * Obsługuje zmianę wartości w polach formularza.
     */
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    /**
     * Obsługuje generowanie planu przez AI.
     * Wysyła dane do API i przekierowuje do szczegółów planu.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const newPlan = await generatePlan(formData);
            
            toast.success('Your new AI-generated plan is ready!');
            onClose();
            navigate(`/training/plans/${newPlan.id}`);
        } catch (error) {
            toast.error(error.message || error.toString() || "Error generating plan with AI.");
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onClose, navigate]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

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
                <h2 className="text-2xl font-bold mb-6 text-whitePrimary">Generate Plan with AI ✨</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Cel treningowy */}
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-borderGrayHover mb-2">
                                Your main goal
                            </label>
                            <select 
                                id="goal" 
                                name="goal" 
                                value={formData.goal} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-whitePrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                            >
                                <option value="reduction">Reduction (weight loss)</option>
                                <option value="bulk">Bulk (muscle building)</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        
                        {/* Poziom zaawansowania */}
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-borderGrayHover mb-2">
                                Experience level
                            </label>
                            <select 
                                id="experience" 
                                name="experience" 
                                value={formData.experience} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-whitePrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                        
                        {/* Dni treningowych w tygodniu */}
                        <div>
                            <label htmlFor="daysPerWeek" className="block text-sm font-medium text-borderGrayHover mb-2">
                                Training days per week: {formData.daysPerWeek}
                            </label>
                            <input 
                                id="daysPerWeek" 
                                name="daysPerWeek" 
                                type="range" 
                                min="1" 
                                max="7" 
                                value={formData.daysPerWeek} 
                                onChange={handleChange} 
                                className="w-full h-2 bg-borderGrayHover rounded-lg appearance-none cursor-pointer accent-bluePrimary"
                            />
                            <div className="flex justify-between text-xs text-borderGrayHover mt-1">
                                <span>1</span>
                                <span>7</span>
                            </div>
                        </div>

                        {/* Checkbox - ustaw jako aktywny */}
                        <div className="flex items-center">
                            <input 
                                id="setActive" 
                                name="setActive" 
                                type="checkbox" 
                                checked={formData.setActive} 
                                onChange={handleChange} 
                                className="h-4 w-4 text-bluePrimary bg-backgoudBlack border-borderGrayHover rounded cursor-pointer focus:ring-bluePrimary"
                            />
                            <label htmlFor="setActive" className="ml-2 block text-sm text-borderGrayHover">
                                Set as active plan
                            </label>
                        </div>
                    </div>
                    
                    {/* Przyciski akcji */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 bg-backgoudBlack text-whitePrimary font-medium rounded-lg hover:bg-borderGrayHover/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-5 py-2.5 bg-bluePrimary text-whitePrimary font-medium rounded-lg hover:bg-blueHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <CgSpinner className="animate-spin" size={18} />}
                            {isSubmitting ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}