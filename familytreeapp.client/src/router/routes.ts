// Auth
export const ROUTE_AUTH = 'auth';
export const ROUTE_AUTH_LOGIN = 'login';
export const ROUTE_AUTH_REGISTER = 'register';
export const ROUTE_AUTH_ACTIVATE = 'activate/:userId/:token';
export const ROUTE_AUTH_PASSWORD_RECOVERY = 'password-recovery';
export const ROUTE_AUTH_PASSWORD_RESET = 'password-reset/:token';

// App
export const ROUTE_TREES = 'trees';
export const ROUTE_TREE_DETAIL = 'trees/:treeId';
export const ROUTE_TREE_NEW = 'trees/new';
export const ROUTE_MEMBER_DETAIL = 'members/:memberId';
export const ROUTE_SETTINGS = 'settings';

// Absolute paths (for use in navigate() and <Link to="">)
export const PATH_HOME = '/';
export const PATH_AUTH = `/${ROUTE_AUTH}`;
export const PATH_AUTH_LOGIN = `/${ROUTE_AUTH}/${ROUTE_AUTH_LOGIN}`;
export const PATH_AUTH_REGISTER = `/${ROUTE_AUTH}/${ROUTE_AUTH_REGISTER}`;
export const PATH_AUTH_ACTIVATE = `/${ROUTE_AUTH}/${ROUTE_AUTH_ACTIVATE}`;  // ✅ add this
export const PATH_TREES = `/${ROUTE_TREES}`;
export const PATH_TREE_NEW = `/${ROUTE_TREE_NEW}`;
export const PATH_TREE_DETAIL = (treeId: string) => `/${ROUTE_TREES}/${treeId}`;
export const PATH_MEMBER_DETAIL = (memberId: string) => `/members/${memberId}`;
export const PATH_SETTINGS = `/${ROUTE_SETTINGS}`;