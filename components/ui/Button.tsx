
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    className = '', 
    ...props 
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-bold rounded-2xl md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.97]';

    const variantClasses = {
        primary: 'text-white bg-gradient-to-br from-brand-primary to-brand-secondary hover:brightness-110 focus:ring-brand-primary shadow-lg shadow-brand-primary/10',
        secondary: 'text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 focus:ring-brand-primary',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    };

    const sizeClasses = {
        sm: 'px-4 py-3 md:px-3 md:py-1.5 text-xs min-h-[44px] md:min-h-0',
        md: 'px-6 py-4 md:px-4 md:py-2 text-sm min-h-[48px] md:min-h-0',
        lg: 'px-8 py-5 md:px-6 md:py-3 text-base min-h-[56px] md:min-h-0',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    PROZESSIERUNG...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
