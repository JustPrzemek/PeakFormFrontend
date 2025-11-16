// src/components/nutrition/AddFoodModal.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { IoSearch, IoArrowBack } from 'react-icons/io5';
import { CgSpinner } from 'react-icons/cg';
import { FaAppleAlt, FaUtensils } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';
import { searchFoodProducts, logFood } from '../../services/nutritionService';
import toast from 'react-hot-toast';

/**
 * Modal do dodawania produktów spożywczych do dziennika żywieniowego.
 * 
 * Działa w dwóch krokach:
 * 1. Wyszukiwanie produktów w zewnętrznym API
 * 2. Wybór ilości i typu posiłku, następnie zapis
 * 
 * @param {boolean} isOpen - Czy modal jest otwarty
 * @param {function} onClose - Funkcja wywoływana przy zamykaniu modala
 * @param {function} onFoodLogged - Funkcja wywoływana po pomyślnym dodaniu produktu (odświeża dashboard)
 * @param {string} preselectedMealType - Pre-wybrany typ posiłku (BREAKFAST, LUNCH, DINNER, SNACK)
 * @param {Date} selectedDate - Data, dla której dodajemy produkt
 */
export default function AddFoodModal({ isOpen, onClose, onFoodLogged, preselectedMealType, selectedDate }) {
    
    // ========== STAN KOMPONENTU (useState) ==========
    // useState - hook do przechowywania wartości, które mogą się zmieniać w czasie
    // Gdy wartość się zmienia, React automatycznie przerenderowuje komponent
    
    // Krok 1: Stan wyszukiwania produktów
    const [searchTerm, setSearchTerm] = useState(''); // Tekst wpisany przez użytkownika
    const [results, setResults] = useState([]); // Lista znalezionych produktów
    const [isLoading, setIsLoading] = useState(false); // Czy trwa wyszukiwanie (pokazuje spinner)
    
    // Krok 2: Stan formularza dodawania
    const [selectedProduct, setSelectedProduct] = useState(null); // Wybrany produkt (null = krok 1, obiekt = krok 2)
    const [quantity, setQuantity] = useState('100'); // Ilość produktu (domyślnie 100g)
    const [mealType, setMealType] = useState(preselectedMealType || 'BREAKFAST'); // Typ posiłku
    const [isSubmitting, setIsSubmitting] = useState(false); // Czy trwa zapisywanie (blokuje przycisk)
    
    // useRef - hook do przechowywania wartości, która NIE powoduje re-renderu
    // Używamy go do przechowania AbortController, żeby móc anulować requesty
    const abortControllerRef = useRef(null);
    
    // useDebounce - custom hook, który opóźnia aktualizację wartości
    // Dzięki temu nie robimy requestu przy każdym naciśnięciu klawisza,
    // tylko czekamy 300ms po tym, jak użytkownik przestał pisać
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // ========== EFEKTY UBOCZNE (useEffect) ==========
    // useEffect - hook do wykonywania efektów ubocznych (API calls, subskrypcje, itp.)
    // Uruchamia się po każdym renderze (chyba że podamy dependencies)
    
    /**
     * Ustawia domyślny typ posiłku, gdy modal się otwiera.
     * Dependencies: [isOpen, preselectedMealType] - uruchomi się tylko gdy te wartości się zmienią
     */
    useEffect(() => {
        if (isOpen) {
            setMealType(preselectedMealType || 'BREAKFAST');
        }
    }, [isOpen, preselectedMealType]);

    /**
     * Wyszukiwanie produktów w API.
     * Uruchamia się automatycznie, gdy użytkownik przestanie pisać (dzięki debounce).
     * Używa AbortController do anulowania poprzednich requestów, jeśli użytkownik wpisuje dalej.
     */
    useEffect(() => {
        // Anuluj poprzedni request, jeśli istnieje
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Jeśli użytkownik wpisał mniej niż 3 znaki, nie szukaj
        if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) {
            setResults([]);
            setIsLoading(false);
            return;
        }
        
        // Utwórz nowy AbortController dla tego requestu
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        
        setIsLoading(true);
        
        // Wykonaj wyszukiwanie z AbortSignal
        // Przekazujemy signal, żeby móc anulować request, jeśli użytkownik wpisze coś nowego
        searchFoodProducts(debouncedSearchTerm, abortController.signal)
            .then(data => {
                // Sprawdź, czy request nie został anulowany
                if (!abortController.signal.aborted) {
                    setResults(data);
                }
            })
            .catch(error => {
                // Ignoruj błędy z anulowanych requestów (to normalne, gdy użytkownik szybko pisze)
                if (error.name === 'CanceledError' || error.name === 'AbortError' || abortController.signal.aborted) {
                    return;
                }
                // Pokaż błąd tylko dla rzeczywistych błędów (nie anulowanych requestów)
                toast.error(error.message || 'Failed to search for food products.');
                setResults([]);
            })
            .finally(() => {
                // Ustaw isLoading na false tylko, jeśli request nie został anulowany
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            });
        
        // Cleanup function - uruchomi się przed następnym efektem lub gdy komponent się odmontuje
        return () => {
            abortController.abort();
        };
    }, [debouncedSearchTerm]);

    /**
     * Blokuje scrollowanie body, gdy modal jest otwarty.
     * To poprawia UX - użytkownik nie może scrollować strony w tle.
     */
    useEffect(() => {
        if (isOpen) {
            // Zapisz oryginalny overflow
            const originalOverflow = document.body.style.overflow;
            // Zablokuj scroll
            document.body.style.overflow = 'hidden';
            
            // Cleanup - przywróć scroll po zamknięciu
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY (useCallback) ==========
    // useCallback - hook do memoizacji funkcji
    // Dzięki temu funkcja nie jest tworzona na nowo przy każdym renderze
    // To poprawia wydajność, szczególnie gdy przekazujemy funkcje jako props do child components
    
    /**
     * Resetuje stan modala i zamyka go.
     * useCallback z dependencies [onClose] - funkcja zostanie utworzona na nowo tylko, gdy onClose się zmieni
     */
    const handleClose = useCallback(() => {
        // Resetuj wszystkie stany do wartości początkowych
        setSearchTerm('');
        setResults([]);
        setIsLoading(false);
        setSelectedProduct(null);
        setQuantity('100');
        // Anuluj ewentualne trwające requesty
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Wywołaj callback od rodzica
        onClose();
    }, [onClose]);

    /**
     * Przechodzi z kroku 1 (wyszukiwanie) do kroku 2 (formularz).
     * Zapisuje wybrany produkt w stanie.
     */
    const handleResultClick = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    /**
     * Powraca z kroku 2 (formularz) do kroku 1 (wyszukiwanie).
     * Czyści wybrany produkt.
     */
    const handleBack = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    /**
     * Obsługa zamykania modala klawiszem Escape.
     * Dodałem to, bo to standardowa funkcjonalność w modalach (accessibility).
     * Umieszczony tutaj, żeby móc użyć handleClose w dependencies.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        
        // Cleanup - usuń event listener, gdy modal się zamknie
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleClose]); // handleClose jest w useCallback, więc możemy go bezpiecznie dodać

    /**
     * Waliduje i zapisuje produkt do dziennika.
     * async/await - nowoczesny sposób obsługi Promise (zamiast .then/.catch)
     */
    const handleLogFood = useCallback(async (e) => {
        e.preventDefault(); // Zapobiega domyślnemu zachowaniu formularza (przeładowanie strony)
        
        // Walidacja - sprawdź, czy wszystkie pola są wypełnione
        if (!selectedProduct || !quantity || !mealType) {
            toast.error("Please fill all fields.");
            return;
        }
        
        // Walidacja quantity - sprawdź, czy to prawidłowa liczba
        const quantityNum = parseFloat(quantity);
        if (isNaN(quantityNum) || quantityNum <= 0) {
            toast.error("Please enter a valid quantity (greater than 0).");
            return;
        }

        setIsSubmitting(true);
        try {
            // Przygotuj dane do wysłania
            const logData = {
                externalApiId: selectedProduct.externalApiId,
                date: selectedDate, // Data z dashboardu
                mealType: mealType,
                quantity: quantityNum
            };
            
            // Wyślij request do API
            await logFood(logData);
            
            // Sukces - pokaż toast i odśwież dashboard
            toast.success(`${selectedProduct.name} added to ${mealType.toLowerCase()}!`);
            onFoodLogged(); // Callback do rodzica - odświeża dane na dashboardzie
            handleClose(); // Zamknij modal i zresetuj stan

        } catch (error) {
            // Błąd - pokaż komunikat
            toast.error(error.message || 'Failed to log food.');
        } finally {
            // Zawsze ustaw isSubmitting na false, niezależnie od wyniku
            setIsSubmitting(false);
        }
    }, [selectedProduct, quantity, mealType, selectedDate, onFoodLogged, handleClose]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    // Jeśli modal nie jest otwarty, nie renderuj nic (return null)
    // To optymalizacja - nie renderujemy niepotrzebnego HTML
    if (!isOpen) return null;

    // ========== RENDEROWANIE JSX ==========
    // JSX - JavaScript XML - składnia React do tworzenia elementów HTML
    // className - w React używamy className zamiast class (bo class jest słowem kluczowym w JS)
    // onClick - obsługa kliknięcia (event handler)
    // stopPropagation() - zapobiega "bąbelkowaniu" eventu (kliknięcie w modal nie zamknie go)
    
    return (
        // Overlay - ciemne tło modala
        // fixed inset-0 - pozycjonowanie absolutne, pełny ekran
        // z-50 - wysoki z-index, żeby modal był na wierzchu
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={handleClose} // Kliknięcie w tło zamyka modal
        >
            {/* Główny kontener modala */}
            {/* stopPropagation - kliknięcie w modal nie zamknie go (tylko kliknięcie w tło) */}
            <div 
                className="bg-surfaceDarkGray w-full max-w-lg p-6 rounded-2xl shadow-lg border border-borderGrayHover"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Warunkowe renderowanie - jeśli wybrano produkt, pokaż formularz, w przeciwnym razie wyszukiwarkę */}
                {/* selectedProduct ? (...) : (...) - ternary operator (skrócony if-else) */}
                {selectedProduct ? (
                    /* --- KROK 2: Formularz Dodawania Produktu --- */
                    <div>
                        {/* Header z przyciskiem powrotu */}
                        <div className="flex items-center mb-6">
                            <button 
                                onClick={handleBack} 
                                className="text-borderGrayHover hover:text-whitePrimary p-2 rounded-full -ml-2 mr-2"
                                aria-label="Go back to search"
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <h2 className="text-2xl font-bold text-whitePrimary">Log Food</h2>
                        </div>
                        
                        {/* Karta z informacjami o wybranym produkcie */}
                        <div className="flex items-center p-4 bg-backgoudBlack rounded-lg mb-6">
                            <div className="flex-shrink-0 bg-bluePrimary/20 p-3 rounded-full mr-4">
                                <FaAppleAlt className="text-bluePrimary" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                {/* truncate - obcina tekst, jeśli jest za długi */}
                                <p className="text-md font-semibold text-whitePrimary truncate">{selectedProduct.name}</p>
                                <p className="text-sm text-borderGrayHover truncate">
                                    {/* Math.round - zaokrągla liczbę do całkowitej */}
                                    {Math.round(selectedProduct.caloriesPer100g)} kcal per 100{selectedProduct.unit || 'g'}
                                </p>
                            </div>
                        </div>

                        {/* Formularz do wprowadzenia ilości i typu posiłku */}
                        {/* onSubmit - wywołuje handleLogFood, gdy użytkownik naciśnie Enter lub kliknie submit */}
                        <form onSubmit={handleLogFood}>
                            {/* grid grid-cols-2 - układ dwukolumnowy (Tailwind CSS) */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {/* Pole ilości */}
                                <div>
                                    {/* htmlFor - łączy label z inputem (accessibility) */}
                                    <label htmlFor="quantity" className="block text-sm font-medium text-borderGrayHover mb-2">
                                        Quantity
                                    </label>
                                    <div className="relative">
                                        {/* Controlled component - wartość jest kontrolowana przez React (value={quantity}) */}
                                        {/* onChange - aktualizuje stan przy każdej zmianie */}
                                        <input
                                            type="number"
                                            id="quantity"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="p-3 bg-backgoudBlack text-whitePrimary rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                                            min="0"
                                            step="1"
                                        />
                                        {/* Jednostka wyświetlana po prawej stronie inputa */}
                                        <span className="absolute right-3 top-3 text-borderGrayHover">
                                            {selectedProduct.unit || 'g'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Pole typu posiłku */}
                                <div>
                                    <label htmlFor="mealType" className="block text-sm font-medium text-borderGrayHover mb-2">
                                        Meal
                                    </label>
                                    <select 
                                        id="mealType"
                                        value={mealType}
                                        onChange={(e) => setMealType(e.target.value)}
                                        className="p-3 bg-backgoudBlack text-whitePrimary rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-bluePrimary appearance-none"
                                    >
                                        <option value="BREAKFAST">Breakfast</option>
                                        <option value="LUNCH">Lunch</option>
                                        <option value="DINNER">Dinner</option>
                                        <option value="SNACK">Snack</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Przycisk submit */}
                            {/* disabled - wyłącza przycisk, gdy isSubmitting jest true */}
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center gap-2 bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300 disabled:opacity-50"
                            >
                                {/* Warunkowe renderowanie - pokaż spinner podczas zapisywania, w przeciwnym razie ikonę */}
                                {isSubmitting ? (
                                    <CgSpinner className="animate-spin" size={24} />
                                ) : (
                                    <FaUtensils />
                                )}
                                Add to Log
                            </button>
                        </form>
                    </div>

                ) : (
                    /* --- KROK 1: Wyszukiwarka Produktów --- */
                    <div>
                        <h2 className="text-2xl font-bold text-whitePrimary mb-6">Add Food</h2>
                        
                        {/* Pole wyszukiwania z ikoną */}
                        <div className="relative w-full mb-4">
                            {/* Ikona wyszukiwania - pozycjonowana absolutnie */}
                            <IoSearch className="absolute left-4 top-4 text-borderGrayHover" size={20} />
                            {/* sr-only - ukrywa label wizualnie, ale jest dostępny dla screen readerów (accessibility) */}
                            <label htmlFor="search-food-input" className="sr-only">Search food</label>
                            <input 
                                id="search-food-input"
                                type="text" 
                                placeholder="Search food products..." 
                                className="p-3 bg-backgoudBlack text-whitePrimary rounded-lg w-full pl-12 focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoComplete="off" // Wyłącz autouzupełnianie przeglądarki
                            />
                        </div>

                        {/* Lista wyników wyszukiwania */}
                        {/* max-h-80 overflow-y-auto - maksymalna wysokość z scrollowaniem */}
                        <div className="max-h-80 overflow-y-auto">
                            {/* Warunkowe renderowanie - pokaż spinner podczas ładowania */}
                            {isLoading && (
                                <div className="flex justify-center items-center p-8">
                                    <CgSpinner className="animate-spin text-bluePrimary" size={40} />
                                </div>
                            )}
                            
                            {/* Warunkowe renderowanie - pokaż listę, jeśli są wyniki i nie trwa ładowanie */}
                            {!isLoading && results.length > 0 && (
                                <ul className="divide-y divide-borderGrayHover/30">
                                    {/* map - iteruje po tablicy i tworzy element dla każdego produktu */}
                                    {/* key - wymagany prop w React, pomaga React zoptymalizować renderowanie */}
                                    {results.map(product => (
                                        <li 
                                            key={product.externalApiId} 
                                            className="flex items-center p-4 hover:bg-backgoudBlack rounded-lg cursor-pointer transition-colors"
                                            onClick={() => handleResultClick(product)}
                                        >
                                            <div className="flex-shrink-0 bg-bluePrimary/20 p-3 rounded-full mr-4">
                                                <FaAppleAlt className="text-bluePrimary" size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-md font-semibold text-whitePrimary truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm text-borderGrayHover truncate">
                                                    {/* || - operator OR, jeśli brand nie istnieje, użyj 'No brand' */}
                                                    {product.brand || 'No brand'} - {Math.round(product.caloriesPer100g)} kcal per 100g
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Warunkowe renderowanie - pokaż komunikat, jeśli nie ma wyników */}
                            {/* Sprawdzamy debouncedSearchTerm, żeby nie pokazywać komunikatu przed rozpoczęciem wyszukiwania */}
                            {!isLoading && results.length === 0 && debouncedSearchTerm && debouncedSearchTerm.length >= 3 && (
                                <div className="text-center p-8 text-borderGrayHover">
                                    <p>No products found for "{debouncedSearchTerm}".</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}