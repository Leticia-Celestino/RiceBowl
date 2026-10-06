import { useState, useEffect } from 'react';
import { Search, Terminal, FileCode, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

const BASE_ACTIONS = [
    { id: 'upload', label: 'Executar upload_rice.sh', icon: Terminal, route: '/upload', color: 'text-gruvbox-primary' },
    { id: 'explore', label: 'Explorar dotfiles', icon: FileCode, route: '/explore', color: 'text-gruvbox-accent' },
];

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const user = useAuth(state => state.user);
    const actions = [
        ...BASE_ACTIONS,
        { id: 'profile', label: 'Acessar /home/user', icon: User, route: user ? `/profile/${user.nickname}` : '/login', color: 'text-gruvbox-blue' },
    ];

    const filteredActions = actions.filter(action =>
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
                setQuery('');
                setSelectedIndex(0); 
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);


    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter' && filteredActions.length > 0) {
            e.preventDefault();
            const action = filteredActions[selectedIndex];
            navigate(action.route);
            setIsOpen(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedIndex(0); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 animate-in fade-in duration-200">
            <div 
                className="absolute inset-0 bg-gruvbox-bg/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-2xl bg-gruvbox-bg border border-gruvbox-gray/30 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-4">
                
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gruvbox-gray/20">
                    <Search className="text-gruvbox-gray" size={20} />
                    <input
                        autoFocus
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-gruvbox-fg font-mono placeholder:text-gruvbox-gray/50"
                        placeholder="Buscar rices, distros, usuários ou rodar comandos..."
                        value={query}
                        onChange={handleSearchChange} 
                        onKeyDown={handleInputKeyDown}
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gruvbox-gray/10 rounded font-mono text-[10px] text-gruvbox-gray">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredActions.length === 0 ? (
                        <div className="p-4 text-center text-sm font-mono text-gruvbox-gray">
                            Nenhum comando encontrado para "{query}"
                        </div>
                    ) : (
                        <div className="px-2 pb-2">
                            <p className="text-[10px] font-mono text-gruvbox-gray uppercase mb-2 mt-2 px-2">Ações Rápidas</p>
                            
                            {filteredActions.map((action, index) => {
                                const Icon = action.icon;
                                const isSelected = index === selectedIndex;
                                
                                return (
                                    <button 
                                        key={action.id}
                                        onClick={() => { navigate(action.route); setIsOpen(false); }}
                                        onMouseEnter={() => setSelectedIndex(index)} 
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-mono text-sm text-left ${
                                            isSelected ? 'bg-gruvbox-gray/10 text-gruvbox-fg' : 'text-gruvbox-gray hover:text-gruvbox-fg hover:bg-gruvbox-gray/5'
                                        }`}
                                    >
                                        <Icon size={16} className={action.color} />
                                        <span>{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
