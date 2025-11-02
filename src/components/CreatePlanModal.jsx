import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomPlan } from '../services/workoutPlanService'; // Upewnij się, że ścieżka jest poprawna
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { GrPlan } from 'react-icons/gr';

const ToggleSwitch = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${
            checked ? 'bg-bluePrimary' : 'bg-borderGrayHover/50'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-bluePrimary focus:ring-offset-2 focus:ring-offset-surfaceDarkGray`}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
    >
        <span
            aria-hidden="true"
            className={`${
                checked ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const goalOptions = [
    { value: 'maintenance', label: 'Utrzymanie wagi' },
    { value: 'bulk', label: 'Budowanie masy (Masa)' },
    { value: 'reduction', label: 'Redukcja tkanki (Redukcja)' },
];

export default function CreatePlanModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        setActive: true,
        goal: 'maintenance',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const DESCRIPTION_MAX_LENGTH = 1000;
    const NAME_MAX_LENGTH = 25;

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
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
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-2xl shadow-xl p-8 w-full max-w-md border border-borderGrayHover" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-whitePrimary flex items-center gap-3"><GrPlan /> Create a New Plan</h2>
                        <p className="text-sm text-borderGrayHover mt-1">Give your new plan a name and you're ready to go.</p>
                    </div>
                    <button onClick={onClose} className="text-borderGrayHover hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="name" className="block text-sm font-medium text-borderGrayHover">Plan name</label>
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
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-white rounded-lg focus:ring-2 focus:ring-bluePrimary"
                                required
                                maxLength={NAME_MAX_LENGTH}
                            />
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-2">
                                <label htmlFor="description" className="block text-sm font-medium text-borderGrayHover">Description (optional)</label>
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
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-white rounded-lg focus:ring-2 focus:ring-bluePrimary"
                                maxLength={DESCRIPTION_MAX_LENGTH}
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-borderGrayHover mb-2">Plan Goal</label>
                            <select
                                id="goal"
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                                className="w-full p-3 bg-backgoudBlack border border-borderGrayHover text-white rounded-lg focus:ring-2 focus:ring-bluePrimary"
                            >
                                {goalOptions.map(option => (
                                    <option 
                                        key={option.value} 
                                        value={option.value}
                                        // Opcje są trudne do stylowania, ale możemy spróbować
                                        className="bg-surfaceDarkGray text-white" 
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <label htmlFor="setActive" className="block text-sm font-medium text-borderGrayHover">Set as your active plan</label>
                            <ToggleSwitch 
                                checked={formData.setActive} 
                                onChange={() => setFormData(prev => ({ ...prev, setActive: !prev.setActive }))}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-borderGrayHover/50 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-borderGrayHover transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-bluePrimary text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors hover:bg-blueHover">
                            {isSubmitting ? <CgSpinner className="animate-spin"/> : null}
                            {isSubmitting ? 'Creating...' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}