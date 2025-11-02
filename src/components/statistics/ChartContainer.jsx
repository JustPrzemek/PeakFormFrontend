// src/components/statistics/ChartContainer.jsx
import { CgSpinner } from 'react-icons/cg';
import { ResponsiveContainer } from 'recharts';

export default function ChartContainer({ title, loading, children }) {
    return (
        <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg h-96 flex flex-col">
            <h3 className="text-xl font-semibold text-whitePrimary mb-4">{title}</h3>
            <div className="flex-grow">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <CgSpinner className="animate-spin text-4xl text-bluePrimary" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {children}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}