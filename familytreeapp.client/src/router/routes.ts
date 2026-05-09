// Auth
export const ROUTE_AUTH = 'auth';
export const ROUTE_AUTH_LOGIN = 'login';
export const ROUTE_AUTH_REGISTER = 'register';
export const ROUTE_AUTH_ACTIVATE = 'activate/:userId/:token';
export const ROUTE_AUTH_PASSWORD_RECOVERY = 'password-recovery';
export const ROUTE_AUTH_PASSWORD_RESET = 'password-reset/:userId';

// App
export const ROUTE_MY_TREE = 'my-family-tree';
export const ROUTE_MEMBER_DETAIL = 'members/:memberId';
export const ROUTE_SETTINGS = 'settings';
export const ROUTE_SETTINGS_PROFILE = 'profile';
export const ROUTE_SETTINGS_CHANGE_PASSWORD = 'change-password';
export const ROUTE_SETTINGS_SECURITY = 'security';
export const ROUTE_SETTINGS_NOTIFICATIONS = 'notifications';
export const ROUTE_SETTINGS_DANGER_ZONE = 'danger-zone';

// Absolute paths
export const PATH_HOME = '/';
export const PATH_MY_TREE = `/${ROUTE_MY_TREE}`;
export const PATH_AUTH = `/${ROUTE_AUTH}`;
export const PATH_AUTH_LOGIN = `/${ROUTE_AUTH}/${ROUTE_AUTH_LOGIN}`;
export const PATH_AUTH_REGISTER = `/${ROUTE_AUTH}/${ROUTE_AUTH_REGISTER}`;
export const PATH_AUTH_ACTIVATE = `/${ROUTE_AUTH}/${ROUTE_AUTH_ACTIVATE}`;
export const PATH_AUTH_PASSWORD_RECOVERY = `/${ROUTE_AUTH}/${ROUTE_AUTH_PASSWORD_RECOVERY}`;
export const PATH_AUTH_PASSWORD_RESET = `/${ROUTE_AUTH}/password-reset`;
export const PATH_MEMBER_DETAIL = (memberId: string) => `/members/${memberId}`;
export const PATH_SETTINGS = `/${ROUTE_SETTINGS}`;
export const PATH_SETTINGS_PROFILE = `${PATH_SETTINGS}/${ROUTE_SETTINGS_PROFILE}`;
export const PATH_SETTINGS_CHANGE_PASSWORD = `${PATH_SETTINGS}/${ROUTE_SETTINGS_CHANGE_PASSWORD}`;
export const PATH_SETTINGS_SECURITY = `${PATH_SETTINGS}/${ROUTE_SETTINGS_SECURITY}`;
export const PATH_SETTINGS_NOTIFICATIONS = `${PATH_SETTINGS}/${ROUTE_SETTINGS_NOTIFICATIONS}`;
export const PATH_SETTINGS_DANGER_ZONE = `${PATH_SETTINGS}/${ROUTE_SETTINGS_DANGER_ZONE}`;