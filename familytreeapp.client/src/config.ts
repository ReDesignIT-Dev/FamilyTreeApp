export const FRONTEND_URL = "/familytree";
export const BACKEND_URL = "/familytreeapp-api";

export const BACKEND_BASE_URL = import.meta.env.VITE_BABACKEND_BASE_URL || "https://localhost:7288";
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:3000";
export const RECAPTCHA_SITEKEY = import.meta.env.VITE_RECAPTCHA_SITEKEY || "6LeCoQksAAAAAJAdGvP3gr3BfpfiHSQzWV8bBxqK";

export const BACKEND_AUTH_URL = `${BACKEND_URL}/auth`;

// user login/register - AUTH based
export const ROUTE_PATH_LOGIN = "/login";
export const FRONTEND_LOGIN_URL = `${FRONTEND_URL}${ROUTE_PATH_LOGIN}`;
export const ROUTE_PATH_REGISTER = "/register";
export const FRONTEND_REGISTER_URL = `${FRONTEND_URL}${ROUTE_PATH_REGISTER}`;
export const ROUTE_PATH_ACTIVATE_USER = "/auth/activate/:userId/:token";
export const FRONTEND_ACTIVATE_USER_URL = `${FRONTEND_URL}${ROUTE_PATH_ACTIVATE_USER}`;
export const ROUTE_PATH_PASSWORD_RECOVERY = "/password-recovery"
export const FRONTEND_PASSWORD_RECOVERY_URL = `${FRONTEND_URL}${ROUTE_PATH_PASSWORD_RECOVERY}`;
export const ROUTE_PATH_PASSWORD_RESET = "/password-reset/:token";
export const FRONTEND_PASSWORD_RESET_URL = `${FRONTEND_URL}${ROUTE_PATH_PASSWORD_RESET}`;

// ============= ADMIN PANELS SEPARATION =============

export const ADMIN_PANEL_URL = "/admin-panel";
export const ROUTE_PATH_ADMIN_PANEL = `${ADMIN_PANEL_URL}/*`;
export const FRONTEND_ADMIN_PANEL_URL = `${FRONTEND_URL}${ADMIN_PANEL_URL}`;

// API urls should match the backend urls
export const API_LOGOUT_USER_URL = `${BACKEND_AUTH_URL}/logout`;
export const API_LOGIN_USER_URL = `${BACKEND_AUTH_URL}/login`;
export const API_ACTIVATE_USER_URL = `${BACKEND_AUTH_URL}/confirm-email`;
export const API_REGISTER_USER_URL = `${BACKEND_AUTH_URL}/register`;
export const API_PASSWORD_RESET_URL = `${BACKEND_AUTH_URL}/password-reset`;

export const DEFAULT_IMAGE = "/images/default-image.png";