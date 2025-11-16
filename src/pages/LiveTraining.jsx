import { useState, useEffect, cloneElement } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrCreateSession, addExerciseLog, finishTrainingSession, deleteTrainingSession } from '../services/trainingService';
import toast from 'react-hot-toast';
import { FaPlay, FaCheck, FaInfoCircle, FaArrowRight, FaDumbbell, FaHeartbeat, FaClock, FaSignOutAlt, FaTimes, FaCheckCircle, FaRunning, FaForward, FaTasks  } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const RestTimer = ({ duration, onFinish, exerciseName }) => {
    const [secondsLeft, setSecondsLeft] = useState(duration);
    const [overtime, setOvertime] = useState(0);
    // Sprawdza, czy odliczanie dobiegło końca
    const isRestFinished = secondsLeft === 0;

    useEffect(() => {
        // Uruchamiamy interwał co sekundę
        const timer = setInterval(() => {
            // Aktualizujemy stan 'secondsLeft'
            setSecondsLeft(s => {
                if (s > 0) {
                    return s - 1; // Jeśli czas > 0, kontynuuj odliczanie
                } else {
                    // Jeśli czas = 0, zacznij liczyć 'nadwyżkę'
                    setOvertime(o => o + 1); 
                    return 0; // Utrzymaj 'secondsLeft' na 0
                }
            });
        }, 1000);

        // Czyścimy interwał po odmontowaniu komponentu
        return () => clearInterval(timer);
    }, []); // Pusta tablica zależności, aby interwał uruchomił się tylko raz

    // Funkcja pomocnicza do formatowania czasu (MM:SS)
    const formatTime = (totalSeconds) => {
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="text-center my-8 p-8 bg-backgoudBlack rounded-2xl animate-fade-in">
            <p className="text-borderGrayHover text-lg">
                {/* Zmienia tekst, gdy przerwa się skończy */}
                {isRestFinished ? "Koniec przerwy!" : "Przerwa przed kolejną serią:"}
            </p>
            <h3 className="text-3xl font-bold text-whitePrimary mb-6">{exerciseName}</h3>

            {/* Zmienia kolor i tekst timera */}
            <div className={`text-7xl font-bold tracking-tighter mb-6 ${isRestFinished ? 'text-yellow-500' : 'text-bluePrimary'}`}>
                {isRestFinished ? `+${formatTime(overtime)}` : formatTime(secondsLeft)}
            </div>

            {/* Zmienia przycisk: 
              - Jeśli przerwa trwa: "Pomiń przerwę" (wywołuje onFinish)
              - Jeśli przerwa się skończyła: "Start Next Set" (też wywołuje onFinish)
            */}
            {isRestFinished ? (
                <button onClick={onFinish} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-lg">
                    Start Next Set <FaArrowRight className="ml-2 inline" />
                </button>
            ) : (
                <button onClick={onFinish} className="w-full bg-surfaceDarkGray text-borderGrayHover px-6 py-3 rounded-lg hover:bg-borderGrayHover hover:text-white transition">
                    Pomiń przerwę
                </button>
            )}
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
    const [isExerciseListModalOpen, setExerciseListModalOpen] = useState(false);
    const [completedExerciseIds, setCompletedExerciseIds] = useState(new Set());
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

        const newCompletedIds = new Set();
        exercises.forEach(ex => {
            const logsForEx = logsByExerciseId[ex.exerciseId] || [];
            const totalSets = ex.exerciseType === 'STRENGTH' ? ex.sets : 1;
            
            // Sprawdź, czy liczba logów jest równa lub większa liczbie serii
            // (Używamy `logsForEx.length` zamiast `setNumber` dla bezpieczeństwa)
            if (logsForEx.length > 0 && logsForEx.length >= totalSets) {
                newCompletedIds.add(ex.exerciseId);
            }
        });
        setCompletedExerciseIds(newCompletedIds);

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

    const loadStateForExercise = (exerciseIndex) => {
        const exercise = session.exercises[exerciseIndex];
        
        // Użyj głównej listy logów z `session`, aby znaleźć logi dla tego ćwiczenia
        const logsForExercise = session.completedLogs.filter(
            log => log.exerciseId === exercise.exerciseId
        );
        
        const lastLog = logsForExercise[logsForExercise.length - 1];
        const lastSetNumber = lastLog ? lastLog.setNumber : 0;
        
        const totalSets = exercise.exerciseType === 'STRENGTH' ? exercise.sets : 1;

        // Ustaw stan
        setCurrentExerciseIndex(exerciseIndex);
        setCompletedLogs(logsForExercise);
        
        if (lastSetNumber >= totalSets) {
            // To ćwiczenie jest już ukończone
            setIsExerciseFinished(true);
            setCurrentSet(totalSets);
            // Upewnij się, że jest w secie (chociaż już powinno być)
            setCompletedExerciseIds(prev => new Set(prev).add(exercise.exerciseId));
        } else {
            // Zacznij od następnej serii
            setCurrentSet(lastSetNumber + 1);
            setIsExerciseFinished(false);
        }
        
        setIsResting(false); // Zawsze zaczynaj od logowania, nie od przerwy
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
            setSession(prevSession => ({
                ...prevSession,
                completedLogs: [...prevSession.completedLogs, savedLog]
            }));
            setCompletedLogs(prevLogs => [...prevLogs, savedLog]);
            
            setStrengthInputs({ weight: '', reps: '' });
            setCardioInputs({ durationMinutes: '', distanceKm: '' });

            const totalSets = currentExercise.exerciseType === 'STRENGTH' ? currentExercise.sets : 1;
            if (currentSet >= totalSets) {
                setIsExerciseFinished(true);
                setCompletedExerciseIds(prevIds => 
                    new Set(prevIds).add(currentExercise.exerciseId)
                );
            } else {
                setCurrentSet(prev => prev + 1);
                setIsResting(true);
            }
        } catch (error) {
            toast.error("Nie udało się zapisać serii.");
            console.error(error);
        }
    };

    const findNextIncompleteExercise = (startIndex) => {
        let nextIndex = startIndex + 1;
        while (nextIndex < session.exercises.length) {
            const nextExerciseId = session.exercises[nextIndex].exerciseId;
            if (!completedExerciseIds.has(nextExerciseId)) {
                return nextIndex; // Znaleziono!
            }
            nextIndex++; // Sprawdź następne
        }
        return -1; // Nie ma więcej nieukończonych ćwiczeń
    };
    
    const handleNextExercise = (saveSummary = true) => {
        if (saveSummary) {
            const currentExercise = session.exercises[currentExerciseIndex];
            
            // --- POPRAWKA TUTAJ: Brakowało tej definicji ---
            const newSummary = {
                name: currentExercise.name,
                logs: completedLogs,
                exerciseType: currentExercise.exerciseType,
            };
            // --- KONIEC POPRAWKI ---

            // Dodaj do podsumowania tylko jeśli logi nie są puste (czyli nie pominięto)
            if (completedLogs.length > 0) {
                 // Ta linia teraz zadziała, bo newSummary istnieje
                 setCompletedExercisesSummary(prevSummaries => [...prevSummaries, newSummary]);
                 
                 // Oznacz jako ukończone (to już się dzieje w handleSaveSet, 
                 // ale podwójne sprawdzenie nie zaszkodzi)
                 setCompletedExerciseIds(prev => new Set(prev).add(currentExercise.exerciseId));
            }
        }

        // --- ZMODYFIKOWANA LOGIKA "NEXT" ---
        const nextIndex = findNextIncompleteExercise(currentExerciseIndex);

        if (nextIndex !== -1) {
            // Przeskocz do następnego dostępnego ćwiczenia
            loadStateForExercise(nextIndex);
        } else {
            // Nie ma więcej dostępnych ćwiczeń
            toast("Wszystkie ćwiczenia ukończone!", { icon: "🎉" });
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

    const handleJumpToExercise = (indexToJump) => {
        const currentExercise = session.exercises[currentExerciseIndex];
        
        // Zapisz częściowe postępy, jeśli użytkownik "porzuca" ćwiczenie w trakcie
        if (completedLogs.length > 0 && !isExerciseFinished) {
            const newSummary = {
                name: currentExercise.name,
                logs: completedLogs,
                exerciseType: currentExercise.exerciseType,
            };
            setCompletedExercisesSummary(prevSummaries => [...prevSummaries, newSummary]);
        }

        // Załaduj stan dla nowego ćwiczenia
        loadStateForExercise(indexToJump);

        // Zamknij modal
        setExerciseListModalOpen(false);
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
                                <div className="flex items-center gap-4">
                                    {/* --- NOWY PRZYCISK --- */}
                                    <button 
                                        onClick={() => setExerciseListModalOpen(true)} 
                                        className="text-xs text-borderGrayHover hover:text-bluePrimary flex items-center gap-1"
                                    >
                                        <FaTasks/> List
                                    </button>
                                    {/* --- KONIEC NOWEGO PRZYCISKU --- */}
                                    <button onClick={handleOpenAbandonModal} className="text-xs text-borderGrayHover hover:text-red-500 flex items-center gap-1">
                                        <FaTimes/> Quit
                                    </button>
                                </div>
                            </div>
                    <div className="w-full bg-surfaceDarkGray rounded-full h-2.5">
                        <div className="bg-bluePrimary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </header>

                <main className="flex-grow">
                    {isResting ? (
                        // ====================================================================
                        // ZMIANA #2: Poprawiony 'exerciseName'
                        // Teraz pokazuje nazwę aktualnego ćwiczenia
                        // ====================================================================
                        <RestTimer 
                            duration={currentExercise.restTime} 
                            onFinish={() => setIsResting(false)} 
                            exerciseName={currentExercise.name} // POPRAWKA BŁĘDU
                        />
                    ) : isExerciseFinished ? (
                        <div className="text-center my-8 p-8 bg-surfaceDarkGray rounded-2xl animate-fade-in flex flex-col items-center">
                            <FaCheckCircle className="text-6xl text-green-500 mb-4" />
                            <h3 className="text-3xl font-bold">Exercise complete!</h3>
                            <p className="text-borderGrayHover mt-1">Good job!</p>
                            {/* ====================================================================
                            // ZMIANA #3: Przycisk "Next" wywołuje handleNextExercise(true)
                            // ==================================================================== */}
                            <button onClick={() => handleNextExercise(true)} className="w-full mt-6 bg-bluePrimary text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg hover:bg-blueHover transition-colors">
                                {currentExerciseIndex + 1 < session.exercises.length ? "Next Exercise" : "Finish Workout"}
                                <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                    ) : (
                        <div className="bg-surfaceDarkGray p-6 rounded-2xl shadow-lg">
                            <div className="text-center">
                                <h2 className="text-3xl sm:text-4xl font-bold">{currentExercise.name}</h2>
                                <p className="text-lg text-blue-400 mt-1">
                                    Goal: {isStrength
                                        ? `${currentExercise.sets} sets x ${currentExercise.reps} reps`
                                        : `${currentExercise.durationMinutes} min` + (currentExercise.distanceKm ? ` / ${currentExercise.distanceKm} km` : '')
                                    }
                                </p>
                                {/* ====================================================================
                                // ZMIANA #3: Dodany przycisk "Pomiń ćwiczenie"
                                // ==================================================================== */}
                                <div className="flex justify-center items-center gap-4 mt-2">
                                    <Link to={`/training/exercises/${currentExercise.exerciseId}`} className="inline-flex items-center text-sm text-borderGrayHover hover:text-white">
                                        <FaInfoCircle className="mr-2" /> View Instructions
                                    </Link>
                                    <button onClick={() => handleNextExercise(false)} className="inline-flex items-center text-sm text-borderGrayHover hover:text-yellow-500">
                                        <FaForward className="mr-2" /> Skip Exercise
                                    </button>
                                </div>
                            </div>
                            
                            {/* Reszta UI logowania serii (bez zmian) */}
                            <div className="my-6 space-y-2">
                                {completedLogs.map(log => (
                                    <div key={log.id} className="flex justify-between items-center bg-backgoudBlack p-3 rounded-lg text-sm animate-fade-in">
                                        <span className="font-bold text-borderGrayHover">{isStrength ? `Set ${log.setNumber}` : `Activity`}</span>
                                        <span className="text-whitePrimary font-semibold">
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
                                    {isStrength ? `Log Set ${currentSet} / ${currentExercise.sets}` : 'Log Your Activity'}
                                </h3>
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

                    {/* Podsumowanie ukończonych (bez zmian) */}
                    {completedExercisesSummary.length > 0 && (
                        <div className="mt-10 pt-6 border-t-2 border-dashed border-borderGrayHover">
                             <h3 className="text-xl font-bold mb-4 text-green-400">✅ Completed Exercises</h3>
                             <div className="space-y-3">
                                  {completedExercisesSummary.map((summary, index) => (
                                       <div key={index} className="bg-surfaceDarkGray p-4 rounded-lg text-left text-sm">
                                            <h4 className="font-bold text-whitePrimary">{summary.name}</h4>
                                            <p className="text-borderGrayHover">
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
            <ExerciseListModal
                isOpen={isExerciseListModalOpen}
                onClose={() => setExerciseListModalOpen(false)}
                exercises={session.exercises}
                onSelect={handleJumpToExercise}
                completedIds={completedExerciseIds}
                currentIndex={currentExerciseIndex}
            />

        </div>
    );
}

// Możesz umieścić to na dole pliku LiveTraining.js, przed `export default`
// lub w osobnym pliku i zaimportować.

// Upewnij się, że masz zaimportowane ikony:
// import { FaTimes, FaCheck, FaDumbbell, FaRunning, FaCheckCircle } from 'react-icons/fa';

const ExerciseListModal = ({ 
    isOpen, 
    onClose, 
    exercises, 
    onSelect, 
    completedIds, 
    currentIndex 
}) => {
    if (!isOpen) return null;

    return (
        // Tło
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            {/* Kontener Modala */}
            <div 
                className="bg-surfaceDarkGray w-full max-w-md rounded-2xl shadow-lg p-6 animate-fade-in"
                onClick={(e) => e.stopPropagation()} // Zapobiegaj zamykaniu po kliknięciu w modal
            >
                {/* Nagłówek Modala */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-whitePrimary">Wybierz ćwiczenie</h2>
                    <button onClick={onClose} className="text-borderGrayHover hover:text-whitePrimary">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Lista Ćwiczeń */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 py-1">
                    {exercises.map((ex, index) => {
                        const isCompleted = completedIds.has(ex.exerciseId);
                        const isCurrent = index === currentIndex;
                        const icon = ex.exerciseType === 'CARDIO' ? <FaRunning /> : <FaDumbbell />;

                        return (
                            <button
                                key={ex.exerciseId}
                                disabled={isCompleted}
                                onClick={() => onSelect(index)}
                                className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors
                                    ${isCompleted 
                                        ? 'bg-backgoudBlack text-borderGrayHover cursor-not-allowed' 
                                        : 'bg-backgoudBlack hover:bg-borderGrayHover/30'
                                    }
                                    ${isCurrent ? 'ring-2 ring-bluePrimary' : ''}
                                `}
                            >
                                <div className={`flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-bluePrimary'}`}>
                                    {isCompleted ? <FaCheckCircle size={22} /> : cloneElement(icon, { size: 22 })}
                                </div>
                                <div className="flex-grow">
                                    <p className={`font-semibold ${isCompleted ? 'line-through' : 'text-whitePrimary'}`}>
                                        {ex.name}
                                    </p>
                                    <p className="text-sm text-borderGrayHover">
                                        {ex.exerciseType === 'STRENGTH' ? `${ex.sets} sets x ${ex.reps} reps` : `${ex.durationMinutes} min`}
                                    </p>
                                </div>
                                {isCurrent && !isCompleted && (
                                    <span className="text-xs font-bold text-bluePrimary">BIEŻĄCE</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};