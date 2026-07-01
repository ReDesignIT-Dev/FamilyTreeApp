import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/reduxComponents/hooks';
import { PATH_MY_TREE } from '@/router/routes';

interface GuestRouteProps {
    children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

    if (isLoggedIn) {
        return <Navigate to={PATH_MY_TREE} replace />;
    }

    return <>{children}</>;
};

export default GuestRoute;