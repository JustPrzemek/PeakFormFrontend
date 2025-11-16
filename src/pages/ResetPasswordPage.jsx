import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CgSpinner } from 'react-icons/cg';
import { resetPassword } from '../services/authService';

// --- POPRAWKA ---
// Komponent wyniesiony na zewnątrz
// Dzięki temu nie jest tworzony na nowo przy każdym renderze ResetPasswordPage
const PasswordInput = ({ name, placeholder, value, onChange, error, show, onToggle }) => (
  <div className="mb-4">
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-borderGrayHover text-xl">
        <RiLockPasswordLine />
      </span>
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-backgoudBlack border text-whitePrimary placeholder-borderGrayHover rounded-lg p-4 pl-12 pr-12 outline-none focus:ring-0 transition-colors ${
          error
            ? 'border-red-400'
            : 'border-borderGrayHover focus:border-bluePrimary'
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-borderGrayHover hover:text-whitePrimary text-xl"
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
  </div>
);


function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (message) {
      let count = 3;
      setCountdown(count);

      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
        }
      }, 1000);

      const timeout = setTimeout(() => {
        navigate('/login');
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message, navigate]);

  const validate = () => {
    const newErrors = {};
    const { newPassword, confirmPassword } = passwords;

    if (!newPassword) newErrors.newPassword = "Nowe hasło jest wymagane.";
    else if (newPassword.length < 12) newErrors.newPassword = "Hasło musi mieć co najmniej 12 znaków.";
    else if (!/(?=.*[a-z])/.test(newPassword)) newErrors.newPassword = "Hasło musi zawierać małą literę.";
    else if (!/(?=.*[A-Z])/.test(newPassword)) newErrors.newPassword = "Hasło musi zawierać wielką literę.";
    else if (!/(?=.*\d)/.test(newPassword)) newErrors.newPassword = "Hasło musi zawierać cyfrę.";
    else if (!/(?=.*[@$!%*?&])/.test(newPassword)) newErrors.newPassword = "Hasło musi zawierać znak specjalny (@$!%*?&).";

    if (!confirmPassword) newErrors.confirmPassword = "Proszę potwierdzić nowe hasło.";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Hasła nie są zgodne.";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!token) {
      setApiError("Nieprawidłowy lub brakujący token.");
      return;
    }

    setErrors({});
    setApiError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await resetPassword(token, passwords.newPassword);
      setMessage('Twoje hasło zostało zresetowane! Teraz możesz się zalogować.');
    } catch (err) {
      setApiError(err.message || 'Nie udało się zresetować hasła. Link mógł wygasnąć.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-backgoudBlack p-4">
      <div className="w-full max-w-md bg-surfaceDarkGray p-8 rounded-2xl shadow-lg border border-borderGrayHover">
        <h1 className="text-3xl font-bold text-center text-whitePrimary mb-8">
          Ustaw nowe hasło
        </h1>

        {message && (
          <div className="text-green-400 mt-4 text-center">
            <p>{message}</p>
            <p className="text-borderGrayHover mt-2">Przekierowanie za {countdown}...</p>
          </div>
        )}
        {apiError && <p className="text-red-400 mt-4 text-center">{apiError}</p>}

        {token && !message && (
          <form onSubmit={handleSubmit} className="mt-6" noValidate>
            
            {/* Teraz ten komponent jest stabilny i nie będzie się "resetował" */}
            <PasswordInput
              name="newPassword"
              placeholder="Nowe hasło"
              value={passwords.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordInput
              name="confirmPassword"
              placeholder="Potwierdź nowe hasło"
              value={passwords.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-bluePrimary w-full py-3 rounded-lg mt-6 text-whitePrimary font-bold text-lg cursor-pointer hover:bg-blueHover active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <CgSpinner className="animate-spin inline-block w-6 h-6" />
              ) : (
                'Zresetuj hasło'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;