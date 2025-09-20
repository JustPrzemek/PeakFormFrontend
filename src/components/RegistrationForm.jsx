import { useState } from 'react';
import { FaUser, FaEnvelope, FaBirthdayCake, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import IconInput from './IconInput';
import { registerUser } from '../services/authService';
import { FcGoogle } from "react-icons/fc";
import IconButton from './IconButton';

function RegistrationForm() {
    const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '', age: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid.";

        if (!formData.username) newErrors.username = "Username is required.";

        if (!formData.password) newErrors.password = "Password is required.";
        else if (formData.password.length < 12) newErrors.password = "Password must be at least 12 characters long.";
        else if (!/(?=.*[a-z])/.test(formData.password)) newErrors.password = "Password must contain a lowercase letter.";
        else if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = "Password must contain an uppercase letter.";
        else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = "Password must contain a number.";
        else if (!/(?=.*[@$!%*?&])/.test(formData.password)) newErrors.password = "Password must contain a special character (@$!%*?&).";
        
        if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

        if (!formData.age) newErrors.age = "Age is required.";
        else if (formData.age <= 0) newErrors.age = "Please enter a valid age.";

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear specific error when user starts typing
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
        setMessage('');
        setApiError('');
        setLoading(true);

        try {
            await registerUser(formData);
            setMessage('Registration successful! Please check your email to verify your account.');
        } catch (err) {
            if (err && err.message) {
                setApiError(err.message);

                // Dodatkowa logika: jeśli błąd dotyczy nazwy użytkownika,
                // możemy też ustawić błąd walidacji bezpośrednio w polu.
                if (err.code === 'USER_ALREADY_EXISTS') {
                    if (err.message.toLowerCase().includes('email')) {
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        email: err.message // Przypisz błąd do pola EMAIL
                    }));
                } else if (err.message.toLowerCase().includes('username')) {
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        username: err.message // Przypisz błąd do pola USERNAME
                    }));
                }
            }
            } else {
                setApiError('An unexpected error occurred.');
            }
        } finally {
        setLoading(false);
    }
    };
    
    if (message) {
        return (
            <div className="w-full h-full bg-amber-50 flex flex-col justify-center items-center px-12 text-center">
                <h2 className="text-2xl font-semibold text-green-600">✅ Success!</h2>
                <p className="mt-4 text-lg">{message}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-amber-50 flex flex-col justify-center px-12 md:px-24">
            <h1 className="text-3xl font-semibold mt-6 opacity-80 text-neutral-900">Create an Account</h1>
            
            {apiError && <p className="text-red-500 mt-4 text-center bg-red-100 p-2 rounded-md">{apiError}</p>}

            <form onSubmit={handleSubmit} noValidate>
                <IconInput placeholder="Email" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email}>
                    <FaEnvelope />
                </IconInput>
                <IconInput placeholder="Username" type="text" name="username" value={formData.username} onChange={handleChange} error={errors.username}>
                    <FaUser />
                </IconInput>
                <IconInput 
                    placeholder="Password" 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    error={errors.password}
                    isPassword={true}
                    onToggleVisibility={() => setShowPassword(!showPassword)}
                >
                    <RiLockPasswordLine />
                </IconInput>
                <IconInput 
                    placeholder="Confirm Password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    error={errors.confirmPassword}
                    isPassword={true}
                    onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    <RiLockPasswordLine />
                </IconInput>
                <IconInput placeholder="Age" type="number" name="age" value={formData.age} onChange={handleChange} error={errors.age}>
                    <FaBirthdayCake />
                </IconInput>
                
                <button 
                type="submit" 
                disabled={loading}
                className={`bg-celestialBlue w-full py-4 rounded-lg mt-5 text-white text-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all 
                ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:opacity-90 active:scale-95"}`}>
                    {loading ? "Loading..." : "Register"}
                </button>

                <span className="block text-center opacity-70 mt-6 text-gray-800">or continue with</span>
            
            </form>
                <a href="http://localhost:8080/oauth2/authorization/google" className="flex justify-center gap-x-5">
                    <IconButton text="Google">
                        <FcGoogle />
                    </IconButton>
                </a>
        </div>
    );
}

export default RegistrationForm;