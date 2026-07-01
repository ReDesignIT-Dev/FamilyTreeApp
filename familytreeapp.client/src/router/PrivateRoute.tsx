import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/reduxComponents/hooks';
import { PATH_AUTH_LOGIN } from '@/router/routes';

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to={PATH_AUTH_LOGIN} state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;