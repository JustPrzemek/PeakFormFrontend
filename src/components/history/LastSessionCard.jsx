import { FaClock, FaDumbbell } from 'react-icons/fa';
import { formatDuration, formatDate } from '../../utils/formatters'; // Twoje importy

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
            {/* --- NAGŁÓWEK KARTY --- */}
            {/* flex-col: układamy elementy jeden pod drugim */}
            {/* items-start: wyrównujemy do lewej */}
            <div className="flex flex-col items-start mb-4 gap-1">
                
                {/* 1. DATA (Na samej górze) */}
                <span className="text-xs text-borderGrayHover font-medium tracking-wide">
                    {formatDate(session.startTime)} - {formatDate(session.endTime)}
                </span>
                
                {/* 2. TYTUŁ (Poniżej daty) */}
                {/* truncate: ucina tekst i dodaje kropki, jeśli jest za długi */}
                {/* w-full: zajmuje całą szerokość, żeby truncate wiedział kiedy uciąć */}
                <h3 
                    className="text-xl md:text-2xl font-bold text-bluePrimary truncate w-full"
                    title={`${session.planName} - ${session.dayIdentifier}`} 
                >
                    {session.planName} - {session.dayIdentifier}
                </h3>

            </div>

            {/* Notatki */}
            <p className="text-sm text-borderGrayHover mb-4 line-clamp-2">
                {session.notes || "Brak notatek."}
            </p>
            
            {/* Statystyki (Czas i Ilość ćwiczeń) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <FaClock className="text-bluePrimary flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">{formatDuration(session.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaDumbbell className="text-bluePrimary flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">{session.excerciseLogsList.length} ćwiczeń</span>
                </div>
            </div>

            {/* Lista ćwiczeń */}
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-whitePrimary/80">Podsumowanie ćwiczeń:</h4>
            <ul className="text-sm text-borderGrayHover list-disc list-inside max-h-32 overflow-y-auto custom-scrollbar">
                {session.excerciseLogsList.slice(0, 5).map(log => (
                     <li key={log.id} className="truncate">
                        <span className="font-medium text-whitePrimary">{log.exerciseName}</span>: {log.reps}x{log.weight}kg
                     </li>
                ))}
                {session.excerciseLogsList.length > 5 && <li className="mt-1 italic opacity-70">...i więcej</li>}
            </ul>
        </div>
    );
}