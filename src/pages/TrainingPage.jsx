import { useNavigate } from 'react-router-dom';
import { FaDumbbell, FaTasks, FaPlay, FaHistory } from 'react-icons/fa';
import Footer from "../components/Footer";

export default function TrainingPage() {
    const navigate = useNavigate();

    const menuItems = [
        { 
            title: 'Exercise Library', 
            icon: <FaDumbbell size={40} />, 
            path: '/training/exercises',
            imageUrl: 'https://res.cloudinary.com/doxznubde/image/upload/v1760309385/pexels-pixabay-260352_kdxp7a.jpg' 
        },
        { 
            title: 'My Training Plans', 
            icon: <FaTasks size={40} />, 
            path: '/training/plans',
            imageUrl: 'https://res.cloudinary.com/doxznubde/image/upload/v1760309744/glenn-carstens-peters-RLw-UC03Gwc-unsplash_d1pnga.jpg'
        },
        { 
            title: 'Start Training', 
            icon: <FaPlay size={40} />, 
            path: '/training/start',
            imageUrl: 'https://res.cloudinary.com/doxznubde/image/upload/v1760309889/kaplar-balint-aron-LKywCglFiok-unsplash_zqyk47.jpg'
        },
        { 
            title: 'Complete Past Workout', 
            icon: <FaHistory size={40} />, 
            path: '/training/complete',
            imageUrl: 'https://res.cloudinary.com/doxznubde/image/upload/v1760309837/mahmoud-amer-i3-PEnqfSI8-unsplash_rscr5s.jpg'
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-backgoudBlack">
            <div className="container mx-auto p-8 flex-grow">
                <h1 className="text-4xl font-bold text-center mb-12 text-whitePrimary">Training Panel</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {menuItems.map((item) => (
                        <div
                            key={item.title}
                            // Ustawienie tła za pomocą inline style
                            style={{ backgroundImage: `url(${item.imageUrl})` }}
                            // Klasy dla pozycjonowania i wyglądu
                            className="relative h-64 bg-cover bg-center rounded-2xl cursor-pointer group overflow-hidden 
                                        shadow-lg shadow-black/30  /* Podstawowy, ciemny cień dla głębi */
                                        hover:shadow-xl hover:shadow-white/20 /* Poświata pojawiająca się na hover */
                                        transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => navigate(item.path)}
                        >
                            {/* Ciemna nakładka (overlay) dla czytelności tekstu */}
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition-colors duration-300"></div>
                            
                            {/* Treść karty */}
                            <div className="relative h-full flex flex-col items-center justify-center p-8 text-whitePrimary text-center">
                                <div className="transform group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                <h2 className="text-3xl font-bold mt-4">{item.title}</h2>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>
        </div>
    );
}