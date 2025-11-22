// src/components/history/AllSessionTile.jsx

import { FaClock } from 'react-icons/fa';
import { formatDuration, formatDate } from '../../utils/formatters';

export default function AllSessionTile({ session, onSessionClick }) {
    return (
        <div 
            className="bg-surfaceDarkGray p-4 rounded-2xl cursor-pointer border border-borderGrayHover hover:border-bluePrimary hover:shadow-lg transition-all"
            onClick={() => onSessionClick(session.sessionId)}
        >
            {/* Flex container dla Nagłówka i Daty */}
            <div className="flex justify-between items-start mb-2 gap-3">
                
                {/* 1. Tytuł z 'truncate' (ucina tekst i dodaje ...) */}
                {/* Dodatkowo 'title' pokazuje pełną nazwę po najechaniu myszką */}
                <h4 
                    className="font-bold text-lg text-whitePrimary truncate" 
                    title={session.planName} 
                >
                    {session.planName}
                </h4>

                {/* 2. Data z 'flex-shrink-0' (gwarantuje, że data się nie zwinie) */}
                <span className="text-xs text-borderGrayHover whitespace-nowrap flex-shrink-0 mt-1">
                    {formatDate(session.startTime)}
                </span>
            </div>

            <div className="flex justify-between items-center text-sm text-borderGrayHover">
                <span className="bg-bluePrimary/20 text-bluePrimary font-semibold px-3 py-1 rounded-full text-xs">
                    {session.dayIdentifier}
                </span>
                <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{formatDuration(session.duration)}</span>
                </div>
            </div>
        </div>
    );
}