import type { RootState } from "@/reduxComponents/store";
import { getValidatedToken, isTokenValid } from "@/utils/cookies";
import { createAsyncThunk } from "@reduxjs/toolkit";

interface TokenValidationResult {
    isValid: boolean;
    token: string | null;
}

export const validateToken = createAsyncThunk<
    TokenValidationResult,
    void,
    { state: RootState }
>(
    "auth/validateToken",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const reduxToken = state.auth.token;
            const cookieToken = getValidatedToken();
            
            // Check if token exists and is valid
            const hasValidToken = cookieToken && isTokenValid();
            
            // Verify Redux and cookie tokens match
            if (hasValidToken && reduxToken && reduxToken !== cookieToken) {
                console.warn("Token mismatch between Redux and cookies");
            }

            return {
                isValid: !!hasValidToken,
                token: cookieToken
            };
        } catch (error) {
            console.error("Token validation failed:", error);
            return rejectWithValue({
                isValid: false,
                token: null
            });
        }
    }
);