import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';

export default function GeneratePlanModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        goal: 'maintenance',
        experience: 'BEGINNER',
        daysPerWeek: 3,
        type: 'STRENGTH',
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
        setIsSubmitting(true);
        try {
            const newPlan = await generatePlan(formData);
            toast.success('Plan wygenerowany pomyślnie!');
            onClose();
            navigate(`/training/plans/${newPlan.id}`);
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
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"  onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-lg shadow-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-whitePrimary">Generate New Plan</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-borderGrayHover">Training goal</label>
                            <select id="goal" name="goal" value={formData.goal} onChange={handleChange} className="mt-1 block w-full p-2 border border-borderGrayHover rounded-md shadow-sm text-whitePrimary cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-bluePrimary focus:text-borderGrayHover">
                                <option value="reduction">Reduction</option>
                                <option value="bulk">Bulk</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-borderGrayHover">Level of advancement</label>
                            <select id="experience" name="experience" value={formData.experience} onChange={handleChange} className="mt-1 block w-full p-2 border border-borderGrayHover rounded-md shadow-sm text-whitePrimary cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-bluePrimary focus:text-borderGrayHover">
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-borderGrayHover">Preferred type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-borderGrayHover rounded-md shadow-sm text-whitePrimary cursor-pointer bg-transparent focus:outline-none focus:ring-1 focus:ring-bluePrimary focus:text-borderGrayHover">
                                <option value="STRENGTH">Strength</option>
                                <option value="CARDIO">Cardio</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="daysPerWeek" className="block text-sm font-medium text-borderGrayHover">Days a week ({formData.daysPerWeek})</label>
                            <input id="daysPerWeek" name="daysPerWeek" type="range" min="1" max="7" value={formData.daysPerWeek} onChange={handleChange} className="w-full h-2 bg-borderGrayHover rounded-lg appearance-none cursor-pointer"/>
                        </div>
                        <div className="flex items-center">
                            <input id="setActive" name="setActive" type="checkbox" checked={formData.setActive} onChange={handleChange} className="h-4 w-4 text-bluePrimary border-borderGrayHover rounded cursor-pointer"/>
                            <label htmlFor="setActive" className="ml-2 block text-sm text-borderGrayHover">Set as active plan</label>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-whitePrimary rounded-md hover:bg-borderGrayHover cursor-pointer">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-bluePrimary text-whitePrimary rounded-md hover:bg-blueHover disabled:bg-blueLight cursor-pointer">
                            {isSubmitting ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}