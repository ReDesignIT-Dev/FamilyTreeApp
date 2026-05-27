export interface ReCaptchaData {
  recaptchaToken: string | null;
}

export interface PasswordData {
  password: string;
  passwordConfirm: string;
}

export interface EmailData {
  email: string;
}

export interface LoginData extends ReCaptchaData, EmailData {
  password: string;
}

export interface RegisterData extends ReCaptchaData, PasswordData, EmailData {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth: string; // ISO date string: "YYYY-MM-DD"
}

export interface PasswordResetData extends ReCaptchaData, PasswordData {}

export interface PasswordRecoveryData extends ReCaptchaData, EmailData {}

export interface AuthTokenResponse {
  token: string;
}

// ✅ Standard server message response shape
export interface MessageResponse {
  message: string;
}