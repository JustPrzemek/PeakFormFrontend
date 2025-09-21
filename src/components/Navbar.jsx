import { IoMdFitness } from "react-icons/io";
import { MdNoMeals } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { IoLogOut } from "react-icons/io5";
import { CgGym } from 'react-icons/cg';
import { useUser } from '../context/UserContext';

export default function Navbar() {

    const { profilePictureUrl, loading } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        const token = localStorage.getItem("refreshToken");
        if (token) logoutUser(token);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
    };

    if (loading) return <p>Loading profile picture...</p>;

    return (
        <nav className="sticky top-0 w-full border border-b-1 z-50">
            <div className="container max-w-5xl">
                <div className="flex flex-row py-1 items-center">
                    <div 
                        className="basis-1/2 flex items-center cursor-pointer transition-transform duration-300 hover:scale-110 md:basis-1/3"
                        onClick={() => navigate("/home")}
                        >
                            
                        <CgGym />
                        <span className="font-bold">PeakForm</span>
                    </div>

                    <div className="basis-1/3 relative hidden md:block">
                        
                        <IoSearch icon="magnifying-glass" className="absolute left-3 top-3 text-gray-300"/>
                        <input type="text" placeholder="Search..." className="p-2 bg-gray-100 rounded-lg w-80 pl-10 align-middle focus:outline-0 placeholder:font-light"/>

                    </div>

                    <div className="basis-1/2 md:basis-1/3">
                        <ul className="flex flex-row space-x-4 p-2 text-2xl justify-end items-center">
                            <li className="transition-transform duration-300 hover:scale-110 ">
                                <FaHome className="cursor-pointer" onClick={() => navigate("/home")}/>
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
                                    src={profilePictureUrl}
                                    alt="User Profile"
                                    onClick={() => navigate("/profile")}
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}