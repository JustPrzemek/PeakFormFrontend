import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getExercisesForPlanDay } from '../services/trainingService';
import { FaDumbbell, FaCheckCircle, FaChevronDown, FaCopy } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

const FillWorkoutForm = ({ plan, day, date, onSave }) => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [notes, setNotes] = useState("");
    const [openExerciseId, setOpenExerciseId] = useState(null); // Stan do kontrolowania akordeonu

    useEffect(() => {
        setLoading(true);
        getExercisesForPlanDay(plan.id, day)
            .then(data => {
                setExercises(data);
                const initialData = {};
                data.forEach(ex => {
                    // Wypełnij docelowymi wartościami z planu lub pustymi stringami
                    initialData[ex.exerciseId] = Array(ex.sets).fill({ reps: ex.targetReps || '', weight: ex.targetWeight || '' });
                });
                setFormData(initialData);
                // Automatycznie otwórz pierwsze ćwiczenie
                if (data.length > 0) {
                    setOpenExerciseId(data[0].exerciseId);
                }
            })
            .catch(err => toast.error("Błąd ładowania ćwiczeń."))
            .finally(() => setLoading(false));
    }, [plan.id, day]);

    const handleSetChange = (exerciseId, setIndex, field, value) => {
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
        // Prosta walidacja - sprawdzenie czy żadne pole nie jest puste
        for (const exId in formData) {
            for (const set of formData[exId]) {
                if (set.reps === '' || set.weight === '') {
                    toast.error("Uzupełnij wszystkie pola przed zapisaniem.");
                    return;
                }
            }
        }

        const payload = {
            planId: plan.id,
            dayIdentifier: day,
            workoutDate: date,
            notes: notes,
            exercises: Object.entries(formData).map(([exerciseId, sets]) => ({
                exerciseId: parseInt(exerciseId),
                sets: sets.map(s => ({ reps: parseInt(s.reps), weight: parseFloat(s.weight) })),
            })),
        };
        onSave(payload);
    };
    
    // Funkcja sprawdzająca, czy wszystkie pola dla danego ćwiczenia są wypełnione
    const isExerciseComplete = (exerciseId) => {
        return formData[exerciseId]?.every(set => set.reps !== '' && set.weight !== '');
    };

    if (loading) return <CgSpinner className="mx-auto my-10 animate-spin text-4xl text-bluePrimary"/>;

    return (
        <div className="animate-fade-in">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold">Log Workout</h2>
                <p className="text-borderGrayHover">{plan.name} - <span className="capitalize">{day.toLowerCase()}</span> on <span className="text-bluePrimary font-semibold">{date}</span></p>
            </header>
            
            <div className="space-y-4">
                {exercises.map(exercise => (
                    <div key={exercise.exerciseId} className="bg-backgoudBlack rounded-2xl overflow-hidden border border-borderGrayHover">
                        {/* Nagłówek akordeonu */}
                        <button 
                            className="w-full flex justify-between items-center p-4 text-left"
                            onClick={() => setOpenExerciseId(openExerciseId === exercise.exerciseId ? null : exercise.exerciseId)}
                        >
                            <div className="flex items-center gap-3">
                                <FaDumbbell className="text-bluePrimary" />
                                <span className="font-bold text-lg text-whitePrimary">{exercise.name}</span>
                                {isExerciseComplete(exercise.exerciseId) && <FaCheckCircle className="text-green-500" />}
                            </div>
                            <FaChevronDown className={`text-borderGrayHover transition-transform ${openExerciseId === exercise.exerciseId ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Rozwijana zawartość */}
                        {openExerciseId === exercise.exerciseId && (
                            <div className="px-4 pb-4 animate-fade-in-down">
                                {/* Nagłówki tabeli */}
                                <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs text-borderGrayHover font-semibold">
                                    <div className="col-span-3">Set</div>
                                    <div className="col-span-4 text-center">Weight (kg)</div>
                                    <div className="col-span-4 text-center">Reps</div>
                                    <div className="col-span-1"></div>
                                </div>
                                {/* Wiersze z polami */}
                                {formData[exercise.exerciseId]?.map((set, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                                        <span className="col-span-3 font-bold text-center bg-surfaceDarkGray py-3 rounded-l-lg">
                                            {index + 1}
                                        </span>
                                        <input
                                            type="number"
                                            placeholder="kg"
                                            className="col-span-4 p-3 bg-surfaceDarkGray text-center"
                                            value={set.weight}
                                            onChange={(e) => handleSetChange(exercise.exerciseId, index, 'weight', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="reps"
                                            className="col-span-4 p-3 bg-surfaceDarkGray text-center"
                                            value={set.reps}
                                            onChange={(e) => handleSetChange(exercise.exerciseId, index, 'reps', e.target.value)}
                                        />
                                        <div className="col-span-1 flex justify-center bg-surfaceDarkGray h-full items-center rounded-r-lg">
                                            {index > 0 && (
                                                <button onClick={() => handleCopyFromPrevious(exercise.exerciseId, index)} title="Copy from previous set">
                                                    <FaCopy className="text-borderGrayHover hover:text-bluePrimary" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pole na notatki */}
            <div className="mt-8">
                <label htmlFor="notes" className="font-semibold text-borderGrayHover mb-2 block">Notes (optional)</label>
                <textarea 
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts on your workout?"
                    className="w-full p-3 bg-backgoudBlack border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary h-24"
                    style={{ colorScheme: 'dark' }}
                ></textarea>
            </div>
            
            <button onClick={handleSubmit} className="mt-8 w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-green-700 transition-colors">
                Save Completed Workout
            </button>
        </div>
    );
};

export default FillWorkoutForm;