import { useEffect, useState } from 'react';
import { ArrowRight, Compass, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RiceModal } from '../features/rices/components/RiceModal';
import { RiceGrid } from '../features/rices/components/RiceGrid';
import { PageState } from '../components/ui/PageState';
import { api } from '../config/api';
import type { PageResponse, RiceDTO } from '../types/rice';

export function Home() {
    const [rices, setRices] = useState<RiceDTO[]>([]);
    const [selectedRice, setSelectedRice] = useState<RiceDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        api.get<PageResponse<RiceDTO>>('/rices?page=0', { signal: controller.signal })
            .then(response => setRices(response.data.content.slice(0, 6)))
            .catch(requestError => { if ((requestError as Error).name !== 'CanceledError') setError('Não foi possível carregar os destaques.'); })
            .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
        return () => controller.abort();
    }, []);

    return (
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-12 px-5 py-8 sm:px-10 sm:py-12">
            <section className="relative overflow-hidden rounded-[2rem] border border-gruvbox-primary/20 bg-gruvbox-panel/55 p-7 shadow-[0_30px_100px_rgb(0_0_0_/_0.2)] sm:p-12">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gruvbox-primary/10 blur-3xl" />
                <div className="relative max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-gruvbox-primary/25 bg-gruvbox-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-gruvbox-primary"><Sparkles size={13} /> Comunidade Linux</span>
                    <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-gruvbox-fg sm:text-7xl">Seu desktop é uma história. <span className="text-gruvbox-primary">Compartilhe a montagem.</span></h1>
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-gruvbox-gray sm:text-lg">RiceBowl é o lugar para descobrir setups, aprender com dotfiles e guardar as escolhas que fazem seu ambiente ser seu.</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/explore" className="inline-flex items-center gap-2 rounded-xl bg-gruvbox-primary px-5 py-3 text-sm font-semibold text-gruvbox-bg transition-transform hover:-translate-y-0.5">Explorar setups <ArrowRight size={17} /></Link>
                        <Link to="/upload" className="inline-flex items-center gap-2 rounded-xl border border-gruvbox-gray/25 px-5 py-3 text-sm font-semibold text-gruvbox-fg hover:bg-gruvbox-gray/10"><Plus size={17} /> Publicar o meu</Link>
                    </div>
                </div>
            </section>
            <section className="space-y-5" aria-labelledby="recentes-title">
                <div className="flex items-end justify-between gap-4">
                    <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gruvbox-accent">Agora na comunidade</p><h2 id="recentes-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-gruvbox-fg">Publicações recentes</h2></div>
                    <Link to="/explore" className="hidden items-center gap-2 text-sm text-gruvbox-primary hover:underline sm:inline-flex">Ver tudo <Compass size={16} /></Link>
                </div>
                {isLoading ? <PageState loading>Carregando destaques...</PageState> : error ? <PageState tone="error">{error}</PageState> : rices.length ? <RiceGrid rices={rices} onSelect={setSelectedRice} /> : <PageState>A comunidade ainda está preparando os primeiros setups.</PageState>}
            </section>
            {selectedRice && <RiceModal rice={selectedRice} onClose={() => setSelectedRice(null)} />}
        </div>
    );
}
