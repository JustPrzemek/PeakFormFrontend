export interface AuthResponse {
  token: string | null;
  refreshToken: string | null;
  userId: number;
  username: string;
}

export interface UserDto {
  id: number;
  email: string;
  username: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  username: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
}

export interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegistrationRequest) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}