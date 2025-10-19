import { useState } from 'react';
import { FaEnvelope } from "react-icons/fa";
import IconInput from './IconInput';
import { requestPasswordReset } from '../services/authService';

function ForgotPasswordForm({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email) return "Email is required.";
        if (!/\S+@\S+\.\S+/.test(email)) return "Email address is invalid.";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await requestPasswordReset(email);
            setMessage('If an account with that email exists, a password reset link has been sent.');
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };
    
    // Jeśli wiadomość została wysłana, pokazujemy tylko ją
    if (message) {
        return (
            <div className="w-full h-full bg-surfaceDarkGray text-whitePrimary flex flex-col justify-center items-center px-12 text-center">
                <h2 className="text-2xl font-semibold text-green-400">📧 Check your email!</h2>
                <p className="mt-4 text-lg">{message}</p>
                <button onClick={onBackToLogin} className="mt-6 text-bluePrimary font-semibold">
                    &larr; Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-surfaceDarkGray text-whitePrimary flex flex-col justify-center px-12 md:px-24">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-borderGrayHover mt-2">Enter your email and we'll send you a reset link.</p>
            
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

            <form onSubmit={handleSubmit}>
                <IconInput placeholder="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}>
                    <FaEnvelope />
                </IconInput>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-bluePrimary w-full py-3 rounded-lg mt-5 text-white text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blueHover active:scale-95"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <div className="text-center mt-6">
                 <button onClick={onBackToLogin} className="text-bluePrimary font-semibold cursor-pointer hover:underline">
                    &larr; Back to Login
                </button>
            </div>
        </div>
    );
}

export default ForgotPasswordForm;