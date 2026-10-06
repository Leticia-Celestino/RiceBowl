import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function GlassPanel({ children, className = '', ...props }: GlassPanelProps) {
    return (
    <div
        className={`rounded-2xl border border-gruvbox-gray/15 bg-gruvbox-panel/70 shadow-[0_24px_70px_rgb(0_0_0_/_0.22)] backdrop-blur-xl ${className}`}
        {...props}
    >
        {children}
    </div>
    );
}
