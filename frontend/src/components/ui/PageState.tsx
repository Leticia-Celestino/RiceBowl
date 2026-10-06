interface PageStateProps {
    children: string;
    tone?: 'muted' | 'error';
    loading?: boolean;
}

export function PageState({ children, tone = 'muted', loading = false }: PageStateProps) {
    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className={`py-20 text-center font-mono ${
                tone === 'error' ? 'text-gruvbox-error' : 'text-gruvbox-gray'
            } ${loading ? 'animate-pulse' : ''}`}
        >
            {children}
        </div>
    );
}
