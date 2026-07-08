import { logoutUser, postLogin } from "@/services/auth/apiRequestsUser";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { decodeJwtPayload, getIsAdminFromJwt, getValidatedToken, isTokenValid, isUserAdmin, setToken } from "@/utils/cookies";
import { AxiosError } from "axios";

export interface AuthState {
    isLoggedIn: boolean;
    username: string | null;
    token: string | null;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
}

interface LoginResponse {
    token: string;
    username: string;
    isAdmin: boolean;
}

// Helper function to extract username from token
function getUsernameFromToken(token: string): string | null {
    try {
        const payload = decodeJwtPayload(token);
        if (!payload) return null;
        return payload.unique_name ?? null;
    } catch {
        return null;
    }
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        if (error.response) {
            return error.response.data ?? "Server Error";
        }
        if (error.request) {
            return "No response from server";
        }
    }
    return "Invalid username or password";
}

export const loginUser = createAsyncThunk<
    LoginResponse,
    { email: string; password: string; recaptchaToken: string | null }
>(
    "auth/loginUser",
    async ({ email, password, recaptchaToken }, { rejectWithValue }) => {
        try {
            const response = await postLogin({ email, password, recaptchaToken });
            if (response?.status === 200) {
                const { token, username: responseUsername } = response.data as LoginResponse;
                setToken(token);
                const isAdmin = getIsAdminFromJwt(token);
                return { token, username: responseUsername, isAdmin };
            }
            return rejectWithValue("Unexpected response status");
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await logoutUser();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response ? error.response.data : "Network Error");
            }
            return rejectWithValue("Network Error");
        }
    }
);

// ✅ Fix: Store token once and reuse it safely
const validatedToken = getValidatedToken();
const isValidToken = validatedToken && isTokenValid();

const initialState: AuthState = {
    isLoggedIn: Boolean(isValidToken),
    username: validatedToken ? getUsernameFromToken(validatedToken) : null, // ✅ Safe - no non-null assertion
    isAdmin: Boolean(isValidToken && isUserAdmin()),
    token: validatedToken,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isLoggedIn = true;
                state.token = action.payload.token;
                state.username = action.payload.username;
                state.isAdmin = action.payload.isAdmin;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.isAdmin = false;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.isLoggedIn = false;
                state.isAdmin = false;
                state.token = null;
                state.username = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default authSlice.reducer;