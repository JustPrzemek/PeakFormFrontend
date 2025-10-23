// src/components/session/SessionDetailHeader.jsx

import { FaClock } from 'react-icons/fa';
import { formatDuration, formatDate } from '../../utils/formatters';

export default function SessionDetailHeader({ planName, startTime, dayIdentifier, duration }) {
    return (
        <header className="mb-8 p-6 bg-surfaceDarkGray rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-3xl font-bold text-whitePrimary">{planName}</h1>
                <span className="text-sm text-borderGrayHover mt-1 md:mt-0">{formatDate(startTime)}</span>
            </div>
            <div className="flex items-center gap-6 text-borderGrayHover">
                <span className="bg-bluePrimary/20 text-bluePrimary font-semibold px-4 py-1 rounded-full text-sm">{dayIdentifier}</span>
                <div className="flex items-center gap-2">
                    <FaClock />
                    <span>{formatDuration(duration)}</span>
                </div>
            </div>
        </header>
    );
}