import { LoginForm } from '../forms/LoginForm';
import { Logo } from '../components/Logo';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="xl" className="justify-center" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
};