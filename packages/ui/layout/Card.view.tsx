import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, clickable = false, onClick }: CardProps) {
  const baseClasses = 'bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-300' : '';
  const clickableClasses = clickable ? 'cursor-pointer hover:shadow-lg hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200' : '';
  
  const combinedClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`.trim();
  
  if (clickable && onClick) {
    return (
      <button className={combinedClasses} onClick={onClick}>
        {children}
      </button>
    );
  }
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'primary' | 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function CardHeader({ children, className = '', gradient }: CardHeaderProps) {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200',
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200',
    green: 'bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200',
    orange: 'bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200',
    red: 'bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200',
  };
  
  const gradientClass = gradient ? gradientClasses[gradient] : 'bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200';
  
  return (
    <div className={`px-4 sm:px-6 py-4 ${gradientClass} ${className}`}>
      {children}
    </div>
  );
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function CardBody({ children, className = '', padding = 'md' }: CardBodyProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };
  
  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}
