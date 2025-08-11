import React from 'react';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  helpText,
  fullWidth = false,
  className = ''
}: InputProps) {
  const inputClasses = `
    block px-3 py-2 border rounded-lg text-sm placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
    transition-colors duration-200
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
    </div>
  );
}

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
  className?: string;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  required = false,
  disabled = false,
  error,
  helpText,
  fullWidth = false,
  className = ''
}: TextareaProps) {
  const textareaClasses = `
    block px-3 py-2 border rounded-lg text-sm placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
    transition-colors duration-200 resize-vertical
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={textareaClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  fullWidth?: boolean;
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  fullWidth = false,
  className = ''
}: SelectProps) {
  const selectClasses = `
    block px-3 py-2 border rounded-lg text-sm bg-white
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
    transition-colors duration-200
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className={selectClasses}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
    </div>
  );
}
