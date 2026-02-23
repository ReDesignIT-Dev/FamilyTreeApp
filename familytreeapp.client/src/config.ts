export const FRONTEND_APP_URL = "/treeapp";
export const BACKEND_SHOP_URL = "/familytreeapp-api";

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "https://localhost:7288";
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:3000";
export const RECAPTCHA_SITEKEY = import.meta.env.VITE_RECAPTCHA_SITEKEY || "6LeCoQksAAAAAJAdGvP3gr3BfpfiHSQzWV8bBxqK";

// Rest of your existing configuration...
export const BACKEND_AUTH_URL = "api/treeapp/auth";

// main page
export const FRONTEND_ABOUT_URL = "/about";
export const FRONTEND_CONTACT_URL = "/contact";

// user login/register - AUTH based
export const ROUTE_PATH_LOGIN = "/login";
export const FRONTEND_LOGIN_URL = `${FRONTEND_APP_URL}${ROUTE_PATH_LOGIN}`;
export const ROUTE_PATH_REGISTER = "/register";
export const FRONTEND_REGISTER_URL = `${FRONTEND_APP_URL}${ROUTE_PATH_REGISTER}`;
export const ROUTE_PATH_ACTIVATE_USER = "/activate/:userId/:token";
export const FRONTEND_ACTIVATE_USER_URL = `${FRONTEND_APP_URL}${ROUTE_PATH_ACTIVATE_USER}`;
export const ROUTE_PATH_PASSWORD_RECOVERY = "/password-recovery"
export const FRONTEND_PASSWORD_RECOVERY_URL = `${FRONTEND_APP_URL}${ROUTE_PATH_PASSWORD_RECOVERY}`;
export const ROUTE_PATH_PASSWORD_RESET = "/password-reset/:token";
export const FRONTEND_PASSWORD_RESET_URL = `${FRONTEND_APP_URL}${ROUTE_PATH_PASSWORD_RESET}`;

// ============= ADMIN PANELS SEPARATION =============

// SHOP ADMIN PANEL (shop/admin-panel)
export const SHOP_ADMIN_PANEL_URL = "/admin-panel";
export const ROUTE_PATH_SHOP_ADMIN_PANEL = `${SHOP_ADMIN_PANEL_URL}/*`;
export const FRONTEND_SHOP_ADMIN_PANEL_URL = `${FRONTEND_APP_URL}${SHOP_ADMIN_PANEL_URL}`;

// MAIN SITE ADMIN PANEL (admin-panel)
export const MAIN_ADMIN_PANEL_URL = "/admin-panel";
export const ROUTE_PATH_MAIN_ADMIN_PANEL = `${MAIN_ADMIN_PANEL_URL}/*`;
export const FRONTEND_MAIN_ADMIN_PANEL_URL = MAIN_ADMIN_PANEL_URL;

// API urls should match the django urls
export const API_LOGOUT_USER_URL = `${BACKEND_AUTH_URL}/logout`;
export const API_LOGIN_USER_URL = `${BACKEND_AUTH_URL}/login`;
export const API_ACTIVATE_USER_URL = `${BACKEND_AUTH_URL}/confirm-email`;
export const API_REGISTER_USER_URL = `${BACKEND_AUTH_URL}/register`;
export const API_PASSWORD_RESET_URL = `${BACKEND_AUTH_URL}/password-reset`;

// API shop based
export const API_PRODUCTS_QUERY_URL = `${BACKEND_SHOP_URL}/products`;
export const API_PRODUCT_URL = `${BACKEND_SHOP_URL}/products/`;
export const API_CATEGORY_URL = `${BACKEND_SHOP_URL}/categories/`;
export const API_CATEGORY_PATH_URL = `${API_CATEGORY_URL}path/`;
export const API_ALL_CATEGORIES_TREE = `${API_CATEGORY_URL}tree`;
export const API_SEARCH_URL = `${BACKEND_SHOP_URL}/products?search=`;
export const API_SEARCH_ASSOCIATED_CATEGORIES_URL = `${BACKEND_SHOP_URL}/search-associated-categories`;
export const API_CART_URL = `${BACKEND_SHOP_URL}/cart`;
export const API_ADD_TO_CART_URL = `${API_CART_URL}/add`;
export const API_UPDATE_CART_URL = `${API_CART_URL}/items`;
export const API_DELETE_FROM_CART_URL = `${API_CART_URL}/items`;

// ============= MAIN SITE ADMIN PANEL NAVIGATION =============
// Main site admin panel navigation - RELATIVE PATHS for internal navigation
export const MAIN_ADMIN_PROJECTS_PATH = "projects";
export const MAIN_ADMIN_PROJECTS_ADD_PATH = `${MAIN_ADMIN_PROJECTS_PATH}/add`;
export const MAIN_ADMIN_PROJECTS_EDIT_PATH = `${MAIN_ADMIN_PROJECTS_PATH}/:id/edit`;
export const MAIN_ADMIN_SETTINGS_PATH = "settings";
export const MAIN_ADMIN_ANALYTICS_PATH = "analytics";

// Main site admin panel navigation - ABSOLUTE PATHS for external navigation
export const FRONTEND_MAIN_ADMIN_PROJECTS_URL = `${FRONTEND_MAIN_ADMIN_PANEL_URL}/${MAIN_ADMIN_PROJECTS_PATH}`;
export const FRONTEND_MAIN_ADMIN_SETTINGS_URL = `${FRONTEND_MAIN_ADMIN_PANEL_URL}/${MAIN_ADMIN_SETTINGS_PATH}`;
export const FRONTEND_MAIN_ADMIN_ANALYTICS_URL = `${FRONTEND_MAIN_ADMIN_PANEL_URL}/${MAIN_ADMIN_ANALYTICS_PATH}`;

// Main Site Admin Helper functions
export const getMainAdminProjectEditPath = (id: number) => `${MAIN_ADMIN_PROJECTS_PATH}/${id}/edit`;
export const getMainProjectEditPath = (id: number) => `${id}/edit`;
export const getMainProjectAddPath = () => "add";
