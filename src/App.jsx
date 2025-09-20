import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import EmailConfirmedPage from './pages/EmailConfirmedPage';
import MainLayout from "./pages/MainLayout";
import UserProfilePage from "./pages/UserProfilePage";
import Profile from './pages/ProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<OAuth2RedirectHandler />} />
                <Route path="/email-confirmed" element={<EmailConfirmedPage />} />

                <Route
                    path="/home"
                    element={
                        <MainLayout>
                            <HomePage />
                        </MainLayout>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <MainLayout>
                            <Profile />
                        </MainLayout>
                        
                    }
                />
                
                {/* później dodasz kolejne, np. /settings */}
            </Routes>
        </Router>
    );
}

export default App;