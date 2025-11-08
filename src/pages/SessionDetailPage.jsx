// src/pages/SessionDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSpecificSessionForUser, updateTrainingSession } from '../services/trainingService';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

// Importy nowych komponentów
import SessionDetailHeader from '../components/session/SessionDetailHeader';
import SessionNotesEditor from '../components/session/SessionNotesEditor';
import ExerciseLogGroup from '../components/session/ExerciseLogGroup';
import SessionDetailPageSkeleton from '../components/skeletons/SessionDetailPageSkeleton'; // <-- Dostosuj ścieżkę!

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
                // Grupujemy logi po nazwie ćwiczenia, zachowując kolejność
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
            toast.success("Sesja została zaktualizowana!");
            setIsDirty(false);
        } catch (error) {
            toast.error(error.toString());
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

                {/* Lista logów (edytowalna) */}
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