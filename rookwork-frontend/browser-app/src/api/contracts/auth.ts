export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthRegister {
  username: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
