import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSpecificSessionForUser, updateTrainingSession } from '../services/trainingService';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

// Importy Twoich komponentów (ścieżki zostawiam bez zmian)
import SessionDetailHeader from '../components/session/SessionDetailHeader';
import SessionNotesEditor from '../components/session/SessionNotesEditor';
import ExerciseLogGroup from '../components/session/ExerciseLogGroup';
import SessionDetailPageSkeleton from '../components/skeletons/SessionDetailPageSkeleton';

// --- LIMITY ZABEZPIECZAJĄCE ---
const LIMITS = {
    MAX_WEIGHT: 500,
    MAX_REPS: 1000,
    MAX_DURATION: 1440,
    MAX_DISTANCE: 1000
};

export default function SessionDetailPage() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLoading(true);
        setIsDirty(false);
        getSpecificSessionForUser(sessionId)
            .then(data => {
                const groupedLogs = data.excerciseLogsList.reduce((acc, log) => {
                    if (!acc[log.exerciseName]) {
                        acc[log.exerciseName] = {
                            id: log.exerciseId,
                            name: log.exerciseName,
                            type: log.durationMinutes !== null ? 'CARDIO' : 'STRENGTH',
                            logs: []
                        };
                    }
                    acc[log.exerciseName].logs.push(log);
                    return acc;
                }, {});
                
                setSession({
                    ...data,
                    groupedLogs: Object.values(groupedLogs)
                });
            })
            .catch(err => {
                toast.error(err.toString());
                navigate('/training/history');
            })
            .finally(() => setLoading(false));
    }, [sessionId, navigate]);

    const handleLogChange = (logId, field, value) => {
        // --- WALIDACJA ---
        if (value !== '' && value !== null) {
            const numValue = parseFloat(value);
            
            // Blokada liczb ujemnych
            if (numValue < 0) return;

            // Blokada limitów z UNIKALNYM ID dla toasta
            if (field === 'weight' && numValue > LIMITS.MAX_WEIGHT) {
                // ID sprawia, że toast się nie duplikuje
                toast.error(`Maksymalny ciężar to ${LIMITS.MAX_WEIGHT}kg`, { id: 'weight-limit-error' });
                return;
            }
            if (field === 'reps' && numValue > LIMITS.MAX_REPS) {
                toast.error(`Maksymalna liczba powtórzeń to ${LIMITS.MAX_REPS}`, { id: 'reps-limit-error' });
                return;
            }
            if (field === 'durationMinutes' && numValue > LIMITS.MAX_DURATION) {
                toast.error(`Maksymalny czas to ${LIMITS.MAX_DURATION}min`, { id: 'duration-limit-error' });
                return;
            }
            if (field === 'distanceKm' && numValue > LIMITS.MAX_DISTANCE) {
                toast.error(`Maksymalny dystans to ${LIMITS.MAX_DISTANCE}km`, { id: 'distance-limit-error' });
                return;
            }

            // Opcjonalnie: ograniczenie miejsc po przecinku (np. max 2 dla wagi)
            if ((field === 'weight' || field === 'distanceKm') && value.toString().includes('.') && value.toString().split('.')[1].length > 2) return;
        }

        setIsDirty(true);
        setSession(prev => {
            const updatedLogsList = prev.excerciseLogsList.map(log =>
                log.id === logId ? { ...log, [field]: value === '' ? null : parseFloat(value) } : log
            );
            
            const updatedGroupedLogs = prev.groupedLogs.map(group => ({
                ...group,
                logs: group.logs.map(log => 
                    log.id === logId ? { ...log, [field]: value === '' ? null : parseFloat(value) } : log
                )
            }));
            
            return {
                ...prev,
                excerciseLogsList: updatedLogsList,
                groupedLogs: updatedGroupedLogs
            };
        });
    };

    const handleNotesChange = (e) => {
        // Ograniczenie długości notatki sesji
        if (e.target.value.length > 500) {
            toast.error("Notatka nie może być dłuższa niż 500 znaków", { id: 'notes-limit-error' });
            return;
        }
        
        setIsDirty(true);
        setSession(prev => ({ ...prev, notes: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        
        const updateDto = {
            notes: session.notes,
            logsToUpdate: session.excerciseLogsList.map(log => ({
                logId: log.id,
                reps: log.reps,
                weight: log.weight,
                durationMinutes: log.durationMinutes,
                distanceKm: log.distanceKm,
                notes: null 
            }))
        };

        try {
            await updateTrainingSession(sessionId, updateDto);
            toast.success("Sesja została zaktualizowana!", { id: 'save-success' });
            setIsDirty(false);
        } catch (error) {
            toast.error(error.toString(), { id: 'save-error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <SessionDetailPageSkeleton />;    
    }

    if (!session) {
        return <div className="text-center my-40 text-borderGrayHover">Nie znaleziono sesji.</div>;
    }

    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/training/history')}
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="go back"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </button>

                <SessionDetailHeader 
                    planName={session.planName}
                    startTime={session.startTime}
                    dayIdentifier={session.dayIdentifier}
                    duration={session.duration}
                />

                <SessionNotesEditor
                    notes={session.notes}
                    onChange={handleNotesChange}
                />

                <section>
                    <h2 className="text-xl font-semibold mb-4">Zapisane ćwiczenia</h2>
                    <div className="space-y-6">
                        {session.groupedLogs.map(group => (
                            <ExerciseLogGroup
                                key={group.id}
                                group={group}
                                onLogChange={handleLogChange}
                            />
                        ))}
                    </div>
                </section>

                <footer className="mt-10 text-right">
                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <CgSpinner className="animate-spin text-2xl" />
                        ) : (
                            <FaSave />
                        )}
                        {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                    </button>
                </footer>
            </div>
        </div>
    );
}