// src/pages/Home.tsx
import { useRices } from '../features/rices/useRices';
import { RiceCard } from '../components/ui/RiceCard';
import { Loader } from '../components/ui/Loader';
import { ServerCrash } from 'lucide-react';

export function Home() {
    // Aqui a mágica acontece: chamamos a API com 1 linha
    const { data: rices, isLoading, isError } = useRices();

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Cabeçalho da Página */}
            <div className="flex items-center gap-3 border-b border-gruvbox-gray/20 pb-4">
                <span className="text-gruvbox-primary font-mono text-xl">~ /</span>
                <h1 className="text-2xl font-mono font-bold text-gruvbox-fg">feed</h1>
            </div>

            {/* Tratamento de Estados */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader className="text-lg scale-150" />
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gruvbox-error">
                    <ServerCrash size={48} />
                    <p className="font-mono text-sm">Falha na conexão. O servidor Java pode estar dormindo.</p>
                </div>
            )}

            {/* O Grid Masonry com CSS Puro */}
            {!isLoading && !isError && rices?.length === 0 && (
                <div className="text-center py-20 font-mono text-gruvbox-gray">
                    O diretório está vazio. Seja a primeira a dar upload de um Rice!
                </div>
            )}

            {/* Usamos columns para fazer o efeito Pinterest/Masonry (quebra em 1, 2 ou 3 colunas dependendo da tela) */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                {rices?.map((rice) => (
                    <RiceCard key={rice.id} rice={rice} />
                ))}
            </div>

        </div>
    );
}