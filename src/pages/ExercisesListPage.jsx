import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getExercises } from '../services/exerciseService';
import { useDebounce } from '../hooks/useDebounce';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { CgSpinner } from "react-icons/cg";
import Footer from '../components/Footer';
import AddExerciseToPlanModal from '../components/AddExerciseToPlanModal';
import ExerciseSkeleton from '../components/skeletons/ExerciseSkeleton';

// --- Stałe zdefiniowane poza komponentem dla lepszej wydajności ---
const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Abs", "Full Body", "Cardio"];
const difficultyConfig = {
    BEGINNER: { bg: 'bg-green-500/20', text: 'text-green-400' },
    INTERMEDIATE: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    ADVANCED: { bg: 'bg-red-500/20', text: 'text-red-400' }
};

export default function ExercisesListPage() {
    // --- Stany komponentu ---
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [filters, setFilters] = useState({ name: '', muscleGroup: '', difficulty: '' });
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const navigate = useNavigate();


    // --- Hooki ---
    const debouncedName = useDebounce(filters.name, 500);
    const observer = useRef();

    // --- Efekt do pobierania danych ---
    useEffect(() => {
        page === 0 ? setLoading(true) : setIsFetchingMore(true);
        const currentFilters = { ...filters, name: debouncedName, page, size: 12 };
        
        getExercises(currentFilters)
            .then(data => {
                setExercises(prev => page === 0 ? data.content : [...prev, ...data.content]);
                setHasMore(!data.last);
            })
            .catch(error => console.error("Error fetching exercises:", error))
            .finally(() => {
                setLoading(false);
                setIsFetchingMore(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedName, filters.muscleGroup, filters.difficulty, page]);

    // --- Handlery (funkcje obsługujące zdarzenia) ---
    const handleNameChange = (e) => {
        setFilters(prev => ({ ...prev, name: e.target.value }));
        setExercises([]);
        setPage(0);
        setHasMore(true);
    };

    const handleFilterClick = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type] === value ? '' : value // Logika zaznaczania/odznaczania filtra
        }));
        setExercises([]);
        setPage(0);
        setHasMore(true);
    };

    const handleOpenAddModal = (exercise, event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedExercise(exercise);
        setAddModalOpen(true);
    };

    const handleGoBack = () => {
        navigate(-1);
    }
    // --- Logika Infinite Scroll ---
    const lastExerciseElementRef = useCallback(node => {
        if (loading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, isFetchingMore, hasMore]);


    // --- Renderowanie komponentu (JSX) ---
    return (
        <div className="bg-backgoudBlack text-whitePrimary">
            <div className="container mx-auto p-4 sm:p-8 min-h-screen">
                <button
                onClick={handleGoBack}
                className="inline-block mb-8 text-bluePrimary"
                aria-label="go back to previous page"
                >
                <FaArrowLeft
                    className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110"
                />
                </button>
                <h1 className="text-4xl font-bold mb-2 text-whitePrimary">Exercise Library</h1>
                <p className="text-borderGrayHover mb-8">Find the perfect exercise for yourself.</p>
                
                {/* Nowoczesny panel filtrów */}
                <div className="mb-10 p-6 bg-surfaceDarkGray rounded-2xl border border-borderGrayHover">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                        <input 
                            type="text"
                            name="name"
                            placeholder="Search exercise..."
                            value={filters.name}
                            onChange={handleNameChange}
                            className="p-3 bg-backgoudBlack border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary transition"
                        />
                        <div className="lg:col-span-2">
                            <p className="text-sm font-medium text-borderGrayHover mb-2">Muscle Group</p>
                            <div className="flex flex-wrap gap-2">
                                 <button 
                                    onClick={() => handleFilterClick('muscleGroup', '')}
                                    className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                                        filters.muscleGroup === '' 
                                        ? 'bg-bluePrimary text-white' 
                                        : 'bg-backgoudBlack hover:bg-borderGrayHover'
                                    }`}
                                >
                                    All
                                </button>
                                {muscleGroups.map(group => (
                                    <button 
                                        key={group}
                                        onClick={() => handleFilterClick('muscleGroup', group)}
                                        className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                                            filters.muscleGroup === group 
                                            ? 'bg-bluePrimary text-white' 
                                            : 'bg-backgoudBlack hover:bg-borderGrayHover'
                                        }`}
                                    >
                                        {group.charAt(0) + group.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista ćwiczeń lub wskaźnik ładowania */}
                {loading && exercises.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <ExerciseSkeleton key={index} />
                        ))}
                    </div>
                ) : exercises.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {exercises.map((ex, index) => {
                            const isLastElement = exercises.length === index + 1;
                            return (
                               <div 
                                    key={`${ex.id}-${index}`}
                                    ref={isLastElement ? lastExerciseElementRef : null}
                                    className="relative group bg-surfaceDarkGray rounded-2xl border border-borderGrayHover shadow-sm overflow-hidden 
                                               transition-all duration-300 ease-in-out hover:border-bluePrimary hover:shadow-lg hover:shadow-bluePrimary/10 hover:-translate-y-1"
                               >
                                   <Link to={`/training/exercises/${ex.id}`} className="block p-5">
                                       <span className={`absolute top-0 left-0 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-br-lg ${
                                           difficultyConfig[ex.difficulty].bg + ' ' + difficultyConfig[ex.difficulty].text
                                       }`}>
                                           {ex.difficulty}
                                       </span>
                                       <div className="mt-8">
                                           <h3 className="text-xl font-bold text-whitePrimary truncate pr-10">{ex.name}</h3>
                                           <p className="text-sm text-borderGrayHover capitalize mt-1">{ex.muscleGroup.toLowerCase().replace('_', ' ')}</p>
                                       </div>
                                   </Link>
                                   <button 
                                       onClick={(e) => handleOpenAddModal(ex, e)}
                                       title="Add to training plan"
                                       className="absolute top-4 right-4 bg-bluePrimary/80 hover:bg-bluePrimary text-white p-2.5 rounded-full shadow-lg 
                                                  opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-200 cursor-pointer"
                                   >
                                       <FaPlus size={14} />
                                   </button>
                               </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-borderGrayHover py-16">No exercises found matching the filters.</p>
                )}

                {isFetchingMore && (
                    <div className="flex justify-center items-center pt-8">
                        <CgSpinner className="animate-spin text-bluePrimary text-4xl" />
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedExercise && (
                <AddExerciseToPlanModal
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    exercise={selectedExercise}
                />
            )}

            <Footer />
        </div>
    );
}