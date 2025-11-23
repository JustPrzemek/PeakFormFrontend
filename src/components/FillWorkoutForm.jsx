import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getExercisesForPlanDay } from '../services/trainingService';
import { FaDumbbell, FaCheckCircle, FaChevronDown, FaCopy, FaRunning } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

// --- LIMITY ZABEZPIECZAJĄCE ---
const LIMITS = {
    MAX_WEIGHT: 500,       // kg
    MAX_REPS: 1000,        // powtórzenia
    MAX_DURATION: 1440,    // minuty (24h)
    MAX_DISTANCE: 1000     // km
};

const FillWorkoutForm = ({ plan, day, dateStart, dateEnd, onSave }) => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [notes, setNotes] = useState("");
    const [openExerciseId, setOpenExerciseId] = useState(null);

    useEffect(() => {
        setLoading(true);
        getExercisesForPlanDay(plan.id, day)
            .then(data => {
                setExercises(data);
                const initialData = {};
                data.forEach(ex => {
                    if (ex.exerciseType === 'STRENGTH') {
                        initialData[ex.exerciseId] = Array(ex.sets).fill({ reps: ex.reps || '', weight: '' });
                    } else { // CARDIO
                        initialData[ex.exerciseId] = [{ durationMinutes: ex.durationMinutes || '', distanceKm: ex.distanceKm || '' }];
                    }
                });
                setFormData(initialData);
                if (data.length > 0) {
                    setOpenExerciseId(data[0].exerciseId);
                }
            })
            .catch((err) => {
                toast.error("Błąd ładowania ćwiczeń.");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [plan.id, day]);

    const handleSetChange = (exerciseId, setIndex, field, value) => {
        // --- WALIDACJA LIMIÓW ---
        if (value !== '') {
            const numValue = parseFloat(value);
            
            // Blokada liczb ujemnych
            if (numValue < 0) return;

            // Blokada przekroczenia maksymalnych wartości
            if (field === 'weight' && numValue > LIMITS.MAX_WEIGHT) return;
            if (field === 'reps' && numValue > LIMITS.MAX_REPS) return;
            if (field === 'durationMinutes' && numValue > LIMITS.MAX_DURATION) return;
            if (field === 'distanceKm' && numValue > LIMITS.MAX_DISTANCE) return;
            
            // Opcjonalnie: ograniczenie do 2 miejsc po przecinku dla wagi/dystansu
            if ((field === 'weight' || field === 'distanceKm') && value.includes('.') && value.split('.')[1].length > 2) return;
        }

        setFormData(prevData => {
            const newSets = [...prevData[exerciseId]];
            newSets[setIndex] = { ...newSets[setIndex], [field]: value };
            return { ...prevData, [exerciseId]: newSets };
        });
    };

    const handleCopyFromPrevious = (exerciseId, setIndex) => {
        if (setIndex > 0) {
            const previousSet = formData[exerciseId][setIndex - 1];
            handleSetChange(exerciseId, setIndex, 'weight', previousSet.weight);
            handleSetChange(exerciseId, setIndex, 'reps', previousSet.reps);
        }
    };

    const handleSubmit = () => {
        const payloadExercises = [];

        for (const exercise of exercises) {
            const exerciseId = exercise.exerciseId;
            const setsData = formData[exerciseId];
            let setsPayload;

            if (exercise.exerciseType === 'STRENGTH') {
                if (setsData.some(s => s.reps === '' || s.weight === '')) {
                    toast.error(`Uzupełnij wszystkie pola dla "${exercise.name}".`);
                    return;
                }
                setsPayload = setsData.map(s => ({ 
                    reps: parseInt(s.reps), 
                    weight: parseFloat(s.weight) 
                }));
            } else { // CARDIO
                const cardioData = setsData[0];
                if (cardioData.durationMinutes === '') {
                      toast.error(`Uzupełnij czas trwania dla "${exercise.name}".`);
                    return;
                }
                setsPayload = [{
                    durationMinutes: parseInt(cardioData.durationMinutes),
                    distanceKm: cardioData.distanceKm ? parseFloat(cardioData.distanceKm) : null
                }];
            }
            
            payloadExercises.push({
                exerciseId: exerciseId,
                sets: setsPayload
            });
        }
        
        const payload = {
            planId: plan.id,
            dayIdentifier: day,
            workoutDateStart: dateStart,
            workoutDateEnd: dateEnd,
            notes: notes,
            exercises: payloadExercises,
        };
        onSave(payload);
    };
    
    const isExerciseComplete = (exercise) => {
        const setsData = formData[exercise.exerciseId];
        if (!setsData) return false;

        if (exercise.exerciseType === 'STRENGTH') {
            return setsData.every(set => set.reps !== '' && set.weight !== '');
        } else { // CARDIO
            return setsData[0]?.durationMinutes !== '';
        }
    };

    if (loading) return <CgSpinner className="mx-auto my-10 animate-spin text-4xl text-bluePrimary"/>;

    return (
        <div className="animate-fade-in">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold">Log Workout</h2>
                <p className="text-borderGrayHover">{plan.name} - <span className="capitalize">{day.toLowerCase()}</span> on <span className="text-bluePrimary font-semibold">{dateStart}</span></p>
            </header>
            
            <div className="space-y-4">
                {exercises.map(exercise => (
                    <div key={exercise.exerciseId} className="bg-backgoudBlack rounded-2xl overflow-hidden border border-borderGrayHover">
                        <button 
                            className="w-full flex justify-between items-center p-4 text-left"
                            onClick={() => setOpenExerciseId(openExerciseId === exercise.exerciseId ? null : exercise.exerciseId)}
                        >
                            <div className="flex items-center gap-3">
                                {exercise.exerciseType === 'STRENGTH' ? <FaDumbbell className="text-bluePrimary" /> : <FaRunning className="text-green-400" />}
                                <span className="font-bold text-lg text-whitePrimary">{exercise.name}</span>
                                {isExerciseComplete(exercise) && <FaCheckCircle className="text-green-500" />}
                            </div>
                            <FaChevronDown className={`text-borderGrayHover transition-transform ${openExerciseId === exercise.exerciseId ? 'rotate-180' : ''}`} />
                        </button>

                        {openExerciseId === exercise.exerciseId && (
                            <div className="px-4 pb-4 animate-fade-in-down">
                                {exercise.exerciseType === 'STRENGTH' ? (
                                    <>
                                        <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs text-borderGrayHover font-semibold">
                                            <div className="col-span-3">Set</div>
                                            <div className="col-span-4 text-center">Weight (kg)</div>
                                            <div className="col-span-4 text-center">Reps</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {formData[exercise.exerciseId]?.map((set, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                                                <span className="col-span-3 font-bold text-center bg-surfaceDarkGray py-3 rounded-l-lg">{index + 1}</span>
                                                <input 
                                                    type="number" 
                                                    placeholder="kg" 
                                                    min="0"
                                                    max={LIMITS.MAX_WEIGHT}
                                                    step="0.5"
                                                    className="col-span-4 p-3 bg-surfaceDarkGray text-center" 
                                                    value={set.weight} 
                                                    onChange={(e) => handleSetChange(exercise.exerciseId, index, 'weight', e.target.value)} 
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="reps" 
                                                    min="0"
                                                    max={LIMITS.MAX_REPS}
                                                    className="col-span-4 p-3 bg-surfaceDarkGray text-center" 
                                                    value={set.reps} 
                                                    onChange={(e) => handleSetChange(exercise.exerciseId, index, 'reps', e.target.value)} 
                                                />
                                                <div className="col-span-1 flex justify-center bg-surfaceDarkGray h-full items-center rounded-r-lg">
                                                    {index > 0 && <button onClick={() => handleCopyFromPrevious(exercise.exerciseId, index)} title="Copy from previous set"><FaCopy className="text-borderGrayHover hover:text-bluePrimary" /></button>}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : ( // CARDIO
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="text-xs text-borderGrayHover font-semibold mb-1 block">Duration (min)</label>
                                            <input 
                                                type="number" 
                                                placeholder="min" 
                                                min="0"
                                                max={LIMITS.MAX_DURATION}
                                                className="w-full p-3 bg-surfaceDarkGray text-center rounded-lg" 
                                                value={formData[exercise.exerciseId][0].durationMinutes} 
                                                onChange={(e) => handleSetChange(exercise.exerciseId, 0, 'durationMinutes', e.target.value)} 
                                            />
                                        </div>
                                         <div>
                                            <label className="text-xs text-borderGrayHover font-semibold mb-1 block">Distance (km)</label>
                                            <input 
                                                type="number" 
                                                step="0.1" 
                                                placeholder="km" 
                                                min="0"
                                                max={LIMITS.MAX_DISTANCE}
                                                className="w-full p-3 bg-surfaceDarkGray text-center rounded-lg" 
                                                value={formData[exercise.exerciseId][0].distanceKm} 
                                                onChange={(e) => handleSetChange(exercise.exerciseId, 0, 'distanceKm', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <label htmlFor="notes" className="font-semibold text-borderGrayHover mb-2 block">Notes (optional)</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any thoughts on your workout?" className="w-full p-3 bg-backgoudBlack border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary h-24" style={{ colorScheme: 'dark' }}></textarea>
            </div>
            
            <button onClick={handleSubmit} className="mt-8 w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-green-700 transition-colors">
                Save Completed Workout
            </button>
        </div>
    );
};

export default FillWorkoutForm;