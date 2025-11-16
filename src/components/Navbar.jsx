// src/components/Navbar.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { IoMdFitness } from "react-icons/io";
import { MdNoMeals } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import { CgGym } from 'react-icons/cg';
import { FaHome } from 'react-icons/fa';
import { MdPostAdd } from "react-icons/md";
import { CgSpinner } from 'react-icons/cg';
import { useUser } from '../context/UserContext';
import { useDebounce } from '../hooks/useDebounce';
import { searchUsers } from '../services/userProfileService';
import { logoutUser } from "../services/authService";
import CreatePostModal from './modals/CreatePostModal';
import { createPost } from '../services/postsService';
import toast from 'react-hot-toast';

/**
 * Komponent Navbar - główna nawigacja aplikacji.
 * 
 * Zawiera:
 * - Logo i nazwa aplikacji (PeakForm)
 * - Wyszukiwarka użytkowników (tylko desktop)
 * - Ikony nawigacji: Home, Add Post, Training, Nutrition
 * - Dropdown menu profilu użytkownika (Profile, Settings, Logout)
 * 
 * Navbar jest sticky (przyklejony do góry) i zmienia wygląd przy scrollowaniu.
 */
export default function Navbar() {
    // ========== STAN KOMPONENTU ==========
    const { user, loading } = useUser() || { loading: true, user: null };    
    const navigate = useNavigate();

    // Stan wyszukiwarki użytkowników
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchDropdownVisible, setSearchDropdownVisible] = useState(false);
    const searchContainerRef = useRef(null);
    
    // Stan dropdown menu profilu
    const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
    const profileDropdownRef = useRef(null);
    
    // Inne stany
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useDebounce - opóźnia wyszukiwanie, żeby nie robić requestu przy każdym naciśnięciu klawisza
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Obsługuje scrollowanie strony - zmienia wygląd Navbara przy scrollowaniu.
     * Dodaje border-bottom, gdy użytkownik scrolluje w dół.
     */
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    /**
     * Zamyka dropdown wyszukiwarki, gdy użytkownik kliknie poza nim.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchDropdownVisible(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /**
     * Zamyka dropdown menu profilu, gdy użytkownik kliknie poza nim.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownVisible(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    /**
     * Wyszukuje użytkowników, gdy użytkownik przestanie pisać (dzięki debounce).
     * Uruchamia się automatycznie, gdy zmieni się debouncedSearchTerm.
     */
    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm.length >= 1) {
            setIsLoading(true);
            setSearchDropdownVisible(true);
            
            searchUsers(debouncedSearchTerm)
                .then(data => {
                    setResults(data.content || []); // API zwraca wyniki w polu `content`
                })
                .catch(error => {
                    console.error('Error searching users:', error);
                    setResults([]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setResults([]);
            setSearchDropdownVisible(false);
        }
    }, [debouncedSearchTerm]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY (useCallback) ==========
    
    /**
     * Obsługuje kliknięcie na użytkownika w wynikach wyszukiwania.
     * Przechodzi do profilu użytkownika i czyści wyszukiwarkę.
     */
    const handleUserClick = useCallback((username) => {
        setSearchTerm('');
        setResults([]);
        setSearchDropdownVisible(false);
        navigate(`/profile/${username}`);
    }, [navigate]);

    /**
     * Obsługuje wylogowanie użytkownika.
     * Czyści tokeny z localStorage i przekierowuje do strony logowania.
     */
    const handleLogout = useCallback(() => {
        const token = localStorage.getItem("refreshToken");
        if (token) {
            logoutUser(token).catch(error => {
                console.error('Error during logout:', error);
            });
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setProfileDropdownVisible(false); // Zamknij dropdown
        navigate("/login");
    }, [navigate]);

    /**
     * Obsługuje przejście do profilu użytkownika z dropdown menu.
     */
    const handleGoToProfile = useCallback(() => {
        if (user?.username) {
            setProfileDropdownVisible(false);
            navigate(`/profile/${user.username}`);
        }
    }, [navigate, user?.username]);

    /**
     * Obsługuje przejście do ustawień.
     */
    const handleGoToSettings = useCallback(() => {
        setProfileDropdownVisible(false);
        navigate('/settings');
    }, [navigate]);

    /**
     * Przełącza widoczność dropdown menu profilu.
     */
    const toggleProfileDropdown = useCallback(() => {
        setProfileDropdownVisible(prev => !prev);
    }, []);

    /**
     * Obsługuje tworzenie nowego posta.
     * Wywoływane z CreatePostModal po pomyślnym utworzeniu posta.
     */
    const handleCreatePost = useCallback(async (postData) => {
        try {
            await createPost(postData);
            toast.success('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            // Przekazujemy błąd dalej, aby modal mógł go wyświetlić
            throw error;
        }
    }, []);

    // ========== WARUNKOWE RENDEROWANIE ==========
    // Jeśli trwa ładowanie danych użytkownika, pokaż prosty placeholder
    if (loading) {
        return (
            <nav className="sticky top-0 w-full z-50 bg-backgoudBlack border-b border-transparent">
                <div className="container max-w-5xl">
                    <div className="flex flex-row py-1 items-center justify-center">
                        <CgSpinner className="animate-spin text-bluePrimary" size={24} />
                    </div>
                </div>
            </nav>
        );
    }

    // ========== RENDEROWANIE ==========
    return (
        <>
            <nav className={`sticky top-0 w-full z-50 bg-backgoudBlack transition-all duration-300 ${isScrolled ? 'border-b border-surfaceDarkGray' : 'border-b border-transparent'}`}>
                <div className="container max-w-5xl">
                    <div className="flex flex-row py-1 items-center">
                        {/* Logo i nazwa aplikacji */}
                        <div 
                            className="basis-1/2 text-whitePrimary flex items-center cursor-pointer transition-transform duration-300 hover:scale-110 md:basis-1/3 hover:text-bluePrimary gap-2"
                            onClick={() => navigate("/home")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate("/home")}
                            aria-label="Go to homepage"
                        >
                            <CgGym size={24} />
                            <span className="font-bold">PeakForm</span>
                        </div>

                        {/* Wyszukiwarka użytkowników (tylko desktop) */}
                        <div className="basis-1/3 relative hidden md:block" ref={searchContainerRef}>
                            <IoSearch className="absolute left-3 top-3 text-borderGrayHover" size={18} />
                            <label htmlFor="search-input" className="sr-only">Search users</label>
                            <input 
                                id="search-input"
                                type="text" 
                                placeholder="Search users..." 
                                className="p-2 bg-surfaceDarkGray text-whitePrimary rounded-lg w-80 pl-10 align-middle focus:outline-0 focus:ring-2 focus:ring-bluePrimary placeholder:font-light"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm && setSearchDropdownVisible(true)}
                            />
                            {/* Dropdown z wynikami wyszukiwania */}
                            {isSearchDropdownVisible && (
                                <div className="absolute top-full mt-2 w-80 bg-surfaceDarkGray border border-borderGrayHover rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-borderGrayHover flex items-center justify-center gap-2">
                                            <CgSpinner className="animate-spin" size={20} />
                                            Loading...
                                        </div>
                                    ) : results.length > 0 ? (
                                        <ul>
                                            {results.map(user => (
                                                <li 
                                                    key={user.id} 
                                                    className="flex items-center p-3 hover:bg-backgoudBlack cursor-pointer transition-colors"
                                                    onClick={() => handleUserClick(user.username)}
                                                >
                                                    <img 
                                                        src={user.profileImageUrl || 'https://via.placeholder.com/40'}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                    />
                                                    <span className="font-semibold text-whitePrimary">{user.username}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : searchTerm && (
                                        <div className="p-4 text-center text-borderGrayHover">No users found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Ikony nawigacji i menu profilu */}
                        <div className="basis-1/2 md:basis-1/3">
                            <ul className="flex flex-row space-x-4 p-2 text-2xl justify-end items-center">
                                {/* Home */}
                                <li className="transition-transform duration-300 hover:scale-110">
                                    <FaHome 
                                        className="cursor-pointer text-whitePrimary hover:text-bluePrimary transition-colors duration-300" 
                                        onClick={() => navigate("/home")}
                                        aria-label="Go to homepage"
                                    />
                                </li>

                                {/* Add Post */}
                                <li className="transition-transform duration-300 hover:scale-110">
                                    <MdPostAdd 
                                        className="cursor-pointer text-whitePrimary hover:text-bluePrimary transition-colors duration-300" 
                                        onClick={() => setIsModalOpen(true)}
                                        aria-label="Create a new post"
                                    />
                                </li>

                                {/* Training */}
                                <li className="transition-transform duration-300 hover:scale-110">
                                    <IoMdFitness 
                                        className="cursor-pointer text-whitePrimary hover:text-bluePrimary transition-colors duration-300" 
                                        onClick={() => navigate('/training')} 
                                        aria-label="Go to training page"
                                    />                            
                                </li>
                        
                                {/* Nutrition */}
                                <li className="transition-transform duration-300 hover:scale-110">
                                    <MdNoMeals 
                                        className="cursor-pointer text-whitePrimary hover:text-bluePrimary transition-colors duration-300"
                                        aria-label="Go to nutrition page" 
                                        onClick={() => navigate('/nutrition')}
                                    />
                                </li>

                                {/* Profile Dropdown */}
                                <li className="flex items-center" ref={profileDropdownRef}>
                                    <div className="relative">
                                        <button
                                            onClick={toggleProfileDropdown}
                                            className="flex items-center transition-transform duration-300 hover:scale-110 focus:outline-none"
                                            aria-label="User menu"
                                            aria-expanded={isProfileDropdownVisible}
                                        >
                                            <img 
                                                className="w-8 h-8 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-bluePrimary transition-colors" 
                                                src={user?.profileImageUrl || 'https://via.placeholder.com/32'}
                                                alt="User Profile"
                                            />
                                        </button>
                                        
                                        {/* Dropdown menu profilu */}
                                        {isProfileDropdownVisible && (
                                            <div className="absolute right-0 top-full mt-2 w-40 bg-surfaceDarkGray border border-borderGrayHover rounded-lg shadow-lg z-50 overflow-hidden">
                                                <ul>
                                                    <li>
                                                        <button
                                                            onClick={handleGoToProfile}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-whitePrimary hover:bg-backgoudBlack transition-colors text-left"
                                                        >
                                                            <img 
                                                                className="w-5 h-5 rounded-full object-cover" 
                                                                src={user?.profileImageUrl || 'https://via.placeholder.com/20'}
                                                                alt="Profile"
                                                            />
                                                            <span>Profile</span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            onClick={handleGoToSettings}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-whitePrimary hover:bg-backgoudBlack transition-colors text-left"
                                                        >
                                                            <IoMdSettings size={18} />
                                                            <span>Settings</span>
                                                        </button>
                                                    </li>
                                                    <li className="border-t border-borderGrayHover">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-backgoudBlack transition-colors text-left"
                                                        >
                                                            <IoLogOut size={18} />
                                                            <span>Logout</span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Modal do tworzenia posta */}
            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePost}
            />
        </>
    );
}