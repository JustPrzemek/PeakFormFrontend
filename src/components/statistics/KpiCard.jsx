// src/components/statistics/KpiCard.jsx
import { CgSpinner } from 'react-icons/cg';

export default function KpiCard({ title, value, icon, loading, unit = '' }) {
    return (
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg flex items-center">
            <div className="p-3 mr-4 text-bluePrimary bg-neutral-700 rounded-full">
                {icon}
            </div>
            {loading ? (
                <CgSpinner className="animate-spin text-2xl text-bluePrimary" />
            ) : (
                <div>
                    <p className="text-sm text-borderGrayHover font-medium">{title}</p>
                    <p className="text-2xl font-semibold text-whitePrimary">
                        {value} <span className="text-lg text-borderGrayHover">{unit}</span>
                    </p>
                </div>
            )}
        </div>
    );
}