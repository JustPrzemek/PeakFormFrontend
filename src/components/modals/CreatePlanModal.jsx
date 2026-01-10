// src/components/modals/CreatePlanModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomPlan } from '../../services/workoutPlanService';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { GrPlan } from 'react-icons/gr';

/**
 * Komponent przełącznika (toggle switch).
 * 
 * @param {object} props
 * @param {boolean} props.checked - Czy przełącznik jest włączony
 * @param {function} props.onChange - Funkcja wywoływana przy zmianie stanu
 */
const ToggleSwitch = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${
            checked ? 'bg-bluePrimary' : 'bg-borderGrayHover/50'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-bluePrimary focus:ring-offset-2 focus:ring-offset-surfaceDarkGray`}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        aria-label={checked ? 'Active plan' : 'Inactive plan'}
    >
        <span
            aria-hidden="true"
            className={`${
                checked ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-whitePrimary shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

/**
 * Opcje celów treningowych.
 */
const goalOptions = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'bulk', label: 'Bulk' },
    { value: 'reduction', label: 'Reduction' },
];

/**
 * Maksymalne długości pól formularza.
 */
const NAME_MAX_LENGTH = 25;
const DESCRIPTION_MAX_LENGTH = 1000;

/**
 * Modal do tworzenia nowego planu treningowego.
 * 
 * Pozwala użytkownikowi:
 * - Wprowadzić nazwę i opis planu
 * - Wybrać cel treningowy (maintenance, bulk, reduction)
 * - Ustawić plan jako aktywny
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 */
export default function CreatePlanModal({ isOpen, onClose }) {
    // ========== STAN KOMPONENTU ==========
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        setActive: true,
        goal: 'maintenance',
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
                name: '',
                description: '',
                setActive: true,
                goal: 'maintenance',
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
     * Waliduje długość tekstu i aktualizuje stan.
     */
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        
        // Walidacja długości - nie pozwól na przekroczenie limitu
        if (name === 'name' && value.length > NAME_MAX_LENGTH) {
            return;
        }
        if (name === 'description' && value.length > DESCRIPTION_MAX_LENGTH) {
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    /**
     * Obsługuje wysłanie formularza.
     * Tworzy nowy plan treningowy i przekierowuje do biblioteki ćwiczeń.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        // Walidacja - nazwa jest wymagana
        if (!formData.name.trim()) {
            toast.error("Plan name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createCustomPlan(formData);
            
            toast.success(
                "Plan created successfully! Now add exercises to your plan from the library.",
                { duration: 5000 }
            );
            
            onClose();
            navigate('/training/exercises'); // Przekierowanie do biblioteki ćwiczeń
        } catch (error) {
            toast.error(error.message || error.toString());
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onClose, navigate]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

    // ========== RENDEROWANIE ==========
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" 
            onClick={onClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl p-8 w-full max-w-md border border-borderGrayHover" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-whitePrimary flex items-center gap-3">
                            <GrPlan /> Create a New Plan
                        </h2>
                        <p className="text-sm text-borderGrayHover mt-1">
                            Give your new plan a name and you're ready to go.
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-borderGrayHover hover:text-whitePrimary transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes size={20} />
                    </button>
                </header>
                
                {/* Formularz */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Pole nazwy planu */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="name" className="block text-sm font-medium text-borderGrayHover">
                                    Plan name
                                </label>
                                <span className={`text-sm ${
                                    formData.name.length >= NAME_MAX_LENGTH 
                                        ? 'text-red-400' 
                                        : 'text-borderGrayHover'
                                }`}>
                                    {formData.name.length} / {NAME_MAX_LENGTH}
                                </span>
                            </div>                            
                            <input 
                                type="text"
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-whitePrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                                required
                                maxLength={NAME_MAX_LENGTH}
                            />
                        </div>
                        
                        {/* Pole opisu */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="description" className="block text-sm font-medium text-borderGrayHover">
                                    Description (optional)
                                </label>
                                <span className={`text-sm ${
                                    formData.description.length >= DESCRIPTION_MAX_LENGTH 
                                        ? 'text-red-400' 
                                        : 'text-borderGrayHover'
                                }`}>
                                    {formData.description.length} / {DESCRIPTION_MAX_LENGTH}
                                </span>
                            </div>                      
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-whitePrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-bluePrimary resize-none"
                                maxLength={DESCRIPTION_MAX_LENGTH}
                            />
                        </div>

                        {/* Pole celu treningowego */}
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-borderGrayHover mb-2">
                                Plan Goal
                            </label>
                            <select
                                id="goal"
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-whitePrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-bluePrimary appearance-none"
                            >
                                {goalOptions.map(option => (
                                    <option 
                                        key={option.value} 
                                        value={option.value}
                                        className="bg-surfaceDarkGray"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Przełącznik "Set as active" */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="setActive" className="block text-sm font-medium text-borderGrayHover">
                                Set as your active plan
                            </label>
                            <ToggleSwitch 
                                checked={formData.setActive} 
                                onChange={() => setFormData(prev => ({ ...prev, setActive: !prev.setActive }))}
                            />
                        </div>
                    </div>
                    
                    {/* Przyciski akcji */}
                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-backgoudBlack text-whitePrimary font-semibold py-2 px-4 rounded-lg text-sm hover:bg-borderGrayHover/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-bluePrimary text-whitePrimary font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blueHover"
                        >
                            {isSubmitting && <CgSpinner className="animate-spin" size={20} />}
                            {isSubmitting ? 'Creating...' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}