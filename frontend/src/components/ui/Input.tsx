import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
    <div className="flex flex-col gap-1 w-full">
        {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-gruvbox-gray">
            {label}
        </label>
        )}
        <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-xl border border-gruvbox-gray/25 bg-gruvbox-bg/55 px-3.5 py-3 text-gruvbox-fg transition-colors placeholder:text-gruvbox-gray/45 focus:border-gruvbox-primary focus:outline-none ${error ? 'border-gruvbox-error' : ''} ${className}`}
        {...props}
        />
        {error && <span id={errorId} className="text-xs text-gruvbox-error font-mono">{error}</span>}
    </div>
    );
}
