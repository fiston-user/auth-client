import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { useAuth } from '../../application/hooks/useAuth';
import { emailVerificationSchema, type EmailVerificationFormData } from '../../shared/validators';
import { ROUTES } from '../../shared/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const VerifyEmailPage: React.FC = () => {
  const { user, verifyEmail, resendVerification, isVerifyingEmail, isResendingVerification } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const onSubmit = (data: EmailVerificationFormData) => {
    verifyEmail(data);
  };

  const handleResendVerification = () => {
    if (user?.email) {
      resendVerification(user.email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification code to your email address. Please enter it below to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                disabled={isVerifyingEmail}
                readOnly
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...register('code')}
                disabled={isVerifyingEmail}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isVerifyingEmail}
            >
              {isVerifyingEmail ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                  Verifying...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>

            <div className="space-y-4">
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification || !user?.email}
                  className="text-sm"
                >
                  {isResendingVerification ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-b-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3 w-3" />
                      Resend verification code
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm">
                <Link 
                  to={ROUTES.LOGIN} 
                  className="text-primary hover:underline font-medium"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};