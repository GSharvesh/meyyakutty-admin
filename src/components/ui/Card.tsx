'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable = true,
  glow = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`glass-card ${hoverable ? 'glass-card-hover' : ''} ${glow ? 'glow-effect' : ''} p-5 md:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
