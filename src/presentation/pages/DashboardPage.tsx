import { useAuth } from '../../application/hooks/useAuth';
import { useDocuments } from '../../application/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, HardDrive, Upload, FileText, Zap } from 'lucide-react';
import { formatBytes } from '../../shared/utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/constants';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { storageQuota, storageUsed, isLoadingDocuments } = useDocuments();

  const storagePercentage = storageQuota > 0 ? Math.round((storageUsed / storageQuota) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload and categorize your files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to={ROUTES.DOCUMENTS}>
                <Upload className="mr-2 h-4 w-4" />
                Go to Documents
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Browse Files
            </CardTitle>
            <CardDescription>
              View and manage your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTES.DOCUMENTS}>
                <FileText className="mr-2 h-4 w-4" />
                View Documents
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Categorization
            </CardTitle>
            <CardDescription>
              Smart document organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTES.DOCUMENTS}>
                <Zap className="mr-2 h-4 w-4" />
                Explore AI Features
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
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
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-sm">
                {user?.emailVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-orange-600">Pending Verification</span>
                )}
              </p>
            </div>
            {user?.createdAt && (
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
            )}
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
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        storagePercentage > 90 ? 'bg-destructive' :
                        storagePercentage > 75 ? 'bg-orange-500' :
                        'bg-primary'
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
    </div>
  );
};