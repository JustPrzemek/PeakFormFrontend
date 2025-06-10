import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthService } from '../services/AuthService';
import { AuthContextType, UserDto, LoginRequest, RegistrationRequest } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      AuthService.getCurrentUser(token)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await AuthService.login(credentials);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (data: RegistrationRequest): Promise<boolean> => {
    try {
      await AuthService.register(data);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await AuthService.logout(refreshToken);
      } catch {}
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}