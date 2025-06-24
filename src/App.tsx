import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/react-query';
import { ROUTES } from './shared/constants';
import { ProtectedRoute } from './presentation/components/ProtectedRoute';
import { PublicRoute } from './presentation/components/PublicRoute';
import { LoginPage } from './presentation/pages/LoginPage';
import { RegisterPage } from './presentation/pages/RegisterPage';
import { VerifyEmailPage } from './presentation/pages/VerifyEmailPage';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { DocumentsPage } from './presentation/pages/DocumentsPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Email verification route - semi-protected */}
            <Route
              path={ROUTES.VERIFY_EMAIL}
              element={
                <ProtectedRoute requireEmailVerification={false}>
                  <VerifyEmailPage />
                </ProtectedRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCUMENTS}
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </div>
      </Router>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      {/* React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;