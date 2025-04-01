import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import SignInPage from './pages/signin';
import SignUpPage from './pages/signup';
import OTPForm from './components/OTPform';

import generatetotp from './components/GenerateTOTP'
const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '',
            Component: DashboardPage,
          }
        ],
      },
      {
        path: '/sign-in',
        Component: SignInPage,
      },
      {
        path: '/sign-up',
        Component: SignUpPage,
      },
      {
        path: '/mobile-otp',
        Component: OTPForm,
      },
      // {
      //   path: '/otp-verification',
      //   Component: otpverification
      // },
      {
        path: '/generate-totp/:email',  // Define the route with email as a parameter
        Component:generatetotp  // GenerateTOTP component
      },

    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
