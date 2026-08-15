import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md 
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;