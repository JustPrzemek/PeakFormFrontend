import { useNavigate } from 'react-router-dom';
import { FaDumbbell, FaTasks, FaPlay } from 'react-icons/fa';
import Footer from "../components/Footer";

export default function TrainingPage() {
    const navigate = useNavigate();

    const menuItems = [
        { title: 'Exercise Library', icon: <FaDumbbell size={40} />, path: '/training/exercises' },
        { title: 'My Training Plans', icon: <FaTasks size={40} />, path: '/training/plans' }, // Ścieżka na przyszłość
        { title: 'Start Training', icon: <FaPlay size={40} />, path: '/training/start' }, // Ścieżka na przyszłość
    ];

    return (
        <div className="min-h-screen flex flex-col bg-backgoudBlack">
            <div className="container mx-auto p-8 flex-grow">
                <h1 className="text-4xl font-bold text-center mb-12 text-whitePrimary">Training Panel</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {menuItems.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col items-center justify-center p-8 text-whitePrimary bg-surfaceDarkGray rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-300"
                            onClick={() => navigate(item.path)}
                        >
                            <div className="text-bluePrimary mb-4">{item.icon}</div>
                            <h2 className="text-2xl font-semibold">{item.title}</h2>
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>
        </div>
    );
}