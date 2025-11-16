// src/components/modals/GeneratePlanModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBasicPlan } from '../../services/workoutPlanService';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg';

/**
 * Modal do generowania podstawowego planu treningowego.
 * 
 * Tworzy podstawowy plan z 2 dniami treningowymi i kilkoma ćwiczeniami,
 * który użytkownik może później edytować i rozbudować.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 */
export default function GeneratePlanModal({ isOpen, onClose }) {
    // ========== STAN KOMPONENTU ==========
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // ========== EFEKTY UBOCZNE ==========
    
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
     * Obsługuje generowanie podstawowego planu.
     * Tworzy plan i przekierowuje do strony szczegółów planu.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newPlan = await createBasicPlan();
            toast.success('Basic plan generated successfully!');
            onClose();
            navigate(`/training/plans/${newPlan.id}`);
        } catch (error) {
            toast.error(error.message || error.toString());
        } finally {
            setIsSubmitting(false);
        }
    }, [onClose, navigate]);

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
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-whitePrimary">Generate New Plan</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 text-borderGrayHover mb-6">
                        <p>
                            Here you can generate a basic plan that you can easily edit by adding days and exercises. 
                            This is a starter plan with 2 training days and a few exercises to get you started.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-backgoudBlack text-whitePrimary rounded-lg hover:bg-borderGrayHover/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-4 py-2 bg-bluePrimary text-whitePrimary rounded-lg hover:bg-blueHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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