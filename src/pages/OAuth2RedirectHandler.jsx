import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Odczytujemy tokeny z parametrów URL
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            // Zapisujemy tokeny w localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Przekierowujemy użytkownika na stronę główną
            navigate('/home');
        } else {
            // Jeśli nie ma tokenów, coś poszło nie tak
            // Przekierowujemy z powrotem do logowania z błędem
            navigate('/?error=Google-login-failed');
        }
    }, [navigate, searchParams]);

    // Wyświetlamy prosty komunikat podczas przetwarzania
    return (
        <div className="flex justify-center items-center w-full h-screen">
            <p className="text-xl">Loading, please wait...</p>
        </div>
    );
}

export default OAuth2RedirectHandler;