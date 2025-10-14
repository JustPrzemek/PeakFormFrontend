import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaMagic, FaPen } from 'react-icons/fa'; // Dodane ikony
import { getUserPlans, deletePlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import GeneratePlanModal from '../components/GeneratePlanModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CreatePlanModal from '../components/CreatePlanModal';
import Footer from "../components/Footer";
import { GrPlan } from "react-icons/gr";
import { CgSpinner } from 'react-icons/cg'; // Dla skeletona

// --- Komponent szkieletu ładowania ---
const PlanCardSkeleton = () => (
    <div className="bg-surfaceDarkGray rounded-2xl p-6 animate-pulse">
        <div className="h-7 w-3/4 bg-borderGrayHover/30 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-borderGrayHover/30 rounded mb-6"></div>
        <div className="flex gap-2">
            <div className="h-5 w-16 bg-borderGrayHover/30 rounded-full"></div>
            <div className="h-5 w-16 bg-borderGrayHover/30 rounded-full"></div>
        </div>
    </div>
);

// --- Komponent stanu "pustego" ---
const EmptyState = ({ onGenerate, onCreate }) => (
    <div className="text-center py-20 px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover">
        <GrPlan className="mx-auto text-5xl text-borderGrayHover mb-4" />
        <h2 className="text-2xl font-bold text-whitePrimary">No training plans yet</h2>
        <p className="text-borderGrayHover mt-2 mb-6 max-w-md mx-auto">It looks like you haven't created any plans. Generate one automatically or create your own from scratch!</p>
        <div className="flex justify-center gap-4">
            <button
                onClick={onGenerate}
                className="flex items-center bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300"
            >
                <FaMagic className="mr-2" />
                Generate Plan
            </button>
            <button
                onClick={onCreate}
                className="flex items-center bg-transparent border border-borderGrayHover text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-borderGrayHover transition-colors duration-300"
            >
                <FaPen className="mr-2" />
                Create Manually
            </button>
        </div>
    </div>
);

export default function TrainingPlansPage() {
    const [plans, setPlans] =useState([]);
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
        event.stopPropagation();
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

    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                <Link to="/training" className="inline-block mb-8 text-bluePrimary">
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
                    <h1 className="text-4xl font-bold text-whitePrimary">My Training Plans</h1>
                    <div className="flex items-center gap-3">
                         <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center bg-transparent border border-borderGrayHover text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-borderGrayHover transition-colors duration-300"
                        >
                            <FaPen className="mr-2 text-sm" />
                            Create your own
                        </button>
                        <button
                            onClick={() => setGenerateModalOpen(true)}
                            className="flex items-center bg-bluePrimary text-whitePrimary font-bold py-2 px-4 rounded-lg hover:bg-blueHover transition-colors duration-300"
                        >
                            <FaMagic className="mr-2" />
                            Generate New Plan
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <PlanCardSkeleton />
                        <PlanCardSkeleton />
                        <PlanCardSkeleton />
                    </div>
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="relative bg-surfaceDarkGray text-whitePrimary rounded-2xl shadow-lg border border-transparent p-6 cursor-pointer hover:border-bluePrimary hover:-translate-y-1 transition-all duration-300 group"
                                onClick={() => navigate(`/training/plans/${plan.id}`)}
                            >
                                {plan.active && (
                                    <div className="absolute top-4 right-4 flex items-center bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                                        <FaCheckCircle className="mr-1.5" /> Active
                                    </div>
                                )}
                                <h2 className="text-2xl flex items-center gap-3 font-semibold mb-2 pr-20">
                                    <GrPlan className="text-bluePrimary"/> {plan.name}
                                </h2>
                                <p className="text-gray-500 text-sm mb-4">
                                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                                </p>
                                {/* Przykładowe dodatkowe informacje */}
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="bg-borderGrayHover/20 text-borderGrayHover px-2.5 py-1 rounded-full">{plan.days?.length || 0} training days</span>
                                    <span className="bg-borderGrayHover/20 text-borderGrayHover px-2.5 py-1 rounded-full">{plan.goal || 'General'}</span>
                                </div>
                                <button
                                    onClick={(e) => handleOpenDeleteModal(plan, e)}
                                    className="absolute bottom-6 right-6 text-borderGrayHover hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete plan"
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        onGenerate={() => setGenerateModalOpen(true)} 
                        onCreate={() => setCreateModalOpen(true)} 
                    />
                )}
            </main>

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
            <Footer/>
        </div>
    );
}