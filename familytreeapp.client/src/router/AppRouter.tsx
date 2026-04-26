import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/pages/HomePage';
import FamilyTreeListPage from '@/pages/FamilyTreeListPage';
import FamilyTreeDetailPage from '@/pages/FamilyTreeDetailPage';
import MemberDetailsPage from '@/pages/MemberDetailsPage';
import AuthPage from '@/pages/auth/AuthPage';
import LoginFormComponent from '@/components/auth/LoginFormComponent';
import RegisterFormComponent from '@/components/auth/RegisterFormComponent';
import ForgotPasswordFormComponent from '@/components/auth/ForgotPasswordFormComponent';
import ResetPasswordFormComponent from '@/components/auth/ResetPasswordFormComponent';
import Activate from '@/pages/auth/Activate';
import NotFoundPage from '@/pages/NotFoundPage';
import CreateTreePage from '@/pages/CreateTreePage';
import {
    ROUTE_AUTH, ROUTE_AUTH_LOGIN, ROUTE_AUTH_REGISTER,
    ROUTE_AUTH_PASSWORD_RECOVERY, ROUTE_AUTH_PASSWORD_RESET,
    ROUTE_TREES, ROUTE_TREE_DETAIL, ROUTE_MEMBER_DETAIL,
    ROUTE_TREE_NEW, PATH_AUTH_ACTIVATE,
} from './routes';

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: ROUTE_TREES, element: <FamilyTreeListPage /> },
            { path: ROUTE_TREE_NEW, element: <CreateTreePage /> },
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
                    { path: ROUTE_AUTH_PASSWORD_RECOVERY, element: <ForgotPasswordFormComponent /> },
                    { path: ROUTE_AUTH_PASSWORD_RESET, element: <ResetPasswordFormComponent /> },
                ],
            },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}