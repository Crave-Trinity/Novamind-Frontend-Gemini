import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * Header component for page headers
 * Displays a title, optional subtitle, and optional action buttons
 */
const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-6 flex flex-col justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-4 flex items-center md:mt-0">{actions}</div>
      )}
    </div>
  );
};

export default Header;
