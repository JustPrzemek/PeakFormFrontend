// src/components/modals/ConfirmationModal.jsx
import { useEffect, useCallback } from 'react';

/**
 * Modal potwierdzenia akcji - proste okno dialogowe do potwierdzania operacji.
 * 
 * Używany do potwierdzania akcji, które mogą być nieodwracalne (np. usuwanie).
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy anulowaniu/zamknięciu
 * @param {function} props.onConfirm - Funkcja wywoływana przy potwierdzeniu
 * @param {string} props.title - Tytuł modala
 * @param {string} props.message - Wiadomość do wyświetlenia
 */
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    
    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Obsługa zamykania modala klawiszem Escape.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    /**
     * Blokuje scrollowanie body, gdy modal jest otwarty.
     */
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY ==========
    
    /**
     * Obsługuje kliknięcie przycisku potwierdzenia.
     * Wywołuje onConfirm i zamyka modal.
     */
    const handleConfirm = useCallback(() => {
        onConfirm();
        onClose();
    }, [onConfirm, onClose]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

    // ========== RENDEROWANIE ==========
    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm" 
            onClick={onClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 border border-borderGrayHover" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tytuł */}
                <h3 className="text-lg font-bold text-whitePrimary mb-2">{title}</h3>
                
                {/* Wiadomość */}
                <p className="text-sm text-borderGrayHover mb-6">{message}</p>
                
                {/* Przyciski akcji */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-backgoudBlack text-whitePrimary rounded-lg hover:bg-borderGrayHover/50 transition-colors duration-300"
                        aria-label="Cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-red-500 text-whitePrimary rounded-lg hover:bg-red-600 transition-colors duration-300"
                        aria-label="Confirm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}