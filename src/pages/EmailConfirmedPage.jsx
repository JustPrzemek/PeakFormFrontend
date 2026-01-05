import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Ikony dla statusu
import { CgSpinner } from 'react-icons/cg'; // Ikona ładowania (jak w Twoim przykładzie)

function EmailConfirmedPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setApiError('Missing token in link. Please check if the link is correct.');
      setLoading(false);
      return;
    }

    // Reset stanów na wypadek zmiany tokenu w URL
    setLoading(true);
    setConfirmed(false);
    setApiError('');

    verifyEmail(token)
      .then(() => {
        setConfirmed(true);
      })
      .catch((err) => {
        // Zakładam, że err to obiekt błędu. Jeśli to string, użyj po prostu `err`.
        const errorMessage = err.message || 'An error occurred. The token may be invalid or expired.';
        setApiError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]); // Zależność od searchParams jest poprawna

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-backgoudBlack p-4">
      <div className="w-full max-w-md bg-surfaceDarkGray p-8 rounded-2xl shadow-lg text-center border border-borderGrayHover">
        <h1 className="text-3xl font-bold text-whitePrimary mb-8">
          Email Verification
        </h1>

        {/* --- Loading State --- */}
        {loading && (
          <div className="flex flex-col items-center justify-center text-borderGrayHover">
            <CgSpinner className="animate-spin text-5xl text-bluePrimary mb-4" />
            <p className="text-lg">Verifying...</p>
          </div>
        )}

        {/* --- Error State --- */}
        {apiError && !loading && (
          <div className="text-red-400">
            <FaTimesCircle className="mx-auto text-6xl mb-6" />
            <h2 className="text-2xl font-bold text-whitePrimary mb-4">Verification Error</h2>
            <p className="text-borderGrayHover mb-6">{apiError}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* --- Success State --- */}
        {confirmed && !loading && (
          <div className="text-green-400">
            <FaCheckCircle className="mx-auto text-6xl mb-6" />
            <h2 className="text-2xl font-bold text-whitePrimary mb-4">Confirmed! 🎉</h2>
            <p className="text-borderGrayHover mb-6">Your email address has been successfully verified.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-bluePrimary text-whitePrimary font-bold py-3 px-6 rounded-lg hover:bg-blueHover transition-colors duration-300"
            >
              Go to PeakForm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailConfirmedPage;