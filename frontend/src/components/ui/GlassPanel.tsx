import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function GlassPanel({ children, className = '', ...props }: GlassPanelProps) {
    return (
    <div
        className={`bg-gruvbox-panel/40 backdrop-blur-md border border-gruvbox-gray/20 rounded-xl shadow-lg ${className}`}
        {...props}
    >
        {children}
    </div>
    );
}