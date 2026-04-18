import { useSelector } from "react-redux";
import type { RootState } from "@/reduxComponents/store";
import type { AuthState } from "@/reduxComponents/reduxUser/Auth/authReducer";
import { isTokenValid } from "@/utils/cookies";

// Return type omits 'error' and 'token' — internal Redux concerns, not needed by consumers
type UseAuthReturn = Omit<AuthState, "error" | "token">;

export const useAuth = (): UseAuthReturn => {
    const { isLoggedIn, username, isAdmin, isLoading, token } = useSelector(
        (state: RootState) => state.auth
    );

    return {
        isLoggedIn: isLoggedIn && !!token && isTokenValid(),
        username,
        isAdmin,
        isLoading,
    };
};