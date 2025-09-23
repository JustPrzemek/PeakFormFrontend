import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import EmailConfirmedPage from './pages/EmailConfirmedPage';
import MainLayout from "./pages/MainLayout";
import Profile from './pages/ProfilePage';
import ProfileEdit from './components/ProfileEdit';
import SettingsPage from './pages/SettingsPage';
import ProtectedLayout from './layouts/ProtectedLayout';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/callback" element={<OAuth2RedirectHandler />} />
                <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
                <Route element={<ProtectedLayout />}>
                    <Route
                        path="/home"
                        element={
                            <MainLayout>
                                <HomePage />
                            </MainLayout>
                        }
                    />

                    <Route path="/profile/edit"
                        element={
                            <MainLayout>
                                <SettingsPage/>
                            </MainLayout>
                            
                        }
                    >
                        <Route index element={<Navigate to="edit" replace/>}/>
                        <Route path='edit' element={<ProfileEdit/>}/>
                    </Route >
                    
                    <Route path="/profile/:username"
                        element={
                            <MainLayout>
                                <Profile />
                            </MainLayout>
                        }
                    />

                </Route>
            </Routes>
        </Router>
    );
}

export default App;