/* eslint-disable */
import React from 'react';

interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Optional card title */
  title?: string;
  /** Optional CSS class names */
  className?: string;
  /** Optional onClick handler */
  onClick?: () => void;
}

/**
 * Card Component
 * Container with consistent styling and elevation
 */
const Card: React.FC<CardProps> = ({ children, title, className = '', onClick }) => {
  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 ${className}`}
      onClick={onClick}
    >
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
