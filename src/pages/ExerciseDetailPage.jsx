import { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import { getExerciseById } from '../services/exerciseService';
import { IoMdArrowRoundBack } from "react-icons/io";
import Footer from '../components/Footer';
import { FaArrowLeft } from 'react-icons/fa';

export default function ExerciseDetailPage() {
    const { id } = useParams();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExerciseById(id)
            .then(data => setExercise(data))
            .catch(error => console.error("Error fetching details:", error))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (!exercise) return <p className="text-center mt-10">Exercise not found.</p>;

    return (
        <div className="bg-backgoudBlack">
            <div className="container mx-auto p-8 min-h-screen">
                <Link to="/training/exercises">
                    <button className="mb-8 text-bluePrimary">
                        <FaArrowLeft 
                            className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" 
                        />
                    </button>
                </Link>
                <div className="bg-surfaceDarkGray p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold mb-4 text-whitePrimary">{exercise.name}</h1>
                    <div className="flex space-x-4 mb-6">
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-borderGrayHover">Muscle Group: {exercise.muscleGroup}</span>
                        <span className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blueHover">Difficulty: {exercise.difficulty}</span>
                    </div>
                    <div className="prose max-w-none text-whitePrimary">
                        <h2 className="text-2xl font-semibold ">Description</h2>
                        <p>{exercise.description || "No description available."}</p>

                        {exercise.videoUrl && (
                            <>
                                <h2 className="text-2xl font-semibold mt-6">Instructional Video</h2>
                                <div className="video-container">
                                    <iframe 
                                        src={exercise.videoUrl.replace("watch?v=", "embed/")} 
                                        title={exercise.name} 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        className="w-full h-full rounded-lg"
                                    ></iframe>
                                    {/* <a href={exercise.videoUrl} className="coursor-pointer hover:underline">tuaj kliknij w linka</a> */}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div>
                    
                </div>
            </div>
            <Footer/>
        </div>
    );
}