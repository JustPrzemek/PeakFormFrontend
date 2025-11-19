import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';
import MotivationalPanel from '../components/MotivationalPanel';
import ForgotPasswordForm from '../components/ForgotPasswordForm'; // Importujemy nowy komponent

function AuthPage() {
    const [viewMode, setViewMode] = useState('login'); // 'login', 'register', 'forgotPassword'

    const isLoginView = viewMode === 'login' || viewMode === 'forgotPassword';

    const toggleRegister = () => {
        setViewMode(current => (current === 'login' || current === 'forgotPassword') ? 'register' : 'login');
    };

    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-backgoudBlack p-4">
            {/* Główny kontener */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full max-w-screen-xl h-auto md:h-[700px] flex flex-col md:block bg-surfaceDarkGray border border-borderGrayHover/30">

                {/* --- Panel z formularzami --- */}
                <div 
                    className={`
                        /* Mobile: Pełna szerokość, brak pozycjonowania absolutnego, brak przesunięcia */
                        w-full h-full transition-all duration-700 ease-in-out
                        py-12 md:py-0
                        /* Desktop (md): Połowa szerokości, absolutne pozycjonowanie, logika przesuwania */
                        md:absolute md:top-0 md:w-1/2 
                        
                        /* Logika animacji TYLKO dla desktopu: */
                        ${isLoginView ? 'md:left-0 md:translate-x-0' : 'md:left-0 md:translate-x-full'}
                    `}
                >
                    {viewMode === 'login' && (
                        <LoginForm 
                            onForgotPassword={() => setViewMode('forgotPassword')} 
                            onSwitchToRegister={toggleRegister}
                        />
                    )}
                    
                    {viewMode === 'register' && (
                        <RegistrationForm 
                            onSwitchToLogin={toggleRegister}
                        />
                    )}
                    
                    {viewMode === 'forgotPassword' && (
                        <ForgotPasswordForm 
                            onBackToLogin={() => setViewMode('login')} 
                        />
                    )}
                </div>

                {/* --- Panel motywacyjny (Widoczny tylko na desktopie) --- */}
                <div 
                    className={`
                        hidden md:block /* Ukryty na mobile, widoczny na md */
                        absolute top-0 right-0 w-1/2 h-full 
                        transition-transform duration-700 ease-in-out
                        
                        /* Logika animacji TYLKO dla desktopu */
                        ${isLoginView ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <MotivationalPanel isLoginView={isLoginView} onToggle={toggleRegister} />
                </div>
            </div>
        </div>
    );
}

export default AuthPage;