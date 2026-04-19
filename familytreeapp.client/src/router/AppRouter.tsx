import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/pages/HomePage';
import FamilyTreeListPage from '@/pages/FamilyTreeListPage';
import FamilyTreeDetailPage from '@/pages/FamilyTreeDetailPage';
import MemberDetailsPage from '@/pages/MemberDetailsPage';
import AuthPage from '@/pages/auth/AuthPage';
import LoginFormComponent from '@/components/auth/LoginFormComponent';
import RegisterFormComponent from '@/components/auth/RegisterFormComponent';
import Activate from '@/pages/auth/Activate';
import NotFoundPage from '@/pages/NotFoundPage';
import {
    ROUTE_AUTH, ROUTE_AUTH_LOGIN, ROUTE_AUTH_REGISTER,
    ROUTE_TREES, ROUTE_TREE_DETAIL, ROUTE_MEMBER_DETAIL,
    PATH_AUTH_ACTIVATE,
} from './routes';

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: ROUTE_TREES, element: <FamilyTreeListPage /> },
            { path: ROUTE_TREE_DETAIL, element: <FamilyTreeDetailPage /> },
            { path: ROUTE_MEMBER_DETAIL, element: <MemberDetailsPage /> },

            { path: PATH_AUTH_ACTIVATE, element: <Activate /> },

            {
                path: ROUTE_AUTH,
                element: <AuthPage />,
                children: [
                    { index: true, element: <Navigate to={ROUTE_AUTH_LOGIN} replace /> },
                    { path: ROUTE_AUTH_LOGIN, element: <LoginFormComponent /> },
                    { path: ROUTE_AUTH_REGISTER, element: <RegisterFormComponent /> },
                ],
            },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}