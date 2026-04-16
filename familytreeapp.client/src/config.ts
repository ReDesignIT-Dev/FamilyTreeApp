// ── Environment ──────────────────────────────────────────────────────────────
export const BACKEND_BASE_URL = import.meta.env.VITE_BABACKEND_BASE_URL;
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL;
export const RECAPTCHA_SITEKEY = import.meta.env.VITE_RECAPTCHA_SITEKEY;

// ── Backend API URLs ──────────────────────────────────────────────────────────
export const API_BASE_PATH = '/api';
export const BACKEND_AUTH_URL = `${BACKEND_BASE_URL}/auth`;

export const API_LOGIN_USER_URL = `${BACKEND_AUTH_URL}/login`;
export const API_LOGOUT_USER_URL = `${BACKEND_AUTH_URL}/logout`;
export const API_REGISTER_USER_URL = `${BACKEND_AUTH_URL}/register`;
export const API_ACTIVATE_USER_URL = `${BACKEND_AUTH_URL}/confirm-email`;
export const API_PASSWORD_RESET_URL = `${BACKEND_AUTH_URL}/password-reset`;

// ── External-facing frontend URLs (used in backend-sent emails, OAuth, etc.) ─
// These are absolute URLs — NOT for internal navigation.
// For internal navigation use PATH_* constants from @/router/routes.ts instead.
export const FRONTEND_LOGIN_URL = `${FRONTEND_BASE_URL}/auth/login`;
export const FRONTEND_REGISTER_URL = `${FRONTEND_BASE_URL}/auth/register`;
export const FRONTEND_ACTIVATE_USER_URL = `${FRONTEND_BASE_URL}/auth/activate/:userId/:token`;
export const FRONTEND_PASSWORD_RECOVERY_URL = `${FRONTEND_BASE_URL}/password-recovery`;
export const FRONTEND_PASSWORD_RESET_URL = `${FRONTEND_BASE_URL}/password-reset/:token`;

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ADMIN_PANEL_URL = '/admin-panel';
export const ROUTE_PATH_ADMIN_PANEL = `${ADMIN_PANEL_URL}/*`;
export const FRONTEND_ADMIN_PANEL_URL = `${FRONTEND_BASE_URL}${ADMIN_PANEL_URL}`;

// ── Misc ──────────────────────────────────────────────────────────────────────
export const DEFAULT_IMAGE = '/images/default-image.png';