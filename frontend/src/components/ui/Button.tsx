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

    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
    primary: "bg-gruvbox-primary text-gruvbox-bg shadow-[0_8px_30px_rgb(244_122_60_/_0.15)] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
    ghost: "bg-transparent text-gruvbox-fg hover:bg-gruvbox-gray/10",
    danger: "bg-gruvbox-error/15 text-gruvbox-error hover:bg-gruvbox-error hover:text-gruvbox-bg"
    };

    return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {icon}
        {children}
    </button>
    );
}
