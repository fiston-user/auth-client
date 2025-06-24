import { useAuth } from '../../application/hooks/useAuth';
import { useDocuments } from '../../application/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Mail, User, HardDrive } from 'lucide-react';
import { formatBytes } from '../../shared/utils';

export const DashboardPage: React.FC = () => {
  const { user, logout, logoutAll, isLoggingOut, isLoggingOutAll } = useAuth();
  const { storageQuota, storageUsed, isLoadingDocuments } = useDocuments();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const storagePercentage = storageQuota > 0 ? Math.round((storageUsed / storageQuota) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
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

        {/* Email Verification Status */}
        {!user.emailVerified && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Mail className="h-5 w-5" />
                Email Verification Required
              </CardTitle>
              <CardDescription className="text-orange-700">
                Please verify your email address to access all features.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* User Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm">
                  {user.emailVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-orange-600">Pending Verification</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Used</p>
                      <p className="text-sm">{storagePercentage}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          storagePercentage > 90 ? 'bg-red-500' :
                          storagePercentage > 75 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Used</p>
                      <p className="font-medium">{formatBytes(storageUsed)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quota</p>
                      <p className="font-medium">{formatBytes(storageQuota)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with managing your documents and categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <div className="text-2xl">📄</div>
                <div className="text-center">
                  <p className="font-medium">Upload Documents</p>
                  <p className="text-sm text-muted-foreground">Add new files</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <div className="text-2xl">📁</div>
                <div className="text-center">
                  <p className="font-medium">Manage Categories</p>
                  <p className="text-sm text-muted-foreground">Organize your files</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <div className="text-2xl">🤖</div>
                <div className="text-center">
                  <p className="font-medium">AI Categorization</p>
                  <p className="text-sm text-muted-foreground">Auto-organize files</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};