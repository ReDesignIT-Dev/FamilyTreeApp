import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/pages/HomePage';
import FamilyTreeDetailPage from '@/pages/FamilyTreeDetailPage';
import MemberDetailsPage from '@/pages/MemberDetailsPage';
import AuthPage from '@/pages/auth/AuthPage';
import LoginFormComponent from '@/components/auth/LoginFormComponent';
import RegisterFormComponent from '@/components/auth/RegisterFormComponent';
import ForgotPasswordFormComponent from '@/components/auth/ForgotPasswordFormComponent';
import ResetPasswordFormComponent from '@/components/auth/ResetPasswordFormComponent';
import Activate from '@/pages/auth/Activate';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsLayout from '@/components/settings/SettingsLayout';
import ProfileSettings from '@/pages/settings/ProfileSettings';
import ChangePasswordSettings from '@/pages/settings/ChangePasswordSettings';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import NotificationsSettings from '@/pages/settings/NotificationsSettings';
import DangerZoneSettings from '@/pages/settings/DangerZoneSettings';
import GuestRoute from '@/router/GuestRoute';
import PrivateRoute from '@/router/PrivateRoute';
import {
    ROUTE_AUTH, ROUTE_AUTH_LOGIN, ROUTE_AUTH_REGISTER,
    ROUTE_AUTH_PASSWORD_RECOVERY, ROUTE_AUTH_PASSWORD_RESET,
    ROUTE_MY_TREE, ROUTE_MEMBER_DETAIL,
    PATH_AUTH_ACTIVATE,
    ROUTE_SETTINGS,
    ROUTE_SETTINGS_PROFILE,
    ROUTE_SETTINGS_CHANGE_PASSWORD,
    ROUTE_SETTINGS_SECURITY,
    ROUTE_SETTINGS_NOTIFICATIONS,
    ROUTE_SETTINGS_DANGER_ZONE,
} from './routes';

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <NotFoundPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: ROUTE_MY_TREE, element: <PrivateRoute><FamilyTreeDetailPage /></PrivateRoute> },
            { path: ROUTE_MEMBER_DETAIL, element: <PrivateRoute><MemberDetailsPage /></PrivateRoute> },
            { path: PATH_AUTH_ACTIVATE, element: <Activate /> },

            {
                path: ROUTE_SETTINGS,
                element: <PrivateRoute><SettingsLayout /></PrivateRoute>,
                children: [
                    { index: true, element: <Navigate to={ROUTE_SETTINGS_PROFILE} replace /> },
                    { path: ROUTE_SETTINGS_PROFILE, element: <ProfileSettings /> },
                    { path: ROUTE_SETTINGS_CHANGE_PASSWORD, element: <ChangePasswordSettings /> },
                    { path: ROUTE_SETTINGS_SECURITY, element: <SecuritySettings /> },
                    { path: ROUTE_SETTINGS_NOTIFICATIONS, element: <NotificationsSettings /> },
                    { path: ROUTE_SETTINGS_DANGER_ZONE, element: <DangerZoneSettings /> },
                ],
            },

            {
                path: ROUTE_AUTH,
                element: <GuestRoute><AuthPage /></GuestRoute>,
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