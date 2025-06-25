import { forwardRef } from 'react';
import { cn } from '@/shared/utils';
import logoImage from '@/assets/logo.png';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'icon-only';
  showText?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    { className, size = 'md', variant = 'default', showText = true, ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-6',
      md: 'h-8',
      lg: 'h-12',
      xl: 'h-16',
    };

    const textSizeClasses = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <img
          src={logoImage}
          alt="SecureDocs"
          className={cn('object-contain', sizeClasses[size])}
        />
        {variant === 'default' && showText && (
          <span
            className={cn(
              'font-bold text-slate-900 dark:text-slate-100 font-inter tracking-tight',
              textSizeClasses[size]
            )}
          >
            securedocs
          </span>
        )}
      </div>
    );
  }
);

Logo.displayName = 'Logo';

export { Logo };
