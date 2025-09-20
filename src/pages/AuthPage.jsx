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
        <div className="flex justify-center items-center w-full min-h-screen bg-amber-50 p-4">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl w-full max-w-screen-xl h-[700px] flex">

                {/* Panel z formularzami (teraz z logiką przełączania) */}
                <div 
                    className="absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: isLoginView ? 'translateX(0%)' : 'translateX(100%)' }}
                >
                    {viewMode === 'login' && <LoginForm onForgotPassword={() => setViewMode('forgotPassword')} />}
                    {viewMode === 'register' && <RegistrationForm />}
                    {viewMode === 'forgotPassword' && <ForgotPasswordForm onBackToLogin={() => setViewMode('login')} />}
                </div>

                {/* Panel motywacyjny */}
                <div 
                    className="absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: isLoginView ? 'translateX(0%)' : 'translateX(-100%)' }}
                >
                    <MotivationalPanel isLoginView={isLoginView} onToggle={toggleRegister} />
                </div>

            </div>
        </div>
    );
}

export default AuthPage;