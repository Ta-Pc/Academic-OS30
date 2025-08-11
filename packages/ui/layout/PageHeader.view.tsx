import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeaderView({ title, subtitle, icon, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl shadow-sm mb-8">
      <div className="px-4 sm:px-6 py-6">
        {breadcrumbs && (
          <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>›</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-slate-900 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-900 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="p-3 bg-primary-100 rounded-xl">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-slate-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
