import { IoMdFitness } from "react-icons/io";
import { MdNoMeals } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { IoLogOut } from "react-icons/io5";
import { CgGym } from 'react-icons/cg';
import { useUser } from '../context/UserContext';
import { useDebounce } from '../hooks/useDebounce';
import { searchUsers } from '../services/userProfileService';
import { useState, useEffect, useRef } from 'react';
import { FaPlusSquare, FaHome } from 'react-icons/fa';
import CreatePostModal from './CreatePostModal';
import { createPost } from '../services/postsService';
import toast from 'react-hot-toast';


export default function Navbar() {

    const { user, loading } = useUser(); 
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const searchContainerRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);
    
    useEffect(() => {
        if (debouncedSearchTerm) { // Jeśli jest jakiś tekst (po opóźnieniu)
            setIsLoading(true);
            setDropdownVisible(true);
            searchUsers(debouncedSearchTerm)
                .then(data => {
                    setResults(data.content); // Pamiętaj, że wyniki są w polu `content`
                })
                .catch(error => {
                    console.error(error);
                    setResults([]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setResults([]); // Wyczyść wyniki, gdy input jest pusty
            setDropdownVisible(false);
        }
    }, [debouncedSearchTerm]);

    const handleLogout = () => {
        const token = localStorage.getItem("refreshToken");
        if (token) logoutUser(token);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    const handleUserClick = (username) => {
        setSearchTerm(''); // Wyczyść input
        setResults([]); // Wyczyść wyniki
        setDropdownVisible(false); // Ukryj dropdown
        navigate(`/profile/${username}`); // Przejdź do profilu użytkownika
    };

    const handleCreatePost = async (postData) => {
        try {
            const response = await createPost(postData);
            console.log('Post created:', response);
            toast.success('Post created successfully!');
            navigate("/home")
        } catch (error) {
            console.error('Error creating post:', error);
            // Przekazujemy błąd dalej, aby modal mógł go wyświetlić
            throw new Error(error);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <nav className="sticky top-0 w-full border border-b-1 z-50 bg-white">
                <div className="container max-w-5xl">
                    <div className="flex flex-row py-1 items-center">
                        <div 
                            className="basis-1/2 flex items-center cursor-pointer transition-transform duration-300 hover:scale-110 md:basis-1/3"
                            onClick={() => navigate("/home")}
                            >
                                
                            <CgGym />
                            <span className="font-bold">PeakForm</span>
                        </div>

                        <div className="basis-1/3 relative hidden md:block" ref={searchContainerRef}>
                            <IoSearch icon="magnifying-glass" className="absolute left-3 top-3 text-gray-300"/>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="p-2 bg-gray-100 rounded-lg w-80 pl-10 align-middle focus:outline-0 placeholder:font-light"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm && setDropdownVisible(true)}
                            />
                            {isDropdownVisible && (
                                <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-gray-500">Loading...</div>
                                    ) : results.length > 0 ? (
                                        <ul>
                                            {results.map(user => (
                                                <li 
                                                    key={user.id} 
                                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleUserClick(user.username)}
                                                >
                                                    <img 
                                                        src={user.profileImageUrl || 'https://via.placeholder.com/40'}
                                                        alt={user.username}
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                    />
                                                    <span className="font-semibold">{user.username}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : searchTerm && (
                                        <div className="p-4 text-center text-gray-500">No users found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="basis-1/2 md:basis-1/3">
                            <ul className="flex flex-row space-x-4 p-2 text-2xl justify-end items-center">
                                <li className="transition-transform duration-300 hover:scale-110 ">
                                    <FaHome className="cursor-pointer" onClick={() => navigate("/home")}/>
                                </li>

                                <li className="transition-transform duration-300 hover:scale-110">
                                    <FaPlusSquare 
                                        className="cursor-pointer" 
                                        onClick={() => setIsModalOpen(true)}
                                    />
                                </li>

                                <li className="transition-transform duration-300 hover:scale-110">
                                <IoMdFitness className="cursor-pointer" />
                                </li>
                        
                                <li className="transition-transform duration-300 hover:scale-110">
                                    <MdNoMeals className="cursor-pointer" />
                                </li>
                                <li className="transition-transform duration-300 hover:scale-110">
                                    <IoLogOut className="cursor-pointer" onClick={handleLogout} />
                                </li>

                                <li className="transition-transform duration-300 hover:scale-110">
                                    <img 
                                        className="w-6 h-6 rounded-full object-cover cursor-pointer" 
                                        src={user.profileImageUrl}
                                        alt="User Profile"
                                        onClick={() => navigate(`/profile/${user.username}`)}
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePost}
            />
        </>
    );
}