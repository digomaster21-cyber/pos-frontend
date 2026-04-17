import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn(
        'border-b border-gray-200 px-4 py-3 font-semibold',
        className
      )}
      {...props}
    />
  );
};

export const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <div
      className={cn('px-4 py-4', className)}
      {...props}
    />
  );
};

export default Card;