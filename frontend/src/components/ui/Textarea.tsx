import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    const generatedId = useId();
    const textareaId = props.id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
    <div className="flex flex-col gap-1 w-full">
        {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold text-gruvbox-gray">
            {label}
        </label>
        )}
        <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`min-h-[120px] w-full resize-y rounded-xl border border-gruvbox-gray/25 bg-gruvbox-bg/55 px-3.5 py-3 text-gruvbox-fg transition-colors placeholder:text-gruvbox-gray/45 focus:border-gruvbox-primary focus:outline-none ${error ? 'border-gruvbox-error' : ''} ${className}`}
        {...props}
        />
        {error && <span id={errorId} className="text-xs text-gruvbox-error font-mono">{error}</span>}
    </div>
    );
}
