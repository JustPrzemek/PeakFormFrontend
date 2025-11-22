import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 1. Pobieramy parametry z URL (to co backend wysłał po znaku ?)
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const error = params.get('error');

        if (error) {
            toast.error(decodeURIComponent(error));
            navigate('/login');
            return;
        }

        if (accessToken) {
            // 2. Zapisujemy token do localStorage (Refresh token jest już bezpieczny w ciasteczku)
            localStorage.setItem('accessToken', accessToken);
            
            toast.success('Pomyślnie zalogowano przez Google!');
            
            // 3. Przekierowujemy na stronę główną - teraz isAuthenticated() zwróci true!
            navigate('/home');
        } else {
            toast.error('Błąd logowania. Nie otrzymano tokena.');
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-surfaceDarkGray text-white">
            <p>Trwa logowanie...</p>
        </div>
    );
}

export default OAuth2RedirectHandler;