// src/components/session/ExerciseLogGroup.jsx

import { FaDumbbell, FaRunning, FaClock, FaRulerHorizontal } from 'react-icons/fa';

// Mały komponent wewnętrzny dla tabeli siłowej
const StrengthLogTable = ({ logs, onLogChange }) => (
    <table className="w-full text-left">
        <thead>
            <tr className="text-borderGrayHover text-sm">
                <th className="pb-2 w-1/4">Seria</th>
                <th className="pb-2 w-1/3 text-center">Ciężar (kg)</th>
                <th className="pb-2 w-1/3 text-center">Powt.</th>
            </tr>
        </thead>
        <tbody>
            {logs.map(log => (
                <tr key={log.id} className="border-t border-borderGrayHover/50">
                    <td className="py-3 font-bold">{log.setNumber}</td>
                    <td className="py-3">
                        <input 
                            type="number"
                            value={log.weight || ''}
                            onChange={(e) => onLogChange(log.id, 'weight', e.target.value)}
                            className="w-full p-2 bg-backgoudBlack border border-borderGrayHover rounded-md text-center"
                            placeholder="0"
                        />
                    </td>
                    <td className="py-3">
                        <input 
                            type="number"
                            value={log.reps || ''}
                            onChange={(e) => onLogChange(log.id, 'reps', e.target.value)}
                            className="w-full p-2 bg-backgoudBlack border border-borderGrayHover rounded-md text-center"
                            placeholder="0"
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

// Mały komponent wewnętrzny dla pól cardio
const CardioLogInputs = ({ logs, onLogChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map(log => (
            <div key={log.id} className="flex gap-4">
            <div className="flex-1">
                <label className="text-sm text-borderGrayHover flex items-center gap-1 mb-1"><FaClock /> Czas (min)</label>
                <input 
                    type="number"
                    value={log.durationMinutes || ''}
                    onChange={(e) => onLogChange(log.id, 'durationMinutes', e.target.value)}
                    className="w-full p-2 bg-backgoudBlack border border-borderGrayHover rounded-md"
                    placeholder="0"
                />
            </div>
            <div className="flex-1">
                <label className="text-sm text-borderGrayHover flex items-center gap-1 mb-1"><FaRulerHorizontal /> Dystans (km)</label>
                <input 
                    type="number"
                    step="0.1"
                    value={log.distanceKm || ''}
                    onChange={(e) => onLogChange(log.id, 'distanceKm', e.target.value)}
                    className="w-full p-2 bg-backgoudBlack border border-borderGrayHover rounded-md"
                    placeholder="0.0"
                />
            </div>
            </div>
        ))}
    </div>
);


export default function ExerciseLogGroup({ group, onLogChange }) {
    return (
        <div className="bg-surfaceDarkGray rounded-2xl p-5 border border-borderGrayHover">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                {group.type === 'STRENGTH' ? <FaDumbbell className="text-bluePrimary" /> : <FaRunning className="text-green-400" />}
                {group.name}
            </h3>
            
            {group.type === 'STRENGTH' ? (
                <StrengthLogTable logs={group.logs} onLogChange={onLogChange} />
            ) : (
                <CardioLogInputs logs={group.logs} onLogChange={onLogChange} />
            )}
        </div>
    );
}