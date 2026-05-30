import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
    <div className="flex flex-col gap-1 w-full">
        {label && (
        <label className="text-xs font-mono text-gruvbox-gray uppercase tracking-wider">
            {label}
        </label>
        )}
        <textarea
        className={`w-full min-h-[100px] bg-gruvbox-bg/50 border border-gruvbox-gray/30 rounded-md px-3 py-2 text-gruvbox-fg font-sans focus:outline-none focus:border-gruvbox-primary focus:ring-1 focus:ring-gruvbox-primary transition-colors placeholder:text-gruvbox-gray/50 resize-y ${error ? 'border-gruvbox-error' : ''} ${className}`}
        {...props}
        />
        {error && <span className="text-xs text-gruvbox-error font-mono">{error}</span>}
    </div>
    );
}