import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBasicPlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';

export default function GeneratePlanModal({ isOpen, onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newPlan = await createBasicPlan();
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
                    <div className="grid grid-cols-1 gap-6 text-whitePrimary">
                        <p>Tutaj wygenerujesz basic plan ktory mozesz łatwo edytowac dodajac dni i cwiczenia do planu. Jest to podstawowy plan z 2 dniami treningowytmi i kilkoma cwiczeniami</p>
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