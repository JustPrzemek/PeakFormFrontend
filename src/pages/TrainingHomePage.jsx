import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, deleteTrainingSession } from '../services/trainingService';
import toast from 'react-hot-toast';
import SelectTrainingDay from './SelectTrainingDay';
import ConfirmationModal from '../components/ConfirmationModal'; // Zaimportuj swój modal
import { CgSpinner } from 'react-icons/cg';
import { FaHourglassHalf, FaPlayCircle, FaTrash } from 'react-icons/fa';

// --- NOWY Komponent Modala do wyświetlania pytania ---
const SessionPromptModal = ({ session, onContinue, onDiscard }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-40 animate-fade-in">
        <div className="bg-surfaceDarkGray rounded-2xl shadow-xl w-full max-w-lg m-4 p-8 border border-borderGrayHover text-center">
            <FaHourglassHalf className="mx-auto text-5xl text-bluePrimary mb-4" />
            <h2 className="text-3xl font-bold text-whitePrimary">Wykryto niedokończony trening!</h2>
            <p className="text-borderGrayHover mt-2 mb-8">
                Chcesz kontynuować trening <span className="font-bold text-whitePrimary">{session.planName} - {session.dayIdentifier}</span>?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={onContinue} 
                    className="w-full flex items-center justify-center gap-2 bg-bluePrimary hover:bg-blueHover text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                    <FaPlayCircle /> Kontynuuj
                </button>
                <button 
                    onClick={onDiscard} 
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-borderGrayHover hover:bg-red-900/50 hover:border-red-500 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                    <FaTrash /> Porzuć
                </button>
            </div>
        </div>
    </div>
);


export default function TrainingHomePage() {
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [isDiscardModalOpen, setDiscardModalOpen] = useState(false); // Stan dla modala potwierdzającego
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await getActiveSession();
                setActiveSession(session);
            } catch (error) {
                toast.error("Błąd podczas sprawdzania sesji: " + error.toString());
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const handleContinue = () => {
        navigate(`/training/live/${activeSession.dayIdentifier}`);
    };

    const handleOpenDiscardModal = () => {
        setDiscardModalOpen(true);
    };

    const handleConfirmDiscard = async () => {
        try {
            await deleteTrainingSession(activeSession.sessionId);
            toast.success("Trening porzucony.");
            setActiveSession(null); // Ukryj modal i pokaż normalny widok
        } catch (error) {
            toast.error(error.toString());
        } finally {
            setDiscardModalOpen(false); // Zamknij modal potwierdzający
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-backgoudBlack flex flex-col items-center justify-center text-whitePrimary">
                <CgSpinner className="animate-spin text-bluePrimary text-5xl" />
            </div>
        );
    }

    return (
        <>
            {/* Zawsze renderujemy stronę wyboru, modal pojawi się na wierzchu */}
            <SelectTrainingDay />

            {/* Jeśli jest aktywna sesja, pokaż modal z pytaniem */}
            {activeSession && (
                <SessionPromptModal 
                    session={activeSession}
                    onContinue={handleContinue}
                    onDiscard={handleOpenDiscardModal}
                />
            )}

            {/* Modal do potwierdzenia porzucenia treningu */}
            <ConfirmationModal
                isOpen={isDiscardModalOpen}
                onClose={() => setDiscardModalOpen(false)}
                onConfirm={handleConfirmDiscard}
                title="Potwierdź porzucenie"
                message="Czy na pewno chcesz porzucić ten trening? Wszystkie zapisane postępy zostaną utracone."
            />
        </>
    );
}