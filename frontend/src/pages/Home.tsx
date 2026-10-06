import { useState, useEffect } from 'react';
import { RiceModal } from '../features/rices/components/RiceModal';
import type { RiceDTO, PageResponse } from '../types/rice';
import { api } from '../config/api';
import { PageState } from '../components/ui/PageState';
import { RiceFilters } from '../features/rices/components/RiceFilters';
import { RiceGrid } from '../features/rices/components/RiceGrid';

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

        const delayDebounceFn = setTimeout(() => {
            void fetchRices();
        }, 300);

        return () => {
            clearTimeout(delayDebounceFn);
            controller.abort();
        };
    }, [search, distroFilter, wmFilter, page]);

    const updateSearch = (value: string) => {
        setPage(0);
        setSearch(value);
    };

    return (
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 px-5 py-8 sm:px-10 sm:py-12">
            <header className="max-w-4xl py-5 sm:py-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gruvbox-primary">Galeria da comunidade</p>
                <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-gruvbox-fg sm:text-6xl">
                    Desktops Linux que valem a pena estudar.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-gruvbox-gray sm:text-lg">
                    Explore escolhas visuais, ferramentas e dotfiles compartilhados por quem gosta de construir o próprio ambiente.
                </p>
            </header>

            <RiceFilters
                search={search}
                distro={distroFilter}
                windowManager={wmFilter}
                onSearchChange={updateSearch}
                onDistroChange={(value) => { setPage(0); setDistroFilter(value); }}
                onWindowManagerChange={(value) => { setPage(0); setWmFilter(value); }}
            />

            {isLoading ? (
                <PageState loading>Carregando rices...</PageState>
            ) : error ? (
                <PageState tone="error">{error}</PageState>
            ) : rices.length === 0 ? (
                <PageState>Nenhum setup encontrado para estes filtros.</PageState>
            ) : (
                <RiceGrid rices={rices} onSelect={setSelectedRice} />
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
