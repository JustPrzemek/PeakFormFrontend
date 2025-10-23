// src/components/history/LastSessionCard.jsx

import { FaClock, FaDumbbell } from 'react-icons/fa';
import { formatDuration, formatDate } from '../../utils/formatters';

export default function LastSessionCard({ session, onSessionClick }) {
    if (!session) {
        return (
            <div className="bg-surfaceDarkGray p-6 rounded-2xl text-center text-borderGrayHover">
                Brak ostatniej sesji treningowej.
            </div>
        );
    }

    return (
        <div 
            className="bg-surfaceDarkGray rounded-2xl shadow-lg p-6 cursor-pointer hover:border-bluePrimary border border-transparent transition-all"
            onClick={() => onSessionClick(session.sessionId)}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-bluePrimary">{session.planName} - {session.dayIdentifier}</h3>
                <span className="text-sm text-borderGrayHover">{formatDate(session.startTime)}</span>
            </div>
            <p className="text-sm text-borderGrayHover mb-4">{session.notes || "Brak notatek."}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <FaClock className="text-bluePrimary" />
                    <span className="text-sm">{formatDuration(session.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaDumbbell className="text-bluePrimary" />
                    <span className="text-sm">{session.excerciseLogsList.length} ćwiczeń</span>
                </div>
            </div>

            <h4 className="font-semibold mb-2">Podsumowanie ćwiczeń:</h4>
            <ul className="text-sm text-borderGrayHover list-disc list-inside max-h-32 overflow-y-auto">
                {session.excerciseLogsList.slice(0, 5).map(log => (
                     <li key={log.id}>{log.exerciseName}: {log.reps}x{log.weight}kg</li>
                ))}
                {session.excerciseLogsList.length > 5 && <li>...i więcej</li>}
            </ul>
        </div>
    );
}