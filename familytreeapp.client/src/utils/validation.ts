import { getValidatedToken } from "./cookies";
import { PASSWORD_RULES, type PasswordRules } from "@/config";

export function isEmailValid(emailToTest: string): boolean {
    const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(emailToTest);
}

export function isLengthValid(password: string, minLength = PASSWORD_RULES.minLength): boolean {
    return password.length >= minLength;
}

export function isUppercaseValid(password: string): boolean {
    return /[A-Z]/.test(password);
}

export function isLowercaseValid(password: string): boolean {
    return /[a-z]/.test(password);
}

export function isDigitValid(password: string): boolean {
    return /\d/.test(password);
}

export function isSpecialCharValid(password: string): boolean {
    return /[@$!%*?&#^()]/.test(password);
}

export function isPasswordValid(password: string, rules: PasswordRules = PASSWORD_RULES): boolean {
    if (!password) return false;
    if (!isLengthValid(password, rules.minLength)) return false;
    if (rules.requireUppercase && !isUppercaseValid(password)) return false;
    if (rules.requireLowercase && !isLowercaseValid(password)) return false;
    if (rules.requireDigit && !isDigitValid(password)) return false;
    if (rules.requireSpecialChar && !isSpecialCharValid(password)) return false;
    return true;
}

export function isUserLoggedIn(): boolean {
    const token = getValidatedToken();
    return token ? true : false;
}