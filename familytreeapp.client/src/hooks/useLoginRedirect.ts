import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PATH_HOME } from '@/router/routes';

export const useLoginRedirect = (defaultRedirect = PATH_HOME) => {
    const isLoggedIn = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo: string = location.state?.from ?? defaultRedirect;

    useEffect(() => {
        if (isLoggedIn) {
            navigate(redirectTo, { replace: true });
        }
    }, [isLoggedIn, navigate, redirectTo]);

    return { from: redirectTo, isLoggedIn };
};