import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Home, LogOut, User } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../application/hooks/useAuth';
import { ROUTES } from '../../shared/constants';
import { ThemeToggle } from '../components/ThemeToggle';
import { CategoriesSidebar } from '../components/CategoriesSidebar';

export function DashboardLayout() {
  const { user, logout, logoutAll, isLoggingOut, isLoggingOutAll } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  
  const isDocumentsPage = location.pathname.includes('/documents');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navItems = [
    {
      to: ROUTES.DASHBOARD,
      icon: Home,
      label: 'Overview',
      end: true,
    },
    {
      to: ROUTES.DOCUMENTS,
      icon: FileText,
      label: 'Documents',
    },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - only show on documents page */}
      {isDocumentsPage && (
        <CategoriesSidebar
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Navigation */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">SecureDocs</span>
                </div>

                <nav className="hidden md:flex space-x-1">
                  {navItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* User Info and Actions */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                  {!user.emailVerified && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <ThemeToggle />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoutAll()}
                    disabled={isLoggingOutAll}
                  >
                    {isLoggingOutAll ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Logout All
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="md:hidden mt-4 flex space-x-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* Email Verification Banner */}
        {!user.emailVerified && (
          <div className="bg-orange-50 dark:bg-orange-950 border-b border-orange-200 dark:border-orange-800">
            <div className="container mx-auto px-4 py-3">
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Email Verification Required
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Please check your email and click the verification link to
                        access all features.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <Outlet context={{ selectedCategoryId, setSelectedCategoryId }} />
          </div>
        </main>
      </div>
    </div>
  );
}
