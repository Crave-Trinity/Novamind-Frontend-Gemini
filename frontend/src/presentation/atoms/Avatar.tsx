import React from 'react';
import { cn } from '@/application/utils/cn'; // Assuming utility exists

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback: string; // Typically initials
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback,
  alt = 'User avatar',
  className,
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);

  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
        className
      )}
      {...props}
    >
      {showFallback ? (
        <span className="font-medium text-sm">{fallback}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default Avatar;