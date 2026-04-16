import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FRONTEND_BASE_URL } from '@/config'; 

export const useLoginRedirect = (defaultRedirect = FRONTEND_BASE_URL) => {
    const isLoggedIn = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getRedirectDestination = () => {
        if (location.state?.from) {
            return location.state.from;
        }
         return { pathname: defaultRedirect };
    };

    const redirectTo = getRedirectDestination();

    useEffect(() => {
        if (isLoggedIn) {
            navigate(redirectTo, { replace: true });
        }
    }, [isLoggedIn, navigate, redirectTo]);

    return { from: redirectTo, isLoggedIn };
};