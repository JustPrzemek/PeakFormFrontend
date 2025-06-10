import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PasswordResetForm } from './components/auth/PasswordResetForm';
import { EmailVerification } from './components/auth/EmailVerification';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import './styles/globals.css';

function AppContent() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const { user, isLoading, token } = useAuth();

  // Check for email verification
  const urlParams = new URLSearchParams(window.location.search);
  const isVerification = urlParams.has('token') && !urlParams.has('refreshToken'); // tylko dla weryfikacji email

  // Handle OAuth2 login (Google)
  const oauthToken = urlParams.get('token');
  const oauthRefreshToken = urlParams.get('refreshToken');

  // Jeżeli przyszliśmy z logowania przez Google
  if (oauthToken && oauthRefreshToken && !token) {
    // Zapisz tokeny do localStorage
    localStorage.setItem('token', oauthToken);
    localStorage.setItem('refreshToken', oauthRefreshToken);

    // Wyczyść parametry z URL (żeby nie były widoczne po odświeżeniu strony)
    window.history.replaceState({}, document.title, window.location.pathname);

    // Wymuszenie odświeżenia strony — AppProvider ponownie załaduje usera
    window.location.reload();
    return null; // nie renderujemy nic w tej chwili
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isVerification) {
    return <EmailVerification />;
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <>
      {authMode === 'login' && (
        <LoginForm 
          onSwitchToRegister={() => setAuthMode('register')}
          onSwitchToReset={() => setAuthMode('reset')}
        />
      )}
      {authMode === 'register' && (
        <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
      )}
      {authMode === 'reset' && (
        <PasswordResetForm onBack={() => setAuthMode('login')} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;