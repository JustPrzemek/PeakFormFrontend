// src/components/nutrition/MealCard.jsx
import { useMemo, useCallback } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

/**
 * Przycisk do dodawania jedzenia do posiłku.
 */
const AddFoodButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center w-full gap-2 text-bluePrimary font-semibold py-3 px-4 rounded-lg bg-backgoudBlack hover:bg-borderGrayHover/30 transition-colors duration-300"
        aria-label="Add food to meal"
    >
        <FaPlus /> Add Food
    </button>
);

/**
 * Komponent karty posiłku.
 */
export default function MealCard({ title, entries, onAddClick, onDeleteEntry }) {
    
    // ========== OBLICZENIA (useMemo) ==========
    const mealTotalCalories = useMemo(() => {
        return entries.reduce((sum, entry) => sum + (entry.caloriesEaten || 0), 0);
    }, [entries]);
    
    const formattedCalories = useMemo(() => Math.round(mealTotalCalories), [mealTotalCalories]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY (useCallback) ==========
    
    /**
     * ZMIANA: Usunięto window.confirm.
     * Teraz funkcja tylko przekazuje sygnał do rodzica (onDeleteEntry),
     * który otworzy Twój customowy ConfirmationModal.
     */
    const handleDeleteClick = useCallback((e, logId) => {
        e.stopPropagation(); // Zapobiega kliknięciu w rodzica
        onDeleteEntry(logId); // Od razu wywołujemy akcję (rodzic otworzy modal)
    }, [onDeleteEntry]);

    // ========== RENDEROWANIE ==========
    return (
        <div className="bg-surfaceDarkGray rounded-2xl p-6 flex flex-col h-full">
            {/* Header z tytułem i sumą kalorii */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-whitePrimary">{title}</h3>
                <span className="text-lg font-semibold text-borderGrayHover">
                    {formattedCalories} kcal
                </span>
            </div>
            
            {/* Lista produktów */}
            <div className="flex-grow space-y-3 mb-4">
                {entries.length === 0 ? (
                    <div className="text-center text-borderGrayHover py-4">
                        <p>No food logged yet.</p>
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry.logId} className="flex items-center text-sm group">
                            {/* Informacje o produkcie */}
                            <div className="flex-1 min-w-0">
                                <p className="text-whitePrimary font-medium truncate">
                                    {entry.name}
                                </p>
                                <p className="text-borderGrayHover truncate">
                                    {Math.round(entry.quantity)}{entry.unit || 'g'}
                                    {entry.brand ? ` - ${entry.brand}` : ''}
                                </p>
                            </div>
                            
                            {/* Kalorie dla tego produktu */}
                            <span className="text-whitePrimary font-medium ml-2 mr-2">
                                {Math.round(entry.caloriesEaten)} kcal
                            </span>
                            
                            {/* Przycisk usuwania */}
                            <button 
                                onClick={(e) => handleDeleteClick(e, entry.logId)}
                                className="text-borderGrayHover hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Delete ${entry.name} entry`}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Przycisk dodawania jedzenia */}
            <AddFoodButton onClick={onAddClick} />
        </div>
    );
}