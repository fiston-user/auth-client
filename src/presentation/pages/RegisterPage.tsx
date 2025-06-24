import { RegisterForm } from '../forms/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
};