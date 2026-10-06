import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { RiceCard } from '../components/ui/RiceCard';
import { RiceModal } from '../components/ui/RiceModal';
import type { RiceDTO, PageResponse } from '../types/rice';
import { api } from '../config/api';

export function Home() {
    const [rices, setRices] = useState<RiceDTO[]>([]);
    const [selectedRice, setSelectedRice] = useState<RiceDTO | null>(null);
    
    const [search, setSearch] = useState('');
    const [distroFilter, setDistroFilter] = useState('');
    const [wmFilter, setWmFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        const fetchRices = async () => {
            try {
                const params = new URLSearchParams();
                
                if (search.trim()) params.append('search', search.trim());
                if (distroFilter.trim()) params.append('distro', distroFilter.trim());
                if (wmFilter.trim()) params.append('windowManager', wmFilter.trim());
                params.append('page', String(page));

                setIsLoading(true);
                setError('');
                const response = await api.get<PageResponse<RiceDTO>>(`/rices?${params.toString()}`, {
                    signal: controller.signal,
                });
                setRices(current => page === 0
                    ? response.data.content
                    : [...current, ...response.data.content.filter(item => !current.some(existing => existing.id === item.id))]);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                if ((error as Error).name !== 'CanceledError') {
                    console.error("Erro de conexão ao buscar setups:", error);
                    setError('Não foi possível carregar o feed. Tente novamente em instantes.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        // DEBOUNCE: Aguarda 300ms sem o usuário digitar para finalmente fazer a chamada na API
        const delayDebounceFn = setTimeout(() => {
            void fetchRices();
        }, 300);

        return () => {
            clearTimeout(delayDebounceFn); // Cancela o timer se o usuário digitar algo novo
            controller.abort(); // Cancela a requisição fantasma
        };
    }, [search, distroFilter, wmFilter, page]);

    const updateSearch = (value: string) => {
        setPage(0);
        setSearch(value);
    };

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full relative">
            
            <div className="bg-gruvbox-bg/50 backdrop-blur-md border border-gruvbox-gray/20 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center sticky top-0 z-10 shadow-md">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray" size={18} />
                    <input 
                        type="text" 
                        placeholder="Busque por título ou descrição..." 
                        value={search}
                        onChange={(e) => updateSearch(e.target.value)}
                        className="w-full bg-gruvbox-bg border border-gruvbox-gray/30 rounded-md pl-10 pr-4 py-2 text-sm text-gruvbox-fg focus:outline-none focus:border-gruvbox-primary transition-colors font-sans"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray" size={16} />
                        <select 
                            value={distroFilter}
                            onChange={(e) => { setPage(0); setDistroFilter(e.target.value); }}
                            className="w-full appearance-none bg-gruvbox-bg border border-gruvbox-gray/30 rounded-md pl-9 pr-8 py-2 text-sm text-gruvbox-fg focus:outline-none focus:border-gruvbox-primary transition-colors font-sans cursor-pointer"
                        >
                            <option value="">Qualquer Distro</option>
                            <option value="Arch Linux">Arch Linux</option>
                            <option value="Ubuntu">Ubuntu</option>
                            <option value="Fedora">Fedora</option>
                            <option value="Debian">Debian</option>
                            <option value="Zorin">Zorin OS</option>
                        </select>
                    </div>

                    <div className="relative flex-grow md:flex-grow-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray" size={16} />
                        <select 
                            value={wmFilter}
                            onChange={(e) => { setPage(0); setWmFilter(e.target.value); }}
                            className="w-full appearance-none bg-gruvbox-bg border border-gruvbox-gray/30 rounded-md pl-9 pr-8 py-2 text-sm text-gruvbox-fg focus:outline-none focus:border-gruvbox-primary transition-colors font-sans cursor-pointer"
                        >
                            <option value="">Qualquer WM/DE</option>
                            <option value="Hyprland">Hyprland</option>
                            <option value="i3wm">i3wm</option>
                            <option value="GNOME">GNOME</option>
                            <option value="KDE Plasma">KDE Plasma</option>
                            <option value="bspwm">bspwm</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gruvbox-gray font-mono animate-pulse">Carregando rices...</div>
            ) : error ? (
                <div role="alert" className="text-center py-20 text-gruvbox-error font-mono">{error}</div>
            ) : rices.length === 0 ? (
                <div className="text-center py-20 text-gruvbox-gray font-mono">
                    Nenhum setup encontrado para estes filtros.
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {rices.map((rice) => (
                        // AVISO CSS: O break-inside-avoid impede o card de ser rasgado ao meio nas colunas
                        <div 
                            key={rice.id} 
                            onClick={() => setSelectedRice(rice)}
                            className="break-inside-avoid cursor-pointer hover:opacity-95 transition-opacity"
                        >
                            <RiceCard rice={rice} />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !error && page + 1 < totalPages && (
                <button
                    type="button"
                    onClick={() => setPage(current => current + 1)}
                    className="self-center px-5 py-2 rounded-md border border-gruvbox-primary/40 text-gruvbox-primary font-mono hover:bg-gruvbox-primary/10"
                >
                    Carregar mais
                </button>
            )}

            {selectedRice && (
                <RiceModal rice={selectedRice} onClose={() => setSelectedRice(null)} />
            )}
            
        </div>
    );
}
