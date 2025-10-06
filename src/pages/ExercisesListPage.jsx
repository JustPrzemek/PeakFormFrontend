import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getExercises } from '../services/exerciseService';
import { useDebounce } from '../hooks/useDebounce';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { CgSpinner } from "react-icons/cg";
import Footer from '../components/Footer';
import AddExerciseToPlanModal from '../components/AddExerciseToPlanModal';

export default function ExercisesListPage() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [filters, setFilters] = useState({ name: '', muscleGroup: '', difficulty: '' });
    
    // CHANGE: State for infinite scroll
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const debouncedName = useDebounce(filters.name, 500);

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
    // Zmieniono logikę, aby poprawnie resetować listę
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedName, filters.muscleGroup, filters.difficulty, page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setExercises([]);
        setPage(0);
        setHasMore(true);
    };

    const observer = useRef();
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

    const handleOpenAddModal = (exercise, event) => {
        event.preventDefault(); // Zapobiega nawigacji linku
        event.stopPropagation(); // Zapobiega propagacji zdarzenia
        setSelectedExercise(exercise);
        setAddModalOpen(true);
    };

    return (
        <div className="bg-backgoudBlack">
            <div className="container mx-auto p-4 sm:p-8 min-h-screen">
                <Link to="/training">
                    <button className="mb-8 text-bluePrimary">
                        <FaArrowLeft 
                            className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" 
                        />
                    </button>
                </Link>
                <h1 className="text-4xl font-bold mb-2 text-whitePrimary">Exercise Library</h1>
                <p className="text-borderGrayHover mb-8">Find the perfect exercise for yourself.</p>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 text-whitePrimary bg-surfaceDarkGray rounded-lg shadow-sm border border-borderGrayHover ">
                    <input 
                        type="text"
                        name="name"
                        placeholder="Exercise name..."
                        value={filters.name}
                        onChange={handleFilterChange}
                        className="p-2 border border-borderGrayHover rounded-md focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary"
                    />
                    {/* dodac typ jeszce ttuaj i kolory dla leveli*/}
                    <select name="muscleGroup" value={filters.muscleGroup} onChange={handleFilterChange} className="p-2 border text-whitePrimary border-borderGrayHover rounded-md focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary focus:text-borderGrayHover cursor-pointer">
                        <option value="">All muscle groups</option>
                        <option value="CHEST">Chest</option>
                        <option value="BACK">Back</option>
                        <option value="LEGS">Legs</option>
                        <option value="SHOULDERS">Shoulders</option>
                        <option value="BICEPS">Biceps</option>
                        <option value="TRICEPS">Triceps</option>
                        <option value="ABS">Abs</option>
                    </select>
                    <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="p-2 border text-whitePrimary border-borderGrayHover rounded-md focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary cursor-pointer focus:text-borderGrayHover">
                        <option value="">All difficulty levels</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>

                {/* CHANGE: New container for the exercise list */}
                    {loading ? (
                        <div className="flex justify-center items-center p-16">
                            <CgSpinner className="animate-spin text-bluePrimary text-5xl" />
                        </div>
                    ) : exercises.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                            {exercises.map((ex, index) => {
                                const isLastElement = exercises.length === index + 1;
                                return (
                                    <div 
                                        key={`${ex.id}-${index}`}
                                        ref={isLastElement ? lastExerciseElementRef : null}
                                        className="relative group bg-surfaceDarkGray rounded-lg border border-borderGrayHover shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                                    >
                                        <Link to={`/training/exercises/${ex.id}`} className="block p-6 cursor-pointer">
                                            <h3 className="text-xl font-bold text-bluePrimary truncate pr-8">{ex.name}</h3>
                                            <p className="text-borderGrayHover capitalize mt-1">{ex.muscleGroup.toLowerCase().replace('_', ' ')}</p>
                                            <span className="inline-block bg-blue-100 text-blueHover text-xs font-semibold px-2.5 py-0.5 rounded-full mt-3">
                                                {ex.difficulty.replace('_', ' ')}
                                            </span>
                                        </Link>
                                        <button 
                                            onClick={(e) => handleOpenAddModal(ex, e)}
                                            className="absolute top-4 right-4 bg-bluePrimary hover:bg-blueHover text-whitePrimary p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:blueHover focus:outline-none focus:ring-2 focus:ring-bluePrimary focus:ring-opacity-50"
                                            title="Dodaj do planu"
                                        >
                                            <FaPlus size={16} className="cursor-pointer"/>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-borderGrayHover py-16">No exercises found matching the filters.</p>
                    )}

                    {/* CHANGE: Loading indicator for more items */}
                    {isFetchingMore && (
                        <div className="flex justify-center items-center pt-8">
                            <CgSpinner className="animate-spin text-bluePrimary text-4xl" />
                        </div>
                    )}
                </div>

                {selectedExercise && (
                    <AddExerciseToPlanModal
                        isOpen={isAddModalOpen}
                        onClose={() => setAddModalOpen(false)}
                        exercise={selectedExercise}
                    />
                )}

            <div>
                <Footer />
            </div>
        </div>
    );
}