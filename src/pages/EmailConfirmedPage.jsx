import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

function EmailConfirmedPage() {
  const [searchParams] = useSearchParams();
  const [confirmed, setConfirmed] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  

  useEffect(() => {
  let called = false;
  const token = searchParams.get('token');
  if (!token) {
    setApiError('Brak tokenu w linku.');
    return;
  }

  if (!called) {
    verifyEmail(token)
      .then(() => {
        setConfirmed(true);
      })
      .catch((err) => {
        setApiError(err);
      });
    called = true;
  }
}, [searchParams]);

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-slate-100">
      <div className="w-full max-w-md bg-amber-50 p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold">Email Verification</h1>

        {confirmed && (
          <div className="text-green-600 mt-6">
            <p className="mb-4">Twój adres e-mail został pomyślnie potwierdzony 🎉</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-celestialBlue text-white rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Przejdź do PeakForm
            </button>
          </div>
        )}

        {apiError && (
          <p className="text-red-500 mt-6">{apiError}</p>
        )}
      </div>
    </div>
  );
}

export default EmailConfirmedPage;
