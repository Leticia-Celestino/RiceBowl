import React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    label: string;
}

export function Tag({ label, className = '', ...props }: TagProps) {
    return (
    <span
        className={`inline-flex items-center px-2 py-1 text-xs font-mono rounded bg-gruvbox-panel/50 text-gruvbox-gray border border-gruvbox-gray/20 hover:text-gruvbox-primary hover:border-gruvbox-primary/50 transition-colors cursor-pointer ${className}`}
        {...props}
    >
        #{label}
    </span>
    );
}