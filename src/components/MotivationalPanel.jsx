import { useState, useEffect } from 'react';
import { CgGym } from 'react-icons/cg';

const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Believe you can and you're halfway there.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Push yourself, because no one else is going to do it for you."
];

function MotivationalPanel({ isLoginView, onToggle }) {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
        }, 5000); // Zmieniaj cytat co 5 sekund

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-full bg-celestialBlue text-white flex flex-col justify-center items-center p-12 text-center transition-all duration-700 ease-in-out">
            <div className="logo-wrap flex justify-center gap-x-2 items-center text-2xl mb-8">
                <CgGym />
                <span className="font-bold">PeakForm</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">
                {isLoginView ? 'Welcome Back!' : 'Join Us Today!'}
            </h1>
            <p className="text-lg mb-8">
                {isLoginView ? 'Enter your details and start your journey with us.' : 'Create your account to unlock your full potential.'}
            </p>
            
            {/* Cytaty motywacyjne z animacją */}
            <div className="relative w-full h-20 mb-8">
                 {motivationalQuotes.map((quote, index) => (
                    <p key={index} className={`absolute w-full text-xl italic transition-opacity duration-1000 ${index === currentQuoteIndex ? 'opacity-100' : 'opacity-0'}`}>
                       "{quote}"
                    </p>
                ))}
            </div>

            <button
                onClick={onToggle}
                className="border-2 border-white rounded-full px-8 py-3 font-semibold uppercase tracking-wider hover:bg-white hover:text-celestialBlue transition-all duration-300"
            >
                {isLoginView ? 'Register Here' : 'Login Here'}
            </button>
        </div>
    );
}

export default MotivationalPanel;