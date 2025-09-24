import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import IconInput from './IconInput';
import IconButton from './IconButton';
import { loginUser } from '../services/authService';

function LoginForm({ onForgotPassword }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!credentials.username) newErrors.username = "Username is required.";
        if (!credentials.password) newErrors.password = "Password is required.";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        if(errors[name]) {
            setErrors({...errors, [name]: ''});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setApiError('');
        try {
            await loginUser(credentials);
            navigate('/home'); // Redirect on success
        } catch (err) {
            setApiError(err.message || "Invalid username or password.");
        }
    };

    return (
        <div className="w-full h-full bg-amber-50 flex flex-col justify-center px-12 md:px-24">
            <h1 className="text-3xl font-semibold mt-6 opacity-80 text-neutral-900">Log in to your Account</h1>
            
            {apiError && <p className="text-red-500 mt-4 text-center bg-red-100 p-2 rounded-md">{apiError}</p>}

            <form onSubmit={handleSubmit} noValidate>
                <IconInput 
                    placeholder="Username" 
                    type="text" 
                    name="username" 
                    value={credentials.username} 
                    onChange={handleChange}
                    error={errors.username}
                >
                    <FaUser />
                </IconInput>

                <IconInput 
                    placeholder="Password" 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={credentials.password} 
                    onChange={handleChange}
                    error={errors.password}
                    isPassword={true}
                    onToggleVisibility={() => setShowPassword(!showPassword)}
                >
                    <RiLockPasswordLine />
                </IconInput>

                <div className="flex justify-end items-center mt-3">
                    <button type="button" onClick={onForgotPassword} className="text-celestialBlue hover:underline">
                        Forgot Password?
                    </button>
                </div>

                <button type="submit" className="bg-celestialBlue w-full py-4 rounded-lg mt-5 text-amber-50 text-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                    Login
                </button>
            </form>

            <span className="block text-center opacity-70 mt-6 text-gray-800">or continue with</span>
            <a href="http://localhost:8080/oauth2/authorize/google" className="w-full flex justify-center">
                <IconButton text="Google">
                    <FcGoogle />
                </IconButton>
            </a>
        </div>
    );
}

export default LoginForm;