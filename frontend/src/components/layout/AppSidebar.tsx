import { Compass, Home, LogOut, Plus, Search, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { Avatar } from '../ui/Avatar';
import { BrandLogo } from '../ui/BrandLogo';

const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explorar', path: '/explore' },
    { icon: Plus, label: 'Publicar', path: '/upload' },
];

export function AppSidebar() {
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <aside className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-between rounded-2xl border border-gruvbox-gray/15 bg-gruvbox-panel/90 px-3 shadow-2xl backdrop-blur-xl sm:inset-y-0 sm:left-0 sm:right-auto sm:h-auto sm:w-64 sm:flex-col sm:items-stretch sm:rounded-none sm:border-y-0 sm:border-l-0 sm:px-0 sm:py-7 sm:shadow-none">
            <Link to="/" className="hidden px-6 sm:flex" aria-label="RiceBowl — início">
                <BrandLogo className="text-gruvbox-primary" />
            </Link>

            <nav aria-label="Navegação principal" className="flex flex-1 items-center justify-around sm:mt-12 sm:block sm:space-y-2 sm:px-4">
                {navItems.map(({ icon: Icon, label, path }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            aria-current={isActive ? 'page' : undefined}
                            className={`group flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors sm:min-w-0 sm:flex-row sm:gap-3 sm:py-3 ${
                                isActive
                                    ? 'bg-gruvbox-primary/10 text-gruvbox-primary'
                                    : 'text-gruvbox-gray hover:bg-gruvbox-gray/10 hover:text-gruvbox-fg'
                            }`}
                        >
                            <Icon size={20} aria-hidden="true" />
                            <span className="text-[10px] font-medium sm:text-sm">{label}</span>
                        </Link>
                    );
                })}
                <button
                    type="button"
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', metaKey: true }))}
                    className="group flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-gruvbox-gray transition-colors hover:bg-gruvbox-gray/10 hover:text-gruvbox-fg sm:min-w-0 sm:flex-row sm:gap-3 sm:py-3"
                    aria-label="Abrir busca (Super + Espaço)"
                >
                    <Search size={20} aria-hidden="true" />
                    <span className="text-[10px] font-medium sm:text-sm">Buscar</span>
                </button>
            </nav>

            <div className="sm:mt-auto sm:px-4">
                {isAuthenticated && user ? (
                    <div className="group flex items-center justify-between rounded-xl px-2 py-2 transition-colors hover:bg-gruvbox-gray/10 sm:w-full sm:px-3 sm:py-3">
                        <Link to={`/profile/${user.nickname}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                            <Avatar alt={user.nickname} size="sm" />
                            <div className="hidden min-w-0 flex-col text-left sm:flex">
                                <span className="truncate text-sm font-medium text-gruvbox-fg">@{user.nickname}</span>
                                <span className="font-mono text-[9px] uppercase tracking-wider text-gruvbox-accent">online</span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => void logout()}
                            className="ml-2 p-2 text-gruvbox-gray transition-colors hover:text-gruvbox-red"
                            aria-label="Sair da conta"
                        >
                            <LogOut size={16} aria-hidden="true" />
                        </button>
                        <Link
                            to="/settings/security"
                            className="ml-1 hidden p-2 text-gruvbox-gray transition-colors hover:text-gruvbox-primary sm:block"
                            aria-label="Segurança da conta"
                        >
                            <Settings size={16} aria-hidden="true" />
                        </Link>
                    </div>
                ) : (
                    <Link to="/login" className="flex items-center gap-3 rounded-lg px-3 py-3 text-gruvbox-gray transition-colors hover:bg-gruvbox-primary/10 hover:text-gruvbox-primary">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-gruvbox-gray font-mono text-xs">?</span>
                        <span className="hidden text-sm sm:block">Fazer login</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
