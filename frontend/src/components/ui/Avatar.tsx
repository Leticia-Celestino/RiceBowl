interface AvatarProps {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
    const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    };

    const fallback = alt.charAt(0).toUpperCase();

    return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden bg-gruvbox-panel border border-gruvbox-gray/30 rounded-full shrink-0 ${sizes[size]} ${className}`}>
        {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
        <span className="font-mono text-gruvbox-fg">{fallback}</span>
        )}
    </div>
    );
}