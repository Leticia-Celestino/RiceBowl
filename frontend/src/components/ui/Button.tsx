import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'danger';
    icon?: React.ReactNode;
}

export function Button({ 
    children, 
    variant = 'primary', 
    icon, 
    className = '', 
    ...props 
}: ButtonProps) {

    const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-sm font-medium transition-all duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
    primary: "bg-gruvbox-primary text-gruvbox-bg hover:bg-orange-500 active:scale-95",
    ghost: "bg-transparent text-gruvbox-fg hover:bg-gruvbox-gray/10 active:scale-95",
    danger: "bg-gruvbox-error/20 text-gruvbox-error hover:bg-gruvbox-error hover:text-gruvbox-bg active:scale-95"
    };

    return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {icon}
        {children}
    </button>
    );
}