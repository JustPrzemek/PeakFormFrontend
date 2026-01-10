// src/components/PlanFilterBar.js

import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { useRef } from 'react';

// Komponent ikony sortowania
const SortIcon = ({ fieldName, sort }) => {
    if (sort.field !== fieldName) return null;
    return sort.direction === 'desc' 
        ? <FaSortAmountDown className="inline ml-1.5" /> 
        : <FaSortAmountUp className="inline ml-1.5" />;
};

export default function PlanFilterBar({ filters, onFilterChange, sort, onSortChange, loading }) {

    // Obsługa zmiany w polach tekstowych (z opóźnieniem - debouncing)
    // Używamy useRef, aby uniknąć tworzenia timeoutu na nowo przy każdym renderze
    const debounceTimeout = useRef(null);

    const handleNameChange = (e) => {
        const value = e.target.value;
        // Ustawiamy filtr 'name' natychmiast, aby input był responsywny
        onFilterChange('name', value, true); // true = nie triggeruj jeszcze fetch'a
        
        // Czyścimy stary timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        // Ustawiamy nowy timeout, który wywoła główną funkcję zmiany filtra (i fetch)
        debounceTimeout.current = setTimeout(() => {
            onFilterChange('name', value, false); // false = teraz triggeruj fetch
        }, 500); // 500ms opóźnienia
    };

    // Obsługa zmiany selectów (natychmiastowa)
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        // Konwertujemy "null" (string) z powrotem na null (typ)
        const filterValue = value === 'null' ? null : value;
        onFilterChange(name, filterValue);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* --- Wyszukiwanie po nazwie --- */}
            <div className="relative flex-grow">
                <input
                    type="text"
                    name="name"
                    placeholder="Filter by plan name..."
                    value={filters.name}
                    onChange={handleNameChange} // Używamy nowej funkcji z debouncingiem
                    className="w-full p-3 pl-10 bg-surfaceDarkGray border border-borderGrayHover rounded-lg text-whitePrimary focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary transition"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-borderGrayHover" />
            </div>

            {/* --- Filtry (Select) --- */}
            <div className="flex flex-col sm:flex-row gap-4">
                <select 
                    name="goal" 
                    value={filters.goal || 'null'} 
                    onChange={handleSelectChange}
                    className="p-3 bg-surfaceDarkGray border border-borderGrayHover rounded-lg text-whitePrimary focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary transition"
                >
                    <option value="null">All goals</option>
                    <option value="reduction">Reduction</option>
                    <option value="bulk">Bulk</option>
                    <option value="maintenance">Maintenance</option>
                </select>

                <select 
                    name="isActive" 
                    value={filters.isActive === null ? 'null' : String(filters.isActive)}
                    onChange={handleSelectChange}
                    className="p-3 bg-surfaceDarkGray border border-borderGrayHover rounded-lg text-whitePrimary focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary transition"
                >
                    <option value="null">All plans</option>
                    <option value="true">Only active</option>
                    <option value="false">Only inactive</option>
                </select>
            </div>

            {/* --- Sortowanie --- */}
            <div className="flex gap-2">
                <button 
                    onClick={() => onSortChange('createdAt')} 
                    className={`p-3 min-w-[100px] text-sm font-semibold rounded-lg transition ${sort.field === 'createdAt' ? 'bg-bluePrimary text-white' : 'bg-surfaceDarkGray text-borderGrayHover hover:bg-borderGrayHover/30'}`}
                >
                    Date <SortIcon fieldName="createdAt" sort={sort} />
                </button>
                <button 
                    onClick={() => onSortChange('name')} 
                    className={`p-3 min-w-[100px] text-sm font-semibold rounded-lg transition ${sort.field === 'name' ? 'bg-bluePrimary text-white' : 'bg-surfaceDarkGray text-borderGrayHover hover:bg-borderGrayHover/30'}`}
                >
                    Name <SortIcon fieldName="name" sort={sort} />
                </button>
                <button 
                    onClick={() => onSortChange('goal')} 
                    className={`p-3 min-w-[100px] text-sm font-semibold rounded-lg transition ${sort.field === 'goal' ? 'bg-bluePrimary text-white' : 'bg-surfaceDarkGray text-borderGrayHover hover:bg-borderGrayHover/30'}`}
                >
                    Goal <SortIcon fieldName="goal" sort={sort} />
                </button>
            </div>
            {loading && <CgSpinner className="animate-spin text-bluePrimary text-2xl" />}
        </div>
    );
}