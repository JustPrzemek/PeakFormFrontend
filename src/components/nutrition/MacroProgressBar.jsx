// src/components/nutrition/MacroProgressBar.jsx
import { useMemo } from 'react';

/**
 * Komponent paska postępu dla makroskładników (białko, węglowodany, tłuszcze).
 * 
 * Wyświetla wizualny pasek pokazujący, ile użytkownik zjadł w stosunku do celu.
 * 
 * @param {object} props
 * @param {string} props.label - Etykieta wyświetlana po lewej (np. "Protein", "Carbs", "Fat")
 * @param {number} props.current - Aktualna wartość zjedzona (np. 120)
 * @param {number} props.target - Wartość docelowa (np. 180)
 * @param {string} props.unit - Jednostka wyświetlana (domyślnie "g")
 * @param {string} props.colorClass - Klasa CSS Tailwind dla koloru paska (np. "bg-bluePrimary")
 */
export default function MacroProgressBar({ label, current, target, unit = "g", colorClass }) {
    
    // ========== OBLICZENIA (useMemo) ==========
    // useMemo - memoizuje wynik obliczeń
    // Dzięki temu obliczenia wykonują się tylko, gdy zmienią się current lub target
    // To optymalizacja wydajności - nie przeliczamy przy każdym renderze
    
    /**
     * Oblicza procent wypełnienia paska.
     * Math.min - zapewnia, że procent nie przekroczy 100% (nawet jeśli zjedliśmy więcej niż cel)
     */
    const percentage = useMemo(() => {
        // Zabezpieczenie przed dzieleniem przez zero
        if (target <= 0) return 0;
        // Oblicz procent i ogranicz do maksymalnie 100%
        return Math.min((current / target) * 100, 100);
    }, [current, target]);
    
    /**
     * Formatuje wyświetlaną wartość - zaokrągla do całkowitej liczby.
     * useMemo - nie przelicza przy każdym renderze, tylko gdy zmienią się wartości
     */
    const formattedCurrent = useMemo(() => Math.round(current), [current]);
    const formattedTarget = useMemo(() => Math.round(target), [target]);

    // ========== RENDEROWANIE ==========
    return (
        <div className="w-full">
            {/* Header z etykietą i wartościami */}
            <div className="flex justify-between mb-1">
                {/* Etykieta po lewej */}
                <span className="text-sm font-medium text-whitePrimary">{label}</span>
                {/* Wartości po prawej - aktualna / docelowa */}
                <span className="text-sm font-medium text-borderGrayHover">
                    {formattedCurrent}{unit} / {formattedTarget}{unit}
                </span>
            </div>
            
            {/* Kontener paska postępu */}
            <div className="w-full bg-surfaceDarkGray rounded-full h-2.5">
                {/* Wypełniony pasek - szerokość zależy od percentage */}
                {/* transition-all duration-500 - płynna animacja przy zmianie wartości */}
                <div 
                    className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                    role="progressbar" // Accessibility - informuje screen readery, że to pasek postępu
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${formattedCurrent} out of ${formattedTarget} ${unit}`}
                ></div>
            </div>
        </div>
    );
}