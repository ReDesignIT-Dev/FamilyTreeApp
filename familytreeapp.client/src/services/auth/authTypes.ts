export interface ReCaptchaData {
  recaptchaToken: string | null;
}

export interface UsernameData {
  username: string;
}

export interface PasswordData {
  password: string;
  passwordConfirm: string;
}

export interface EmailData {
  email: string;
}

export interface LoginData extends ReCaptchaData, UsernameData {
  password: string;
}

export interface RegisterData extends ReCaptchaData, UsernameData, PasswordData, EmailData {}

export interface PasswordResetData extends ReCaptchaData, PasswordData {}

export interface PasswordRecoveryData extends ReCaptchaData, EmailData {}

export interface AuthTokenResponse {
  token: string;
}

// ✅ Standard server message response shape
export interface MessageResponse {
  message: string;
}