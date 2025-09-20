import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import IconInput from '../components/IconInput';
import { resetPassword } from '../services/authService';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (message) {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            const timeout = setTimeout(() => {
                navigate('/');
            }, countdown * 1000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [countdown, message, navigate]);

    const validate = () => {
        const newErrors = {};
        const { newPassword, confirmPassword } = passwords;

        if (!newPassword) newErrors.newPassword = "New password is required.";
        else if (newPassword.length < 12) newErrors.newPassword = "Password must be at least 12 characters long.";
        else if (!/(?=.*[a-z])/.test(newPassword)) newErrors.newPassword = "Password must contain a lowercase letter.";
        else if (!/(?=.*[A-Z])/.test(newPassword)) newErrors.newPassword = "Password must contain an uppercase letter.";
        else if (!/(?=.*\d)/.test(newPassword)) newErrors.newPassword = "Password must contain a number.";
        else if (!/(?=.*[@$!%*?&])/.test(newPassword)) newErrors.newPassword = "Password must contain a special character (@$!%*?&).";

        if (!confirmPassword) newErrors.confirmPassword = "Please confirm your new password.";
        else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

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
            setApiError("Invalid or missing token.");
            return;
        }

        setErrors({});
        setApiError('');
        setMessage('');

        try {
            await resetPassword(token, passwords.newPassword);
            setMessage('Your password has been reset successfully! You can now log in.');
            setCountdown(3);
        } catch (err) {
            setApiError(err.message || 'Failed to reset password. The link may have expired.');
        }
    };

    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-slate-100">
            <div className="w-full max-w-md bg-amber-50 p-8 rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold text-center">Set a New Password</h1>

                {message && <p className="text-green-500 mt-4 text-center">{message}
                    <br />Redirecting in {countdown}...
                    </p>}
                {apiError && <p className="text-red-500 mt-4 text-center">{apiError}</p>}

                {token && !message && (
                    <form onSubmit={handleSubmit} className="mt-6" noValidate>
                        <IconInput 
                            placeholder="New Password" 
                            type={showNewPassword ? "text" : "password"} 
                            name="newPassword" 
                            value={passwords.newPassword} 
                            onChange={handleChange}
                            error={errors.newPassword}
                            isPassword={true}
                            onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
                        >
                            <RiLockPasswordLine />
                        </IconInput>
                        <IconInput 
                            placeholder="Confirm New Password" 
                            type={showConfirmPassword ? "text" : "password"} 
                            name="confirmPassword" 
                            value={passwords.confirmPassword} 
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            isPassword={true}
                            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <RiLockPasswordLine />
                        </IconInput>
                        <button type="submit" className="bg-celestialBlue w-full py-3 rounded-lg mt-6 text-white text-lg cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                            Reset Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;