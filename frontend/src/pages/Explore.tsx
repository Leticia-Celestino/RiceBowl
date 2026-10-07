import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { RiceModal } from '../features/rices/components/RiceModal';
import type { RiceDTO, PageResponse } from '../types/rice';
import { api } from '../config/api';
import { PageState } from '../components/ui/PageState';
import { PageHeader } from '../components/ui/PageHeader';
import { RiceFilters } from '../features/rices/components/RiceFilters';
import { RiceGrid } from '../features/rices/components/RiceGrid';

export function Explore() {
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
                const params = new URLSearchParams({ page: String(page) });
                if (search.trim()) params.set('search', search.trim());
                if (distroFilter) params.set('distro', distroFilter);
                if (wmFilter) params.set('windowManager', wmFilter);
                setIsLoading(true);
                setError('');
                const response = await api.get<PageResponse<RiceDTO>>(`/rices?${params}`, { signal: controller.signal });
                setRices(current => page === 0 ? response.data.content : [...current, ...response.data.content.filter(item => !current.some(existing => existing.id === item.id))]);
                setTotalPages(response.data.totalPages);
            } catch (requestError) {
                if ((requestError as Error).name !== 'CanceledError') setError('Não foi possível carregar a exploração agora.');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };
        const timer = window.setTimeout(() => void fetchRices(), 250);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [search, distroFilter, wmFilter, page]);

    return (
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7 px-5 py-8 sm:px-10 sm:py-12">
            <PageHeader icon={<Compass size={24} />} title="Explorar" description="Encontre desktops, ferramentas e dotfiles compartilhados pela comunidade." />
            <RiceFilters search={search} distro={distroFilter} windowManager={wmFilter} onSearchChange={value => { setPage(0); setSearch(value); }} onDistroChange={value => { setPage(0); setDistroFilter(value); }} onWindowManagerChange={value => { setPage(0); setWmFilter(value); }} />
            {isLoading ? <PageState loading>Carregando rices...</PageState> : error ? <PageState tone="error">{error}</PageState> : rices.length === 0 ? <PageState>Nenhum setup encontrado para estes filtros.</PageState> : <RiceGrid rices={rices} onSelect={setSelectedRice} />}
            {!isLoading && !error && page + 1 < totalPages && <button type="button" onClick={() => setPage(current => current + 1)} className="self-center rounded-xl border border-gruvbox-primary/40 px-5 py-2 font-mono text-sm text-gruvbox-primary hover:bg-gruvbox-primary/10">Carregar mais</button>}
            {selectedRice && <RiceModal rice={selectedRice} onClose={() => setSelectedRice(null)} />}
        </div>
    );
}
