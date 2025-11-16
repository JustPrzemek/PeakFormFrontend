// src/components/modals/FollowsModal.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { followsService } from '../../services/followService';
import { CgClose, CgSpinner } from "react-icons/cg";
import { useDebounce } from '../../hooks/useDebounce'; // Używamy istniejącego hooka zamiast duplikować kod

/**
 * Modal wyświetlający listę followers/following użytkownika.
 * 
 * Funkcjonalności:
 * - Infinite scroll (automatyczne ładowanie kolejnych stron)
 * - Wyszukiwanie użytkowników
 * - Przejście do profilu użytkownika po kliknięciu
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 * @param {string} props.modalType - Typ modala: 'followers' lub 'following'
 * @param {string} props.username - Nazwa użytkownika, dla którego wyświetlamy listę
 */
export default function FollowsModal({ isOpen, onClose, modalType, username }) {
    // ========== STAN KOMPONENTU ==========
    const [list, setList] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // useDebounce - opóźnia wyszukiwanie, żeby nie robić requestu przy każdym naciśnięciu klawisza
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // useRef - przechowuje IntersectionObserver do infinite scroll
    const observer = useRef();
    
    /**
     * Callback ref dla ostatniego elementu na liście.
     * Gdy ostatni element pojawi się w viewport, ładuje następną stronę.
     * 
     * IntersectionObserver - API przeglądarki do obserwowania, czy element jest widoczny
     */
    const lastUserRef = useCallback(node => {
        if (loading) return; // Nie ładuj, jeśli już trwa ładowanie
        
        // Rozłącz poprzedniego observera
        if (observer.current) observer.current.disconnect();
        
        // Utwórz nowego observera
        observer.current = new IntersectionObserver(entries => {
            // Jeśli ostatni element jest widoczny i są jeszcze dane, załaduj następną stronę
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        // Obserwuj element, jeśli istnieje
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Resetuje stan przy zmianie wyszukiwania, typu modala lub użytkownika.
     * Rozpoczyna pobieranie od początku.
     */
    useEffect(() => {
        setList([]);
        setPage(0);
        setHasMore(true);
    }, [debouncedSearchTerm, modalType, username]);

    /**
     * Pobiera dane z API (followers lub following).
     * Uruchamia się automatycznie, gdy zmieni się page, searchTerm, modalType lub username.
     */
    useEffect(() => {
        if (!isOpen || !hasMore) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Wybierz odpowiednią funkcję w zależności od typu modala
                const fetchFunction = modalType === 'followers' 
                    ? followsService.getFollowers 
                    : followsService.getFollowing;
                
                // Pobierz dane (page, size=20, searchTerm)
                const data = await fetchFunction(username, page, 20, debouncedSearchTerm);
                
                // Dodaj nowe wyniki do istniejącej listy
                setList(prev => [...prev, ...data.content]);
                
                // Sprawdź, czy są jeszcze dane do załadowania
                setHasMore(!data.last);
            } catch (error) {
                console.error(`Failed to fetch ${modalType}:`, error);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, debouncedSearchTerm, modalType, username, isOpen, hasMore]);

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

    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

    // ========== RENDEROWANIE ==========
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center" 
            onClick={onClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl w-full max-w-md h-[70vh] flex flex-col border border-borderGrayHover" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-borderGrayHover">
                    <h2 className="text-lg font-bold capitalize text-whitePrimary">
                        {modalType === 'followers' ? 'Followers' : 'Following'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-borderGrayHover hover:text-whitePrimary transition-colors"
                        aria-label="Close modal"
                    >
                        <CgClose size={24} />
                    </button>
                </header>
                
                {/* Wyszukiwarka */}
                <div className="p-4 border-b border-borderGrayHover">
                    <label htmlFor="follows-search-input" className="sr-only">Search users</label>
                    <input
                        id="follows-search-input"
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-backgoudBlack border border-borderGrayHover rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary text-whitePrimary"
                    />
                </div>

                {/* Lista użytkowników */}
                <ul className="overflow-y-auto flex-grow p-4 space-y-3">
                    {list.map((user, index) => {
                        // Ostatni element dostaje ref do infinite scroll
                        const ref = index === list.length - 1 ? lastUserRef : null;
                        return (
                            <li ref={ref} key={user.username}>
                                <Link 
                                    to={`/profile/${user.username}`} 
                                    onClick={onClose} 
                                    className="flex items-center w-full hover:bg-backgoudBlack p-2 rounded-md transition-colors"
                                >
                                    <img 
                                        src={user.profileImageUrl || 'https://via.placeholder.com/40'} 
                                        alt={user.username} 
                                        className="w-10 h-10 rounded-full mr-4 object-cover" 
                                    />
                                    <span className="font-semibold text-whitePrimary">{user.username}</span>
                                </Link>
                            </li>
                        );
                    })}
                    
                    {/* Spinner podczas ładowania */}
                    {loading && (
                        <div className="flex justify-center py-4">
                            <CgSpinner className="animate-spin text-bluePrimary" size={24} />
                        </div>
                    )}
                    
                    {/* Komunikat - brak więcej użytkowników */}
                    {!hasMore && list.length > 0 && (
                        <p className="text-center text-borderGrayHover py-4">No more users</p>
                    )}
                    
                    {/* Komunikat - brak wyników */}
                    {!loading && list.length === 0 && debouncedSearchTerm && (
                        <p className="text-center text-borderGrayHover py-8">No users found</p>
                    )}
                    
                    {/* Komunikat - pusta lista (bez wyszukiwania) */}
                    {!loading && list.length === 0 && !debouncedSearchTerm && (
                        <p className="text-center text-borderGrayHover py-8">
                            {modalType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                        </p>
                    )}
                </ul>
            </div>
        </div>
    );
}