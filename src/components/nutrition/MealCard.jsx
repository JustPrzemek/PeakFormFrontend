// src/components/nutrition/MealCard.jsx
import { useMemo, useCallback } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

/**
 * Przycisk do dodawania jedzenia do posiłku.
 * 
 * Wyświetlany na dole karty posiłku. Po kliknięciu otwiera modal do wyszukiwania produktów.
 * 
 * @param {object} props
 * @param {function} props.onClick - Funkcja wywoływana po kliknięciu (otwiera modal)
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
 * Komponent karty posiłku wyświetlającej listę zjedzonych produktów.
 * 
 * Pokazuje:
 * - Tytuł posiłku (Breakfast, Lunch, Dinner, Snacks)
 * - Sumę kalorii dla tego posiłku
 * - Listę produktów z możliwością usuwania
 * - Przycisk do dodawania nowych produktów
 * 
 * @param {object} props
 * @param {string} props.title - Tytuł posiłku (np. "Breakfast", "Lunch")
 * @param {Array} props.entries - Tablica wpisów z produktami (z API)
 * @param {function} props.onAddClick - Funkcja wywoływana przy kliknięciu "Add Food"
 * @param {function} props.onDeleteEntry - Funkcja wywoływana przy usuwaniu wpisu (przyjmuje logId)
 */
export default function MealCard({ title, entries, onAddClick, onDeleteEntry }) {
    
    // ========== OBLICZENIA (useMemo) ==========
    // useMemo - memoizuje wynik obliczeń
    // Oblicza sumę kalorii tylko, gdy zmienią się entries
    
    /**
     * Oblicza całkowitą liczbę kalorii dla tego posiłku.
     * reduce - iteruje po tablicy i sumuje wartości caloriesEaten
     */
    const mealTotalCalories = useMemo(() => {
        return entries.reduce((sum, entry) => sum + (entry.caloriesEaten || 0), 0);
    }, [entries]);
    
    /**
     * Formatuje sumę kalorii - zaokrągla do całkowitej liczby.
     */
    const formattedCalories = useMemo(() => Math.round(mealTotalCalories), [mealTotalCalories]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY (useCallback) ==========
    // useCallback - memoizuje funkcję, żeby nie była tworzona na nowo przy każdym renderze
    
    /**
     * Obsługuje kliknięcie przycisku usuwania wpisu.
     * 
     * @param {Event} e - Event kliknięcia
     * @param {number} logId - ID wpisu do usunięcia
     */
    const handleDeleteClick = useCallback((e, logId) => {
        // stopPropagation - zapobiega "bąbelkowaniu" eventu
        // Bez tego kliknięcie w przycisk mogłoby również wywołać onClick na rodzicu
        e.stopPropagation();
        
        // Potwierdzenie przed usunięciem (UX best practice)
        // window.confirm - natywny dialog przeglądarki (można później zastąpić custom modalem)
        if (window.confirm('Are you sure you want to delete this entry?')) {
            onDeleteEntry(logId);
        }
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
            {/* flex-grow - rozciąga się, żeby wypełnić dostępną przestrzeń */}
            <div className="flex-grow space-y-3 mb-4">
                {/* Warunkowe renderowanie - jeśli brak wpisów, pokaż placeholder */}
                {entries.length === 0 ? (
                    <div className="text-center text-borderGrayHover py-4">
                        <p>No food logged yet.</p>
                    </div>
                ) : (
                    /* map - iteruje po tablicy i tworzy element dla każdego wpisu */
                    entries.map(entry => (
                        /* group - klasa Tailwind, pozwala na hover na całym elemencie */
                        <div key={entry.logId} className="flex items-center text-sm group">
                            {/* Informacje o produkcie */}
                            <div className="flex-1 min-w-0">
                                {/* truncate - obcina tekst, jeśli jest za długi */}
                                <p className="text-whitePrimary font-medium truncate">
                                    {entry.name}
                                </p>
                                <p className="text-borderGrayHover truncate">
                                    {/* Wyświetl ilość i jednostkę */}
                                    {Math.round(entry.quantity)}{entry.unit || 'g'}
                                    {/* Wyświetl markę, jeśli istnieje */}
                                    {entry.brand ? ` - ${entry.brand}` : ''}
                                </p>
                            </div>
                            
                            {/* Kalorie dla tego produktu */}
                            <span className="text-whitePrimary font-medium ml-2 mr-2">
                                {Math.round(entry.caloriesEaten)} kcal
                            </span>
                            
                            {/* Przycisk usuwania */}
                            {/* opacity-0 group-hover:opacity-100 - pokazuje się tylko przy najechaniu na cały element */}
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