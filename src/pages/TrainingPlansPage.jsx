import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaCheckCircle, FaMagic, FaPen } from 'react-icons/fa';
import { getUserPlans, deletePlan } from '../services/workoutPlanService';
import toast from 'react-hot-toast';
import GeneratePlanModal from '../components/modals/GeneratePlanModal';
import AiGeneratePlanModal from '../components/modals/AiGeneratePlanModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import CreatePlanModal from '../components/modals/CreatePlanModal';
import Footer from "../components/Footer";
import { GrPlan } from "react-icons/gr";
import { CgSpinner } from 'react-icons/cg';
import PlanFilterBar from '../components/PlanFilterBar';

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

// --- Komponent stanu "pustego" (ZAKTUALIZOWANY - RESPONSYWNY) ---
const EmptyState = ({ onGenerate, onGenerateAi, onCreate }) => (
    <div className="text-center py-12 px-4 md:py-20 md:px-6 bg-surfaceDarkGray rounded-2xl border border-dashed border-borderGrayHover">
        <GrPlan className="mx-auto text-5xl text-borderGrayHover mb-4" />
        <h2 className="text-2xl font-bold text-whitePrimary">No training plans yet</h2>
        <p className="text-borderGrayHover mt-2 mb-8 max-w-md mx-auto">
            It looks like you haven't created any plans. Generate one automatically or create your own from scratch!
        </p>
        {/* Flex container zmienia się z kolumny na rząd na większych ekranach */}
        <div className="flex flex-col md:flex-row justify-center gap-4 w-full md:w-auto">
            <button
                onClick={onGenerate}
                className="flex items-center justify-center bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300 w-full md:w-auto"
            >
                <FaMagic className="mr-2" />
                Generate Plan
            </button>
            <button
                onClick={onGenerateAi}
                className="flex items-center justify-center bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300 w-full md:w-auto"
            >
                <FaMagic className="mr-2" />
                AI Plan
            </button>
            <button
                onClick={onCreate}
                className="flex items-center justify-center bg-transparent border border-borderGrayHover text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-borderGrayHover transition-colors duration-300 w-full md:w-auto"
            >
                <FaPen className="mr-2" />
                Create Manually
            </button>
        </div>
    </div>
);

export default function TrainingPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
    const [isAiGenerateModalOpen, setAiGenerateModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const [filters, setFilters] = useState({ name: '', goal: null, isActive: null });
    const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' });

    const filtersRef = useRef(filters);
    const PAGE_SIZE = 9;

    const loadPlans = useCallback(async (currentPage, currentFilters, currentSort, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const params = {
                ...currentFilters,
                page: currentPage,
                size: PAGE_SIZE,
                sort: currentSort
            };
            
            const data = await getUserPlans(params); 
            
            setPlans(prev => isLoadMore ? [...prev, ...data.content] : data.content);
            setPage(data.number);
            setTotalPages(data.totalPages);
            
        } catch (error) {
            toast.error("Failed to download training plans.");
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        filtersRef.current = filters; 
        loadPlans(0, filters, sort, false); 
    }, [filters, sort, loadPlans]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        if (nextPage < totalPages && !loadingMore) {
            loadPlans(nextPage, filters, sort, true);
        }
    };

    const handleSortChange = (field) => {
        setSort(prevSort => {
            const isCurrentField = prevSort.field === field;
            const direction = isCurrentField && prevSort.direction === 'asc' ? 'desc' : 'asc';
            return { field, direction };
        });
    };

    const handleFilterChange = (filterName, value, isDebouncing = false) => {
        filtersRef.current = { ...filtersRef.current, [filterName]: value };

        if (isDebouncing) {
            setFilters(prev => ({ ...prev, [filterName]: value }));
        } else {
            setFilters(filtersRef.current);
        }
    };

    const handleOpenDeleteModal = (plan, event) => {
        event.stopPropagation();
        setPlanToDelete(plan);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!planToDelete) return;
        try {
            await deletePlan(planToDelete.id);
            loadPlans(0, filters, sort, false);
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
                
                {/* Przycisk powrotu */}
                <Link to="/training" className="inline-block mb-6 text-bluePrimary">
                    <FaArrowLeft className="text-3xl md:text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </Link>

                {/* --- NAGŁÓWEK I PRZYCISKI AKCJI (RESPONSYWNE) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-whitePrimary">My Training Plans</h1>
                    
                    <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                         <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center justify-center bg-transparent border border-borderGrayHover text-whitePrimary font-bold py-2.5 px-4 rounded-lg hover:bg-borderGrayHover transition-colors duration-300 w-full md:w-auto"
                        >
                            <FaPen className="mr-2 text-sm" />
                            Create Own
                        </button>
                        <button
                            onClick={() => setGenerateModalOpen(true)}
                            className="flex items-center justify-center bg-bluePrimary text-whitePrimary font-bold py-2.5 px-4 rounded-lg hover:bg-blueHover transition-colors duration-300 w-full md:w-auto"
                        >
                            <FaMagic className="mr-2" />
                            Basic Generator
                        </button>
                        <button
                            onClick={() => setAiGenerateModalOpen(true)}
                            className="flex items-center justify-center bg-gradient-to-r from-bluePrimary to-purple-600 text-whitePrimary font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 w-full md:w-auto"
                        >
                            <FaMagic className="mr-2" />
                            AI Generator
                        </button>
                    </div>
                </div>

                {/* Pasek Filtrów */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <PlanFilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        sort={sort}
                        onSortChange={handleSortChange}
                        loading={loading && page === 0}
                    />
                </div>

                {loading && plans.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <PlanCardSkeleton />
                        <PlanCardSkeleton />
                        <PlanCardSkeleton />
                    </div>
                
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                                
                                <h2 className="text-xl md:text-2xl flex items-center gap-3 font-semibold mb-2 pr-16 md:pr-20">
                                    <GrPlan className="text-bluePrimary flex-shrink-0"/> 
                                    <span className="flex-1 truncate min-w-0">{plan.name}</span>
                                </h2>
                                
                                <p className="text-gray-500 text-sm mb-4">
                                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="bg-borderGrayHover/20 text-borderGrayHover px-2.5 py-1 rounded-full">{plan.days?.length || 0} days</span>
                                    <span className="bg-borderGrayHover/20 text-borderGrayHover px-2.5 py-1 rounded-full capitalize">{plan.goal || 'General'}</span>
                                </div>

                                <button
                                    onClick={(e) => handleOpenDeleteModal(plan, e)}
                                    // Zmiana tutaj: opacity-100 na mobile (zawsze widoczny), opacity-0 na desktopie (widoczny po najechaniu)
                                    className="absolute bottom-6 right-6 text-borderGrayHover hover:text-red-500 transition-opacity md:opacity-0 md:group-hover:opacity-100 opacity-100 p-2 md:p-0"
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
                        onGenerateAi={() => setAiGenerateModalOpen(true)}
                        onCreate={() => setCreateModalOpen(true)} 
                    />
                )}

                {/* Przycisk Load More */}
                {!loading && page < totalPages - 1 && (
                    <div className="text-center mt-12 mb-8">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="bg-bluePrimary text-whitePrimary font-bold py-3 px-8 rounded-lg hover:bg-blueHover transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait w-full md:w-auto"
                        >
                            {loadingMore ? (
                                <>
                                    <CgSpinner className="animate-spin inline-block w-6 h-6 mr-2" />
                                    Loading...
                                </>
                            ) : (
                                'Load More Plans'
                            )}
                        </button>
                    </div>
                )}

            </main>
            
            {/* Modale */}
            <AiGeneratePlanModal
                isOpen={isAiGenerateModalOpen}
                onClose={() => setAiGenerateModalOpen(false)}
            />

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
                message={`Are you sure you want to delete the plan "${planToDelete?.name}"? This cannot be undone.`}
            />
            <Footer/>
        </div>
    );
}