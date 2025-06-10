import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Calendar, Weight, Ruler, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    age: '',
    weight: '',
    height: '',
    goal: 'maintenance'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await register({
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height)
      });
      
      if (success) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => onSwitchToLogin(), 3000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon">
            <User size={32} />
          </div>
          <h1>Create Account</h1>
          <p>Join us to start your fitness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose username"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password (min 8 characters)"
                minLength={8}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" size={20} />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <div className="input-wrapper">
                <Weight className="input-icon" size={20} />
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight in kg"
                  step="0.1"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Height (cm)</label>
              <div className="input-wrapper">
                <Ruler className="input-icon" size={20} />
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height in cm"
                  step="0.1"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fitness Goal</label>
              <div className="input-wrapper">
                <Target className="input-icon" size={20} />
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="reduction">Weight Loss</option>
                  <option value="bulk">Muscle Gain</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="link-button">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}