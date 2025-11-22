// src/components/Navbar.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { IoSearch, IoMenu, IoClose } from "react-icons/io5";
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

    // Stan wyszukiwarki
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchDropdownVisible, setSearchDropdownVisible] = useState(false);
    const searchContainerRef = useRef(null);
    
    // Stan dropdown menu profilu (desktop)
    const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
    const profileDropdownRef = useRef(null);
    
    // NOWY STAN: Menu mobilne
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Inne stany
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // ========== EFEKTY UBOCZNE ==========
    
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Zamykanie dropdownów przy kliknięciu poza
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchDropdownVisible(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // Logika wyszukiwania
    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm.length >= 1) {
            setIsLoading(true);
            setSearchDropdownVisible(true);
            
            searchUsers(debouncedSearchTerm)
                .then(data => setResults(data.content || []))
                .catch(error => {
                    console.error('Error searching users:', error);
                    setResults([]);
                })
                .finally(() => setIsLoading(false));
        } else {
            setResults([]);
            setSearchDropdownVisible(false);
        }
    }, [debouncedSearchTerm]);

    // Zamknij menu mobilne przy zmianie szerokości ekranu (np. obrót telefonu)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY ==========
    
    const handleUserClick = useCallback((username) => {
        setSearchTerm('');
        setResults([]);
        setSearchDropdownVisible(false);
        setIsMobileMenuOpen(false); // Zamknij mobile menu
        navigate(`/profile/${username}`);
    }, [navigate]);

    const handleLogout = useCallback(async () => {
        try {
            await logoutUser(); 
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem("accessToken");
            setProfileDropdownVisible(false);
            setIsMobileMenuOpen(false); // Zamknij mobile menu
            navigate("/login");
        }
    }, [navigate]);

    // Funkcja pomocnicza do nawigacji z menu mobilnego
    const handleMobileNavigate = (path) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    const handleGoToProfile = useCallback(() => {
        if (user?.username) {
            setProfileDropdownVisible(false);
            navigate(`/profile/${user.username}`);
        }
    }, [navigate, user?.username]);

    const handleGoToSettings = useCallback(() => {
        setProfileDropdownVisible(false);
        navigate('/settings');
    }, [navigate]);

    const toggleProfileDropdown = useCallback(() => {
        setProfileDropdownVisible(prev => !prev);
    }, []);

    const handleCreatePost = useCallback(async (postData) => {
        try {
            await createPost(postData);
            toast.success('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }, []);

    // ========== RENDEROWANIE ==========
    if (loading) {
        return (
            <nav className="sticky top-0 w-full z-50 bg-backgoudBlack border-b border-transparent">
                <div className="container max-w-5xl flex justify-center py-2">
                    <CgSpinner className="animate-spin text-bluePrimary" size={24} />
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className={`sticky top-0 w-full z-50 bg-backgoudBlack transition-all duration-300 ${isScrolled ? 'border-b border-surfaceDarkGray' : 'border-b border-transparent'}`}>
                <div className="container max-w-5xl px-4"> {/* Dodano px-4 dla marginesów na mobile */}
                    <div className="flex flex-row py-2 items-center justify-between"> {/* Changed layout alignment */}

                        {/* 1. LEWA STRONA: Logo */}
                        <div 
                            className="flex items-center cursor-pointer text-whitePrimary hover:text-bluePrimary gap-2 z-50"
                            onClick={() => navigate("/home")}
                        >
                            <CgGym size={28} />
                            <span className="font-bold text-xl">PeakForm</span>
                        </div>

                        {/* 2. ŚRODEK: Wyszukiwarka (TYLKO DESKTOP) */}
                        <div className="hidden md:block relative mx-4" ref={searchContainerRef}>
                            <IoSearch className="absolute left-3 top-3 text-borderGrayHover" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="p-2 bg-surfaceDarkGray text-whitePrimary rounded-lg w-64 lg:w-80 pl-10 focus:outline-none focus:ring-2 focus:ring-bluePrimary placeholder:font-light"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm && setSearchDropdownVisible(true)}
                            />
                             {/* Dropdown wyników wyszukiwania (Desktop) */}
                             {isSearchDropdownVisible && (
                                <div className="absolute top-full mt-2 w-full bg-surfaceDarkGray border border-borderGrayHover rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-borderGrayHover flex justify-center gap-2"><CgSpinner className="animate-spin"/> Loading...</div>
                                    ) : results.length > 0 ? (
                                        <ul>
                                            {results.map(u => (
                                                <li key={u.id} className="flex items-center p-3 hover:bg-surfaceGray hover:bg-opacity-20 cursor-pointer" onClick={() => handleUserClick(u.username)}>
                                                    <img src={u.profileImageUrl || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full mr-3 object-cover" alt={u.username}/>
                                                    <span className="text-whitePrimary">{u.username}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : searchTerm && <div className="p-4 text-center text-borderGrayHover">No users found.</div>}
                                </div>
                            )}
                        </div>

                        {/* 3. PRAWA STRONA: Menu Desktopowe (UKRYTE NA MOBILE) */}
                        <ul className="hidden md:flex flex-row space-x-6 items-center text-2xl text-whitePrimary">
                            <li><FaHome className="hover:text-bluePrimary cursor-pointer transition" onClick={() => navigate("/home")} title="Home"/></li>
                            <li><MdPostAdd className="hover:text-bluePrimary cursor-pointer transition" onClick={() => setIsModalOpen(true)} title="Add Post"/></li>
                            <li><IoMdFitness className="hover:text-bluePrimary cursor-pointer transition" onClick={() => navigate('/training')} title="Training"/></li>
                            <li><MdNoMeals className="hover:text-bluePrimary cursor-pointer transition" onClick={() => navigate('/nutrition')} title="Nutrition"/></li>
                            
                            {/* Desktop Profile Dropdown */}
                            <li className="relative" ref={profileDropdownRef}>
                                <button onClick={toggleProfileDropdown} className="focus:outline-none transition transform hover:scale-110">
                                    <img className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-bluePrimary" src={user?.profileImageUrl || 'https://via.placeholder.com/32'} alt="Profile"/>
                                </button>
                                {isProfileDropdownVisible && (
                                    <div className="absolute right-0 top-full mt-3 w-48 bg-surfaceDarkGray border border-borderGrayHover rounded-lg shadow-xl overflow-hidden z-50">
                                        <button onClick={handleGoToProfile} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"><img src={user?.profileImageUrl} className="w-6 h-6 rounded-full"/> Profile</button>
                                        <button onClick={handleGoToSettings} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"><IoMdSettings size={18}/> Settings</button>
                                        <div className="border-t border-borderGrayHover"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition"><IoLogOut size={18}/> Logout</button>
                                    </div>
                                )}
                            </li>
                        </ul>

                        {/* 4. PRAWA STRONA: Hamburger Button (TYLKO MOBILE) */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-whitePrimary focus:outline-none p-1">
                                {isMobileMenuOpen ? <IoClose size={30} /> : <IoMenu size={30} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========== MENU MOBILNE (Rozwijane) ========== */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-backgoudBlack border-t border-surfaceDarkGray shadow-2xl z-40 flex flex-col animate-in slide-in-from-top-5 duration-200">
                        
                        {/* Mobile Search */}
                        <div className="p-4 border-b border-surfaceDarkGray relative">
                            <IoSearch className="absolute left-7 top-7 text-borderGrayHover" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="w-full p-3 bg-surfaceDarkGray text-whitePrimary rounded-lg pl-10 focus:outline-none focus:ring-1 focus:ring-bluePrimary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                             {/* Uproszczone wyniki wyszukiwania dla mobile */}
                             {results.length > 0 && searchTerm && (
                                <ul className="mt-2 bg-surfaceDarkGray rounded-lg max-h-40 overflow-y-auto">
                                    {results.map(u => (
                                        <li key={u.id} className="flex items-center p-3 border-b border-borderGrayHover last:border-0" onClick={() => handleUserClick(u.username)}>
                                            <img src={u.profileImageUrl} className="w-8 h-8 rounded-full mr-3"/>
                                            <span className="text-whitePrimary">{u.username}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="flex flex-col p-2">
                            <button onClick={() => handleMobileNavigate('/home')} className="flex items-center gap-4 p-4 text-whitePrimary hover:bg-surfaceDarkGray rounded-lg">
                                <FaHome size={24} className="text-bluePrimary" /> <span className="font-medium text-lg">Home</span>
                            </button>
                            <button onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-whitePrimary hover:bg-surfaceDarkGray rounded-lg">
                                <MdPostAdd size={24} className="text-bluePrimary" /> <span className="font-medium text-lg">Create Post</span>
                            </button>
                            <button onClick={() => handleMobileNavigate('/training')} className="flex items-center gap-4 p-4 text-whitePrimary hover:bg-surfaceDarkGray rounded-lg">
                                <IoMdFitness size={24} className="text-bluePrimary" /> <span className="font-medium text-lg">Training</span>
                            </button>
                            <button onClick={() => handleMobileNavigate('/nutrition')} className="flex items-center gap-4 p-4 text-whitePrimary hover:bg-surfaceDarkGray rounded-lg">
                                <MdNoMeals size={24} className="text-bluePrimary" /> <span className="font-medium text-lg">Nutrition</span>
                            </button>
                        </div>

                        {/* Mobile User Section */}
                        <div className="border-t border-surfaceDarkGray p-4 bg-surfaceDarkGray bg-opacity-30">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <img src={user?.profileImageUrl} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="text-whitePrimary font-bold">{user?.username}</p>
                                    <p className="text-borderGrayHover text-xs">Logged in</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleMobileNavigate(`/profile/${user?.username}`)} className="bg-surfaceDarkGray py-2 rounded-lg text-sm text-whitePrimary border border-borderGrayHover">My Profile</button>
                                <button onClick={() => handleMobileNavigate('/settings')} className="bg-surfaceDarkGray py-2 rounded-lg text-sm text-whitePrimary border border-borderGrayHover">Settings</button>
                            </div>
                            <button onClick={handleLogout} className="w-full mt-3 flex items-center justify-center gap-2 text-red-400 py-2 hover:bg-surfaceDarkGray rounded-lg transition">
                                <IoLogOut size={20}/> Sign Out
                            </button>
                        </div>

                    </div>
                )}
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