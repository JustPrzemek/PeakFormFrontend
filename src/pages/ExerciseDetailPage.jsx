import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExerciseById } from '../services/exerciseService';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Footer from '../components/Footer';
import { FaArrowLeft } from 'react-icons/fa';
import AddExerciseToPlanModal from '../components/AddExerciseToPlanModal';

const ExerciseDetailSkeleton = () => (
    <div className="container mx-auto p-4 sm:p-8 animate-pulse">
        <div className="h-10 w-10 bg-surfaceDarkGray rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
                <div className="aspect-w-16 aspect-h-9 bg-surfaceDarkGray rounded-xl"></div>
            </div>
            <div className="lg:col-span-2">
                <div className="h-10 bg-surfaceDarkGray rounded w-3/4 mb-4"></div>
                <div className="flex space-x-2 mb-6">
                    <div className="h-6 w-24 bg-surfaceDarkGray rounded-full"></div>
                    <div className="h-6 w-28 bg-surfaceDarkGray rounded-full"></div>
                </div>
                <div className="h-6 bg-surfaceDarkGray rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-surfaceDarkGray rounded w-full"></div>
                    <div className="h-4 bg-surfaceDarkGray rounded w-full"></div>
                    <div className="h-4 bg-surfaceDarkGray rounded w-5/6"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function ExerciseDetailPage() {
    const { id } = useParams();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true); // Upewnij się, że loading jest ustawiony przy zmianie ID
        getExerciseById(id)
            .then(data => setExercise(data))
            .catch(error => console.error("Error fetching details:", error))
            .finally(() => setLoading(false));
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
    }

    const handleOpenAddModal = () => {
        setAddModalOpen(true);
    };

    if (loading) return <ExerciseDetailSkeleton />;
    if (!exercise) return <p className="text-center mt-10 text-whitePrimary">Exercise not found.</p>;

    return (
        // --- ZMIANA 1: Główny kontener staje się elastyczną kolumną ---
        <div className="bg-backgoudBlack text-whitePrimary min-h-screen flex flex-col">
            
            {/* --- ZMIANA 2: Kontener z treścią dostaje flex-grow --- */}
            <main className="container mx-auto p-4 sm:p-8 flex-grow">
                <button
                onClick={handleGoBack}
                className="inline-block mb-8 text-bluePrimary"
                aria-label="go back to previous page"
                >
                <FaArrowLeft
                    className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110"
                />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12">
                    {/* --- LEWA KOLUMNA: WIDEO --- */}
                    <div className="lg:col-span-3 mb-8 lg:mb-0">
                        {exercise.videoUrl ? (
                            <div className="aspect-video rounded-xl overflow-hidden shadow-lg shadow-black/30">
                                <iframe 
                                    src={exercise.videoUrl.replace("watch?v=", "embed/")} 
                                    title={exercise.name}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="aspect-video rounded-xl bg-surfaceDarkGray flex items-center justify-center">
                                <p className="text-borderGrayHover">No video available</p>
                            </div>
                        )}
                    </div>

                    {/* --- PRAWA KOLUMNA: INFORMACJE --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-surfaceDarkGray p-8 rounded-2xl h-full flex flex-col">
                            <div>
                                <h1 className="text-4xl font-bold text-whitePrimary">{exercise.name}</h1>
                                <div className="flex flex-wrap gap-2 my-4">
                                    <span className="capitalize text-sm font-medium bg-borderGrayHover/20 text-borderGrayHover px-3 py-1 rounded-full">
                                        {exercise.muscleGroup.toLowerCase().replace('_', ' ')}
                                    </span>
                                    <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                                        exercise.difficulty === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                                        exercise.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {exercise.difficulty}
                                    </span>
                                </div>
                                <div className="prose prose-invert max-w-none text-gray-300 mt-6">
                                    <h2 className="text-2xl font-semibold text-whitePrimary">Description</h2>
                                    <p>{exercise.description || "No description available."}</p>
                                </div>
                            </div>
                            
                            {/* --- ZMIANA 3: Przycisk wypchnięty na dół prawej kolumny --- */}
                            <button 
                                className="mt-auto w-full bg-bluePrimary hover:bg-blueHover text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
                                onClick={handleOpenAddModal}
                            >
                                <FaPlus />
                                Add to Plan
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            {exercise && (
                <AddExerciseToPlanModal
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    exercise={exercise}
                />
            )}
            
            <Footer/>
        </div>
    );
}