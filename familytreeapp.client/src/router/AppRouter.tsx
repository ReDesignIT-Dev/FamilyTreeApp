import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import HomePage from '@/pages/HomePage';
import FamilyTreeListPage from '@/pages/FamilyTreeListPage';
import FamilyTreeDetailPage from '@/pages/FamilyTreeDetailPage';
import MemberDetailsPage from '@/pages/MemberDetailsPage';
import AuthPage from '@/pages/AuthPage';
import NotFoundPage from '@/pages/NotFoundPage';

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
        path: 'trees',
        element: <FamilyTreeListPage />,  // List view
      },
      {
        path: 'trees/:treeId',
        element: <FamilyTreeDetailPage />,  // Detail view
      },
      {
        path: 'members/:memberId',
        element: <MemberDetailsPage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}