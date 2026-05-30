import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
    <div className="flex flex-col gap-1 w-full">
        {label && (
        <label className="text-xs font-mono text-gruvbox-gray uppercase tracking-wider">
            {label}
        </label>
        )}
        <input
        className={`w-full bg-gruvbox-bg/50 border border-gruvbox-gray/30 rounded-md px-3 py-2 text-gruvbox-fg font-sans focus:outline-none focus:border-gruvbox-primary focus:ring-1 focus:ring-gruvbox-primary transition-colors placeholder:text-gruvbox-gray/50 ${error ? 'border-gruvbox-error' : ''} ${className}`}
        {...props}
        />
        {error && <span className="text-xs text-gruvbox-error font-mono">{error}</span>}
    </div>
    );
}