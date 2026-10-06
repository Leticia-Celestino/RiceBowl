import type { ReactNode } from 'react';

interface PageHeaderProps {
    icon?: ReactNode;
    title: string;
    description?: string;
}

export function PageHeader({ icon, title, description }: PageHeaderProps) {
    return (
        <header className="flex items-start gap-4 border-b border-gruvbox-gray/15 pb-6">
            {icon && <span className="mt-0.5 text-gruvbox-primary">{icon}</span>}
            <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-gruvbox-fg">{title}</h1>
                {description && <p className="mt-2 text-sm leading-relaxed text-gruvbox-gray">{description}</p>}
            </div>
        </header>
    );
}
