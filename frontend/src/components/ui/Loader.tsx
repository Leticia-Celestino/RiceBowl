export function Loader({ className = '' }: { className?: string }) {
    return (
    <div className={`flex items-center gap-2 text-gruvbox-primary font-mono text-sm ${className}`}>
        <span>loading</span>
        <span className="animate-pulse w-2 h-4 bg-gruvbox-primary inline-block"></span>
    </div>
    );
}