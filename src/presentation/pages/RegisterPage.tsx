import { RegisterForm } from '../forms/RegisterForm';
import { Logo } from '../components/Logo';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="xl" className="justify-center" />
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};
