import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg'; // Importujemy spinner

export default function AiGeneratePlanModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        goal: 'reduction',
        experience: 'BEGINNER', // Na backendzie upewnij się, że obsługujesz 'BEGINNER' a nie 'beginner'
        daysPerWeek: 3,
        setActive: true, // Zazwyczaj użytkownik chce, aby nowy plan był aktywny
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Wywołujemy ten sam endpoint co wcześniej, ale teraz obsługuje go AI
            const newPlan = await generatePlan(formData);
            
            toast.success('Twój nowy plan został wygenerowany przez AI!');
            onClose();
            navigate(`/training/plans/${newPlan.id}`);
        } catch (error) {
            toast.error(error.toString() || "Błąd generowania planu przez AI.");
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

    // Używamy tych samych stylów co w starym modalu, aby zachować spójność
    return (
        <div className="fixed inset-0 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-whitePrimary">Generate Plan with AI ✨</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        {/* 1. Cel Treningowy */}
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-borderGrayHover">Twój główny cel</label>
                            <select id="goal" name="goal" value={formData.goal} onChange={handleChange} className="mt-1 block w-full p-3 bg-surfaceDarkGray border border-borderGrayHover text-whitePrimary rounded-lg focus:ring-2 focus:ring-bluePrimary transition">
                                <option className="bg-surfaceDarkGray" value="reduction">Redukcja (utrata wagi)</option>
                                <option className="bg-surfaceDarkGray" value="bulk">Masa (budowa mięśni)</option>
                                <option className="bg-surfaceDarkGray" value="maintenance">Utrzymanie</option>
                            </select>
                        </div>
                        
                        {/* 2. Poziom Zaawansowania */}
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-borderGrayHover">Poziom zaawansowania</label>
                            <select id="experience" name="experience" value={formData.experience} onChange={handleChange} className="mt-1 block w-full p-3 bg-surfaceDarkGray border border-borderGrayHover text-whitePrimary rounded-lg focus:ring-2 focus:ring-bluePrimary transition">
                                <option className="bg-surfaceDarkGray" value="BEGINNER">Początkujący</option>
                                <option className="bg-surfaceDarkGray" value="INTERMEDIATE">Średniozaawansowany</option>
                                <option className="bg-surfaceDarkGray" value="ADVANCED">Zaawansowany</option>
                            </select>
                        </div>
                        
                        {/* 3. Dni w tygodniu */}
                         <div>
                            <label htmlFor="daysPerWeek" className="block text-sm font-medium text-borderGrayHover">Dni treningowych w tygodniu ({formData.daysPerWeek})</label>
                            <input id="daysPerWeek" name="daysPerWeek" type="range" min="1" max="7" value={formData.daysPerWeek} onChange={handleChange} className="w-full h-2 bg-borderGrayHover rounded-lg appearance-none cursor-pointer accent-bluePrimary"/>
                        </div>

                        {/* 4. Ustaw jako aktywny */}
                        <div className="flex items-center">
                            <input id="setActive" name="setActive" type="checkbox" checked={formData.setActive} onChange={handleChange} className="h-4 w-4 text-bluePrimary bg-gray-700 border-borderGrayHover rounded cursor-pointer focus:ring-bluePrimary"/>
                            <label htmlFor="setActive" className="ml-2 block text-sm text-borderGrayHover">Ustaw jako aktywny plan</label>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-borderGrayHover/50 text-whitePrimary font-medium rounded-lg hover:bg-borderGrayHover/80 transition">
                            Anuluj
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-bluePrimary text-whitePrimary font-medium rounded-lg hover:bg-opacity-90 transition disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center">
                            {isSubmitting ? (
                                <>
                                    <CgSpinner className="animate-spin mr-2" />
                                    Generowanie...
                                </>
                            ) : 'Generuj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}