// src/pages/WorkoutHistoryPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLastSessionWithLogs, getAllTrainingSessions } from '../services/trainingService';
import { FaArrowLeft } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounce } from 'use-debounce';

// Importy nowych komponentów
import LastSessionCard from '../components/history/LastSessionCard';
import AllSessionTile from '../components/history/AllSessionTile';
import SessionFilterBar from '../components/history/SessionFilterBar';
import LastSessionCardSkeleton from '../components/skeletons/LastSessionCardSkeleton';
import AllSessionTileSkeleton from '../components/skeletons/AllSessionTileSkeleton';


export default function WorkoutHistoryPage() {
    const navigate = useNavigate();
    
    // Stany dla ostatniej sesji
    const [lastSession, setLastSession] = useState(null);
    const [loadingLast, setLoadingLast] = useState(true);

    // Stany dla listy wszystkich sesji
    const [sessions, setSessions] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingAll, setLoadingAll] = useState(false);
    
    // Stany dla filtrowania i sortowania
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [sort, setSort] = useState({ field: 'endTime', direction: 'desc' });

    // Pobieranie ostatniej sesji
    useEffect(() => {
        setLoadingLast(true);
        getLastSessionWithLogs()
            .then(setLastSession)
            .catch(err => toast.error(err.toString()))
            .finally(() => setLoadingLast(false));
    }, []);

    // Funkcja do ładowania sesji (z resetowaniem lub doładowywaniem)
    const loadSessions = useCallback((isReset = false) => {
        if (loadingAll) return;
        setLoadingAll(true);

        const currentPage = isReset ? 0 : page;
        const sortString = `${sort.field},${sort.direction}`;
        
        getAllTrainingSessions({
            page: currentPage,
            size: 10,
            sort: sortString,
            searchParameter: debouncedSearch
        })
        .then(data => {
            setSessions(prev => isReset ? data.content : [...prev, ...data.content]);
            setPage(currentPage + 1);
            setHasMore(!data.last);
        })
        .catch(err => toast.error(err.toString()))
        .finally(() => setLoadingAll(false));
    }, [page, sort, debouncedSearch, loadingAll]);

    // Efekt do resetowania listy przy zmianie filtra lub sortowania
    useEffect(() => {
        setSessions([]); 
        setPage(0);      
        setHasMore(true); 
        loadSessions(true); 
    }, [debouncedSearch, sort]); 

    
    const handleSortChange = (field) => {
        setSort(prev => ({
            field: field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleSessionClick = (sessionId) => {
        navigate(`/training/history/${sessionId}`);
    };

    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary p-4 sm:p-8">
            <div className="w-full max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/training')}
                    className="inline-block mb-8 text-bluePrimary"
                    aria-label="go back"
                >
                    <FaArrowLeft className="text-4xl cursor-pointer transition-transform duration-300 hover:scale-110" />
                </button>

                <h1 className="text-4xl font-bold text-center mb-10">Historia Treningów</h1>

                {/* Sekcja Ostatniej Sesji */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-whitePrimary">Ostatnia Sesja</h2>
                    {loadingLast ? (
                        <LastSessionCardSkeleton />
                    ) : (
                        <LastSessionCard session={lastSession} onSessionClick={handleSessionClick} />
                    )}
                </section>

                {/* Sekcja Wszystkich Sesji */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-whitePrimary">Wszystkie Sesje</h2>
                    
                    <SessionFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        sort={sort}
                        onSortChange={handleSortChange}
                    />

                    {/* Lista z Lazy Loadingiem */}
                    {loadingAll && sessions.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Renderuj 6 skeleciaków dla zapełnienia */}
                            {[...Array(6)].map((_, i) => <AllSessionTileSkeleton key={i} />)}
                        </div>
                    ) : sessions.length > 0 ? (
                        /* 2. Pokaż listę, jeśli mamy jakiekolwiek sesje */
                        <InfiniteScroll
                            dataLength={sessions.length}
                            next={() => loadSessions(false)}
                            hasMore={hasMore}
                            loader={<CgSpinner className="mx-auto my-4 animate-spin text-3xl text-bluePrimary" />}
                            endMessage={
                                <p className="text-center text-borderGrayHover mt-6">
                                    To już wszystkie sesje.
                                </p>
                            }
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {sessions.map(session => (
                                <AllSessionTile key={session.sessionId} session={session} onSessionClick={handleSessionClick} />
                            ))}
                        </InfiniteScroll>
                    ) : (
                         /* 3. Pokaż "Nie znaleziono", jeśli nie ładujemy I lista jest pusta */
                         !loadingAll && sessions.length === 0 && (
                             <div className="text-center py-10 text-borderGrayHover">
                                 Nie znaleziono żadnych sesji pasujących do filtrów.
                             </div>
                         )
                    )}
                </section>
            </div>
        </div>
    );
}