import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, SquareTerminal, Hash } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../features/auth/useAuth';
import { LogOut } from 'lucide-react';

export function MainLayout() {
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/' },
    { icon: <Hash size={20} />, label: 'Explorar', path: '/explore' },
    { icon: <SquareTerminal size={20} />, label: 'Upload', path: '/upload' },
    ]

    return (
    <div className="flex min-h-screen bg-gruvbox-bg">
      {/* Sidebar Lateral */}
        <aside className="w-16 sm:w-64 fixed inset-y-0 left-0 bg-gruvbox-panel/30 backdrop-blur-md border-r border-gruvbox-gray/20 flex flex-col justify-between py-6 transition-all duration-300 z-10">
        {/* Logo */}
        <div className="px-4 sm:px-6 flex items-center justify-center sm:justify-start gap-3 mb-10">
            <span className="text-gruvbox-primary font-mono text-xl font-bold">{`{ R }`}</span>
            <span className="hidden sm:block font-sans font-bold text-lg tracking-wide">
            RiceBowl
            </span>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-2 sm:px-4 space-y-2">
            {navItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
                <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${
                    isActive
                    ? 'bg-gruvbox-primary/10 text-gruvbox-primary'
                    : 'text-gruvbox-gray hover:bg-gruvbox-gray/10 hover:text-gruvbox-fg'
                }`}
                >
                <span
                    className={`${
                    isActive
                        ? 'text-gruvbox-primary'
                        : 'group-hover:text-gruvbox-fg'
                    }`}
                >
                    {item.icon}
                </span>
                <span className="hidden sm:block font-mono text-sm">
                    {item.label}
                </span>
                </Link>
            )
            })}
        </nav>

        {/* Perfil no Rodapé */}
        <div className="px-2 sm:px-4 mt-auto">
            {isAuthenticated ? (
            <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gruvbox-gray/10 transition-colors group cursor-pointer text-left"
                onClick={logout}
            >
                <div className="flex items-center gap-3">
                <Avatar alt={user?.nickname || 'User'} size="sm" />
                <div className="hidden sm:flex flex-col">
                    <span className="font-mono text-xs text-gruvbox-fg">@{user?.nickname}</span>
                    <span className="text-[10px] text-gruvbox-accent uppercase tracking-wider">Online</span>
                </div>
                </div>
                <span title="Sair">
                    <LogOut
                    size={16}
                    className="text-gruvbox-gray hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                </span>
            </button>
            ) : (
            <Link to="/login" className="flex items-center gap-3 px-3 py-3 rounded-lg text-gruvbox-gray hover:bg-gruvbox-primary/10 hover:text-gruvbox-primary transition-colors">
                <div className="w-8 h-8 rounded-full border border-dashed border-gruvbox-gray flex items-center justify-center shrink-0">
                <span className="font-mono text-xs">?</span>
                </div>
                <span className="hidden sm:block font-mono text-sm">Fazer Login</span>
            </Link>
            )}
        </div>
        </aside>

      {/* Área Principal Dinâmica */}
        <main className="flex-1 ml-16 sm:ml-64 p-6 sm:p-10">
        <Outlet />
        </main>
    </div>
    )
}