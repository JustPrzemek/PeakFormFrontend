import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { followsService } from '../services/followService';
import { CgClose } from "react-icons/cg";

// Custom hook do opóźnienia wykonania funkcji (dla wyszukiwania)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export default function FollowsModal({ isOpen, onClose, modalType, username }) {
    const [list, setList] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Opóźnienie 500ms

    const observer = useRef();
    const lastUserRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Resetowanie stanu przy zmianie wyszukiwania lub typu modala
    useEffect(() => {
        setList([]);
        setPage(0);
        setHasMore(true);
    }, [debouncedSearchTerm, modalType, username]);

    // Pobieranie danych
    useEffect(() => {
        if (!isOpen || !hasMore) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchFunction = modalType === 'followers' 
                    ? followsService.getFollowers 
                    : followsService.getFollowing;
                
                const data = await fetchFunction(username, page, 20, debouncedSearchTerm);
                setList(prev => [...prev, ...data.content]);
                setHasMore(!data.last);
            } catch (error) {
                console.error(`Failed to fetch ${modalType}`, error);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page, debouncedSearchTerm, modalType, username, isOpen, hasMore]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray bg-opacity-75 backdrop-blur z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[70vh] flex flex-col"  onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold capitalize">{modalType}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <CgClose size={24} />
                    </button>
                </header>
                
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <ul className="overflow-y-auto flex-grow p-4 space-y-3">
                    {list.map((user, index) => {
                        const ref = index === list.length - 1 ? lastUserRef : null;
                        return (
                            <li ref={ref} key={user.username} className="flex items-center">
                                <Link to={`/profile/${user.username}`} onClick={onClose} className="flex items-center w-full hover:bg-gray-50 p-2 rounded-md">
                                    <img src={user.profileImageUrl} alt={user.username} className="w-10 h-10 rounded-full mr-4 object-cover" />
                                    <span className="font-semibold">{user.username}</span>
                                </Link>
                            </li>
                        );
                    })}
                    {loading && <p className="text-center text-gray-500">Loading...</p>}
                    {!hasMore && list.length > 0 && <p className="text-center text-gray-500">No more users</p>}
                    {!loading && list.length === 0 && <p className="text-center text-gray-500">No users found</p>}
                </ul>
            </div>
        </div>
    );
}