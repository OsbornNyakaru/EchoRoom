import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`rounded-lg shadow-md bg-white ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export { Card }; 