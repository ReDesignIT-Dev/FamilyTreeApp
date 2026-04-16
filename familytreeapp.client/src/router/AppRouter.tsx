import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/pages/HomePage';
import FamilyTreeListPage from '@/pages/FamilyTreeListPage';
import FamilyTreeDetailPage from '@/pages/FamilyTreeDetailPage';
import MemberDetailsPage from '@/pages/MemberDetailsPage';
import AuthPage from '@/pages/AuthPage';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import NotFoundPage from '@/pages/NotFoundPage';
import {
  ROUTE_AUTH, ROUTE_AUTH_LOGIN, ROUTE_AUTH_REGISTER,
  ROUTE_TREES, ROUTE_TREE_DETAIL, ROUTE_MEMBER_DETAIL,
} from './routes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTE_TREES,
        element: <FamilyTreeListPage />,
      },
      {
        path: ROUTE_TREE_DETAIL,
        element: <FamilyTreeDetailPage />,
      },
      {
        path: ROUTE_MEMBER_DETAIL,
        element: <MemberDetailsPage />,
      },
      {
        path: ROUTE_AUTH,
        element: <AuthPage />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTE_AUTH_LOGIN} replace />,
          },
          {
            path: ROUTE_AUTH_LOGIN,
            element: <Login />,
          },
          {
            path: ROUTE_AUTH_REGISTER,
            element: <Register />,
          },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}