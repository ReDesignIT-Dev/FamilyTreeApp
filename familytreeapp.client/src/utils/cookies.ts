import type { JwtPayload } from "@/types/jwt";
import { AUTH_TOKEN_COOKIE, AUTH_IS_ADMIN_COOKIE } from "@/config";

function _setCookie(name: string, value: string, expires?: Date): void {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    if (expires) {
        cookieStr += `; expires=${expires.toUTCString()}`;
    }
    document.cookie = cookieStr;
}
function _getCookie(name: string): string | undefined {
    const key = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie.split('; ').find(c => c.startsWith(key));
    return cookie ? decodeURIComponent(cookie.substring(key.length)) : undefined;
}

function _removeCookie(name: string): void {
    document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const getToken = (): string | null => {
    return _getCookie(AUTH_TOKEN_COOKIE) ?? null;
};

export const getValidatedToken = (): string | null => {
    const token = getToken();
    if (token && !isTokenValid()) {
        console.warn("Token has expired. Removing it from cookies.");
        removeToken();
        return null;
    }
    return token;
};

export const removeToken = (): void => {
    _removeCookie(AUTH_TOKEN_COOKIE);
};

export const setToken = (token: string): void => {
    const expiryDate = getJwtExpiry(token);
    if (!expiryDate || isNaN(expiryDate.getTime())) {
        throw new Error("Invalid token: missing or malformed expiry date");
    }
    _setCookie(AUTH_TOKEN_COOKIE, token, expiryDate);
};

export const isUserAdmin = (): boolean => {
    const token = getToken();
    if (!token) return false;
    return getIsAdminFromJwt(token);
};

export const setIsUserAdmin = (isUserAdmin: boolean): void => {
    _setCookie(AUTH_IS_ADMIN_COOKIE, isUserAdmin.toString());
};

export const removeUserData = (): void => {
    _removeCookie(AUTH_IS_ADMIN_COOKIE);
};

// ✅ Single source of truth — read expiry from the JWT itself, not a separate cookie
export const isTokenValid = (): boolean => {
    const token = _getCookie("token");
    if (!token) return false;

    const expiry = getJwtExpiry(token);
    if (!expiry) {
        console.warn("Token has no expiry claim.");
        removeToken();
        return false;
    }

    const isValid = new Date() < expiry;
    if (!isValid) {
        console.warn("Token has expired.");
        removeToken();
    }
    return isValid;
};

export function getJwtExpiry(token: string): Date | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        if (decoded.exp) {
            return new Date(decoded.exp * 1000);
        }
        return null;
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
}
export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded as JwtPayload;
    } catch (e) {
        console.error("Failed to decode JWT payload:", e);
        return null;
    }
}
export function getIsAdminFromJwt(token: string): boolean {
    try {
        const payload = decodeJwtPayload(token);
        if (!payload) return false;

        if (Array.isArray(payload.role)) {
            return payload.role.includes("Admin");
        }
        return payload.role === "Admin";
    } catch (e) {
        console.error("Failed to get admin status from JWT:", e);
        return false;
    }
}
