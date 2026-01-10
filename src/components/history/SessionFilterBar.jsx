// src/components/history/SessionFilterBar.jsx

import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

export default function SessionFilterBar({ search, onSearchChange, sort, onSortChange }) {

    const SortIcon = ({ fieldName }) => {
        if (sort.field !== fieldName) return null;
        return sort.direction === 'desc' ? <FaSortAmountDown className="inline ml-1" /> : <FaSortAmountUp className="inline ml-1" />;
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Filter by plan name or date..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full p-3 pl-10 bg-surfaceDarkGray border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-borderGrayHover" />
            </div>
            <div className="flex gap-2">
                <button onClick={() => onSortChange('endTime')} className={`p-3 rounded-lg ${sort.field === 'endTime' ? 'bg-bluePrimary text-white' : 'bg-surfaceDarkGray text-borderGrayHover'}`}>
                    Date <SortIcon fieldName="endTime" />
                </button>
                <button onClick={() => onSortChange('workoutPlans.name')} className={`p-3 rounded-lg ${sort.field === 'workoutPlans.name' ? 'bg-bluePrimary text-white' : 'bg-surfaceDarkGray text-borderGrayHover'}`}>
                    Plan <SortIcon fieldName="workoutPlans.name" />
                </button>
                <button onClick={() => onSortChange('duration')} className={`p-3 rounded-lg ${sort.field === 'duration' ? 'bg-bluePrimary text-white' : 'bg-surfaceDarkGray text-borderGrayHover'}`}>
                    Duration <SortIcon fieldName="duration" />
                </button>
            </div>
        </div>
    );
}