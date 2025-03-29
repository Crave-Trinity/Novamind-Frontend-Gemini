import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Card component
 * A flexible container component with optional title, description, and footer
 */
const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  description, 
  footer,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-background-card rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 ${className}`}>
      {(title || description) && (
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
          {title && <h3 className="text-lg font-medium text-neutral-900 dark:text-white">{title}</h3>}
          {description && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
