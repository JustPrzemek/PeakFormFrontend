import { AuthResponse, LoginRequest, RegistrationRequest, UserDto } from '../types/auth.types';

const API_BASE = 'http://localhost:8080/api/auth';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  }

  static async register(data: RegistrationRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  }

  static async getCurrentUser(token: string): Promise<UserDto> {
    const response = await fetch(`${API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    return response.json();
  }

  static async logout(refreshToken: string): Promise<void> {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  static async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_BASE}/request-password-reset?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to request password reset');
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE}/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset password');
    }
  }

  static async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/verify-email?token=${encodeURIComponent(token)}`);
    
    if (!response.ok) {
      throw new Error('Email verification failed');
    }
  }
}