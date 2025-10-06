import { useState, useEffect } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { getUserPlans, deletePlan } from '../services/workoutPlanService'; // Załóżmy, że usługi są w tym pliku
import toast from 'react-hot-toast';
import GeneratePlanModal from '../components/GeneratePlanModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CreatePlanModal from '../components/CreatePlanModal';
import Footer from "../components/Footer";
import { GrPlan } from "react-icons/gr";

export default function TrainingPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getUserPlans();
                setPlans(data);
            } catch (error) {
                toast.error("Failed to download training plans.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleOpenDeleteModal = (plan, event) => {
        event.stopPropagation(); // Zapobiega nawigacji po kliknięciu ikony
        setPlanToDelete(plan);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!planToDelete) return;
        try {
            await deletePlan(planToDelete.id);
            setPlans(plans.filter(p => p.id !== planToDelete.id));
            toast.success("The plan was successfully deleted!");
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setDeleteModalOpen(false);
            setPlanToDelete(null);
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading plans...</div>;
    }
    
    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <div className="container mx-auto p-8 flex-grow">
                <Link to="/training" className="flex items-center text-bluePrimary hover:text-blueLight mb-8">
                    <button>
                        <FaArrowLeft 
                            className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" 
                        />
                    </button>
                </Link>
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-whitePrimary">My Training Plans</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center bg-green-500 text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 cursor-pointer"
                        >
                            Create your own plan
                        </button>

                        <button
                            onClick={() => setGenerateModalOpen(true)}
                            className="flex items-center bg-bluePrimary text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-blueHover transition duration-300 cursor-pointer"
                        >
                            <FaPlus className="mr-2" />
                            Generate New Plan
                        </button>
                    </div>
                </div>

                {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="relative bg-surfaceDarkGray text-whitePrimary rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-300 group"
                                onClick={() => navigate(`/training/plans/${plan.id}`)}
                            >
                                {plan.active && (
                                    <div className="absolute top-2 right-2 flex items-center bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                                        <FaCheckCircle className="mr-1" /> Active
                                    </div>
                                )}
                                <h2 className="text-2xl flex items-baseline mt-2 gap-3 font-semibold mb-2"><GrPlan/> {plan.name}</h2>
                                <p className="text-gray-500 text-sm">
                                    Created at: {new Date(plan.createdAt).toLocaleDateString()}
                                </p>
                                <button
                                    onClick={(e) => handleOpenDeleteModal(plan, e)}
                                    className="absolute bottom-4 right-4 text-borderGrayHover hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Usuń plan"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-surfaceDarkGray rounded-lg">
                        <h2 className="text-2xl font-semibold text-whitePrimary">You don't have any plans yet.</h2>
                        <p className="text-borderGrayHover mt-2">Click the buttons above to generate your first plan or create your own!</p>
                    </div>
                )}

                <GeneratePlanModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setGenerateModalOpen(false)}
                />
                
                <CreatePlanModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                />
                
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Confirm deletion"
                    message={`Are you sure you want to delete the exercise "${planToDelete?.name}"? This operation cannot be undone.`}
                />
            </div>
            <Footer/>
        </div>
    );
}