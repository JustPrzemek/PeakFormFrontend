import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomPlan } from '../services/workoutPlanService'; // Upewnij się, że ścieżka jest poprawna
import toast from 'react-hot-toast';

export default function CreatePlanModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        setActive: false,
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
        if (!formData.name.trim()) {
            toast.error("Nazwa planu jest wymagana.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createCustomPlan(formData);
            
            // Dłuższy toast zgodny z prośbą
            toast.success(
                "Plan został utworzony pomyślnie! Teraz dodaj ćwiczenia do planu z biblioteki.",
                { duration: 5000 } // Wydłuża czas wyświetlania
            );
            
            onClose();
            navigate('/training/exercises'); // Przekierowanie do biblioteki ćwiczeń
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
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surfaceDarkGray rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-whitePrimary">Create Your Own Training Plan</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-borderGrayHover">Plan name</label>
                            <input 
                                type="text"
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="mt-1 block w-full p-2 border border-gray-300 text-whitePrimary rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-borderGrayHover">Short description (optional)</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full p-2 border border-gray-300 text-whitePrimary rounded-md shadow-sm"
                            ></textarea>
                        </div>
                        <div className="flex items-center">
                            <input 
                                id="setActive" 
                                name="setActive" 
                                type="checkbox" 
                                checked={formData.setActive} 
                                onChange={handleChange} 
                                className="h-4 w-4 text-bluePrimary border-borderGrayHover rounded"
                            />
                            <label htmlFor="setActive" className="ml-2 block text-sm text-borderGrayHover">Set as active plan</label>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}