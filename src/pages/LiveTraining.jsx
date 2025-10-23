import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrCreateSession, addExerciseLog, finishTrainingSession, deleteTrainingSession } from '../services/trainingService';
import toast from 'react-hot-toast';
import { FaPlay, FaCheck, FaInfoCircle, FaArrowRight, FaDumbbell, FaHeartbeat, FaClock, FaSignOutAlt, FaTimes, FaCheckCircle, FaRunning } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import ConfirmationModal from '../components/ConfirmationModal'

const RestTimer = ({ duration, onFinish, exerciseName }) => {
    const [seconds, setSeconds] = useState(duration);

    useEffect(() => {
        if (seconds <= 0) {
            onFinish();
            return;
        }
        const timer = setInterval(() => setSeconds(s => s - 1), 1000);
        return () => clearInterval(timer);
    }, [seconds, onFinish]);

    const formatTime = () => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="text-center my-8 p-8 bg-backgoudBlack rounded-2xl animate-fade-in">
            <p className="text-borderGrayHover">Next up:</p>
            <h3 className="text-2xl font-bold text-whitePrimary mb-4">{exerciseName}</h3>
            <div className="text-7xl font-bold text-bluePrimary tracking-tighter">{formatTime()}</div>
            <button onClick={onFinish} className="mt-6 bg-surfaceDarkGray text-borderGrayHover px-6 py-2 rounded-lg hover:bg-borderGrayHover hover:text-white transition">Skip Rest</button>
        </div>
    );
};

export default function LiveTraining() {
    const { day } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [completedLogs, setCompletedLogs] = useState([]);
    const [isExerciseFinished, setIsExerciseFinished] = useState(false);
    const [isAbandonModalOpen, setAbandonModalOpen] = useState(false);
    const [completedExercisesSummary, setCompletedExercisesSummary] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [strengthInputs, setStrengthInputs] = useState({ weight: '', reps: '' });
    const [cardioInputs, setCardioInputs] = useState({ durationMinutes: '', distanceKm: '' });

    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Wywołujemy nową funkcję, która pobierze aktywny trening lub stworzy nowy
                const sessionData = await getOrCreateSession(day);
                setSession(sessionData);

                // Sprawdzamy, czy backend zwrócił nam jakieś wykonane już serie
                if (sessionData.completedLogs && sessionData.completedLogs.length > 0) {
                    // Jeśli tak, odpalamy logikę, która odtworzy stan
                    restoreTrainingState(sessionData.exercises, sessionData.completedLogs);
                    toast.success("Wznowiono przerwany trening!");
                }
            } catch (error) {
                toast.error("Błąd podczas wznawiania sesji: " + error);
                navigate('/training/start');
            } finally {
                // Niezależnie od wyniku, kończymy ładowanie
                setIsLoading(false);
            }
        };

        initializeSession();
    }, [day, navigate]);

    const restoreTrainingState = (exercises, allLogs) => {
        const logsByExerciseId = allLogs.reduce((acc, log) => {
            if (!acc[log.exerciseId]) acc[log.exerciseId] = [];
            acc[log.exerciseId].push(log);
            return acc;
        }, {});

        let restoredExerciseIndex = 0;
        for (let i = exercises.length - 1; i >= 0; i--) {
            if (logsByExerciseId[exercises[i].exerciseId]) {
                restoredExerciseIndex = i;
                break;
            }
        }
        
        const lastExercisePlan = exercises[restoredExerciseIndex];
        const logsForLastExercise = logsByExerciseId[lastExercisePlan.exerciseId] || [];
        const lastLog = logsForLastExercise[logsForLastExercise.length - 1];

        const summary = [];
        for (let i = 0; i < restoredExerciseIndex; i++) {
             if (logsByExerciseId[exercises[i].exerciseId]) {
                summary.push({ 
                    name: exercises[i].name, 
                    logs: logsByExerciseId[exercises[i].exerciseId],
                    exerciseType: exercises[i].exerciseType
                });             
            }
        }
        
        setCompletedExercisesSummary(summary);
        setCurrentExerciseIndex(restoredExerciseIndex);
        setCompletedLogs(logsForLastExercise);

        // Używamy `sets` dla STRENGTH i uznajemy, że cardio ma zawsze 1 "set"
        const totalSets = lastExercisePlan.exerciseType === 'STRENGTH' ? lastExercisePlan.sets : 1;
        const lastSetNumber = lastLog ? lastLog.setNumber : 0;
        
        if (lastSetNumber >= totalSets) {
            setIsExerciseFinished(true);
            setCurrentSet(totalSets);
        } else {
            setCurrentSet(lastSetNumber + 1);
            setIsExerciseFinished(false);
        }
    };

    const handleSaveSet = async () => {
        const currentExercise = session.exercises[currentExerciseIndex];
        let logData;

        // ZMIANA: Budowanie obiektu logData w zależności od typu
        if (currentExercise.exerciseType === 'STRENGTH') {
            const weightFloat = parseFloat(strengthInputs.weight);
            const repsInt = parseInt(strengthInputs.reps);

            if (isNaN(weightFloat) || isNaN(repsInt) || weightFloat < 0 || repsInt <= 0) {
                return toast.error("Wprowadź poprawne dane dla wagi i powtórzeń.");
            }
            logData = {
                exerciseId: currentExercise.exerciseId,
                setNumber: currentSet,
                reps: repsInt,
                weight: weightFloat,
            };
        } else { // CARDIO
            const durationInt = parseInt(cardioInputs.durationMinutes);
            const distanceFloat = parseFloat(cardioInputs.distanceKm);

            if (isNaN(durationInt) || durationInt <= 0) {
                return toast.error("Wprowadź poprawny czas trwania.");
            }
            logData = {
                exerciseId: currentExercise.exerciseId,
                setNumber: 1, // Cardio ma zawsze jeden "set"
                durationMinutes: durationInt,
                distanceKm: isNaN(distanceFloat) ? null : distanceFloat
            };
        }
        
        try {
            const savedLog = await addExerciseLog(session.sessionId, logData);
            setCompletedLogs(prevLogs => [...prevLogs, savedLog]);
            
            setStrengthInputs({ weight: '', reps: '' });
            setCardioInputs({ durationMinutes: '', distanceKm: '' });

            const totalSets = currentExercise.exerciseType === 'STRENGTH' ? currentExercise.sets : 1;
            if (currentSet >= totalSets) {
                setIsExerciseFinished(true);
            } else {
                setCurrentSet(prev => prev + 1);
                setIsResting(true);
            }
        } catch (error) {
            toast.error("Nie udało się zapisać serii.");
            console.error(error);
        }
    };

    const handleNextExercise = () => {
        const currentExercise = session.exercises[currentExerciseIndex];
        const newSummary = {
            name: currentExercise.name,
            logs: completedLogs,
            exerciseType: currentExercise.exerciseType,
        };
        setCompletedExercisesSummary(prevSummaries => [...prevSummaries, newSummary]);

        if (currentExerciseIndex + 1 < session.exercises.length) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSet(1);
            setCompletedLogs([]);
            setIsExerciseFinished(false);
            setIsResting(false); // Upewnij się, że nie jesteśmy w trybie odpoczynku
        } else {
            handleFinishTraining();
        }
    };

    const handleFinishTraining = async () => {
        try {
            await finishTrainingSession(session.sessionId);
            toast.success("Trening zakończony! Dobra robota!", { duration: 4000 });
            navigate('/training/history');
        } catch (error) {
            toast.error("Błąd podczas kończenia treningu.");
            console.log(error);
        }
    };

    const handleOpenAbandonModal = () => {
        setAbandonModalOpen(true);
    };

    const handleConfirmAbandon = async () => {
        if (session) {
            try {
                await deleteTrainingSession(session.sessionId);
                toast.success("Trening został porzucony.");
                navigate('/training/start'); 
            } catch (error) {
                toast.error("Nie udało się porzucić treningu: " + error.toString());
            } finally {
                setAbandonModalOpen(false); // Zamknij modal po wszystkim
            }
        }
    };

     if (isLoading || !session) {
        return (
            <div className="min-h-screen bg-backgoudBlack flex flex-col items-center justify-center text-whitePrimary">
                <CgSpinner className="animate-spin text-bluePrimary text-5xl mb-4" />
                <p>Przygotowywanie sesji treningowej...</p>
            </div>
        );
    }
    
    const currentExercise = session.exercises[currentExerciseIndex];
    const isStrength = currentExercise.exerciseType === 'STRENGTH';
    const progressPercentage = ((currentExerciseIndex) / session.exercises.length) * 100;

    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary flex flex-col">
            <div className="w-full max-w-3xl mx-auto flex-grow flex flex-col p-4 md:p-8">
                {/* === GŁÓWNY NAGŁÓWEK Z POSTĘPEM === */}
                <header className="mb-8">
                     <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-bluePrimary">
                            Exercise {currentExerciseIndex + 1} / {session.exercises.length}
                        </p>
                        <button onClick={handleOpenAbandonModal} className="text-xs text-borderGrayHover hover:text-red-500 flex items-center gap-1">
                            <FaTimes/> Quit
                        </button>
                     </div>
                    <div className="w-full bg-surfaceDarkGray rounded-full h-2.5">
                        <div className="bg-bluePrimary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </header>

                <main className="flex-grow">
                    {isResting ? (
                        <RestTimer 
                            duration={currentExercise.restTime} 
                            onFinish={() => setIsResting(false)} 
                            exerciseName={session.exercises[currentExerciseIndex + 1]?.name || "Workout Finished"}
                        />
                    ) : isExerciseFinished ? (
                        <div className="text-center my-8 p-8 bg-surfaceDarkGray rounded-2xl animate-fade-in flex flex-col items-center">
                            <FaCheckCircle className="text-6xl text-green-500 mb-4" />
                            <h3 className="text-3xl font-bold">Exercise complete!</h3>
                            <p className="text-borderGrayHover mt-1">Good job!</p>
                            <button onClick={handleNextExercise} className="w-full mt-6 bg-bluePrimary text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg hover:bg-blueHover transition-colors">
                                {currentExerciseIndex + 1 < session.exercises.length ? "Next Exercise" : "Finish Workout"}
                                <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                    ) : (
                        <div className="bg-surfaceDarkGray p-6 rounded-2xl shadow-lg">
                            <div className="text-center">
                                <h2 className="text-3xl sm:text-4xl font-bold">{currentExercise.name}</h2>
                                <p className="text-lg text-blue-400 mt-1">
                                    {/* ZMIANA: Dynamiczne wyświetlanie celu */}
                                    Goal: {isStrength
                                        ? `${currentExercise.sets} sets x ${currentExercise.reps} reps`
                                        : `${currentExercise.durationMinutes} min` + (currentExercise.distanceKm ? ` / ${currentExercise.distanceKm} km` : '')
                                    }
                                </p>
                                <Link to={`/training/exercises/${currentExercise.exerciseId}`} className="inline-flex items-center text-sm text-borderGrayHover hover:text-white mt-2">
                                    <FaInfoCircle className="mr-2" /> View Instructions
                                </Link>
                            </div>
                            
                            <div className="my-6 space-y-2">
                                {completedLogs.map(log => (
                                    <div key={log.id} className="flex justify-between items-center bg-backgoudBlack p-3 rounded-lg text-sm animate-fade-in">
                                        <span className="font-bold text-borderGrayHover">{isStrength ? `Set ${log.setNumber}` : `Activity`}</span>
                                        <span className="text-whitePrimary font-semibold">
                                            {/* ZMIANA: Dynamiczne wyświetlanie logu */}
                                            {isStrength
                                                ? `${log.weight} kg x ${log.reps} reps`
                                                : `${log.durationMinutes} min` + (log.distanceKm ? ` / ${log.distanceKm} km` : '')
                                            }
                                        </span>
                                        <FaCheck className="text-green-500"/>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-dashed border-borderGrayHover/20 pt-6">
                                <h3 className="text-xl font-semibold mb-4 text-center">
                                    {/* ZMIANA: Dynamiczny tytuł */}
                                    {isStrength ? `Log Set ${currentSet} / ${currentExercise.sets}` : 'Log Your Activity'}
                                </h3>
                                {/* ZMIANA: Warunkowe wyświetlanie inputów */}
                                {isStrength ? (
                                    <div className="flex gap-4 mb-4">
                                        <input type="number" placeholder="kg" value={strengthInputs.weight} onChange={(e) => setStrengthInputs(p => ({...p, weight: e.target.value}))} className="w-full p-3 bg-backgoudBlack rounded-lg border border-borderGrayHover text-center text-lg focus:ring-2 focus:ring-bluePrimary" />
                                        <input type="number" placeholder="reps" value={strengthInputs.reps} onChange={(e) => setStrengthInputs(p => ({...p, reps: e.target.value}))} className="w-full p-3 bg-backgoudBlack rounded-lg border border-borderGrayHover text-center text-lg focus:ring-2 focus:ring-bluePrimary" />
                                    </div>
                                ) : (
                                    <div className="flex gap-4 mb-4">
                                        <input type="number" placeholder="Duration (min)" value={cardioInputs.durationMinutes} onChange={(e) => setCardioInputs(p => ({...p, durationMinutes: e.target.value}))} className="w-full p-3 bg-backgoudBlack rounded-lg border border-borderGrayHover text-center text-lg focus:ring-2 focus:ring-bluePrimary" />
                                        <input type="number" step="0.1" placeholder="Distance (km)" value={cardioInputs.distanceKm} onChange={(e) => setCardioInputs(p => ({...p, distanceKm: e.target.value}))} className="w-full p-3 bg-backgoudBlack rounded-lg border border-borderGrayHover text-center text-lg focus:ring-2 focus:ring-bluePrimary" />
                                    </div>
                                )}
                                <button onClick={handleSaveSet} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg transition-colors">
                                    <FaCheck className="mr-2" /> {isStrength ? 'Log Set' : 'Log Activity'}
                                </button>
                            </div>
                        </div>
                    )}

                    {completedExercisesSummary.length > 0 && (
                        <div className="mt-10 pt-6 border-t-2 border-dashed border-borderGrayHover">
                             <h3 className="text-xl font-bold mb-4 text-green-400">✅ Completed Exercises</h3>
                             <div className="space-y-3">
                                  {completedExercisesSummary.map((summary, index) => (
                                     <div key={index} className="bg-surfaceDarkGray p-4 rounded-lg text-left text-sm">
                                          <h4 className="font-bold text-whitePrimary">{summary.name}</h4>
                                          <p className="text-borderGrayHover">
                                            {/* ZMIANA: Poprawne wyświetlanie podsumowania */}
                                            {summary.logs.map(log => 
                                                summary.exerciseType === 'STRENGTH' 
                                                    ? `(${log.weight}kg x ${log.reps})`
                                                    : `(${log.durationMinutes}min` + (log.distanceKm ? ` / ${log.distanceKm}km` : '') + ')'
                                            ).join(' ')}
                                          </p>
                                     </div>
                                  ))}
                             </div>
                        </div>
                     )}
                </main>
            </div>
            
            <footer className="w-full max-w-3xl mx-auto px-4 md:px-8 pb-8 text-center">
                <button 
                    onClick={handleFinishTraining} 
                    className="w-full bg-bluePrimary text-white font-bold py-4 rounded-lg flex items-center justify-center text-xl hover:bg-blueHover transition-colors"
                >
                    Finish & Save Workout <FaArrowRight className="ml-3" />
                </button>
            </footer>

            <ConfirmationModal
                isOpen={isAbandonModalOpen}
                onClose={() => setAbandonModalOpen(false)}
                onConfirm={handleConfirmAbandon}
                title="Porzucić trening?"
                message="Wszystkie zapisane postępy w tej sesji zostaną trwale usunięte. Czy na pewno chcesz kontynuować?"
            />

        </div>
    );
}