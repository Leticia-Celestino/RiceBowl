// src/components/ui/RiceCard.tsx
import { useState } from 'react';
import { Monitor, ArrowBigUp, ArrowBigDown, MessageSquare } from 'lucide-react';
import type { RiceDTO } from '../../../types/rice';
import { api } from '../../../config/api';

interface RiceCardProps {
    rice: RiceDTO;
}

export function RiceCard({ rice }: RiceCardProps) {
    // Estados locais para a animação do Karma (UI Otimista)
    const [karma, setKarma] = useState(rice.karma);
    const [userVote, setUserVote] = useState<number>(0); // 1 (Up), -1 (Down) ou 0 (Nenhum)

    // Função para disparar o voto para a API
    const handleVote = async (e: React.MouseEvent, value: number) => {
        e.stopPropagation(); // Impede que clicar na seta abra o Modal do post!
        
        // Lógica visual instantânea (UX)
        const previousKarma = karma;
        const previousVote = userVote;

        if (userVote === value) {
            setKarma(prev => prev - value); // Remove o voto
            setUserVote(0);
        } else {
            setKarma(prev => prev - userVote + value); // Troca ou adiciona o voto
            setUserVote(value);
        }

        // Chamada real para a API no Back-end
        try {
            const response = await api.post<number>(`/rices/${rice.id}/vote?value=${value}`);
            setKarma(response.data);
        } catch (error) {
            console.error("Falha ao computar o voto", error);
            setKarma(previousKarma);
            setUserVote(previousVote);
        }
    };

    return (
        <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gruvbox-gray/15 bg-gruvbox-panel/55 transition-all duration-300 hover:-translate-y-1 hover:border-gruvbox-primary/35 hover:shadow-[0_24px_60px_rgb(0_0_0_/_0.28)]">
            
            {/* Imagem de Capa */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gruvbox-bg/50">
                <img 
                    src={rice.coverUrl || '/favicon.svg'} 
                    alt={rice.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = '/favicon.svg'; }}
                />
            </div>

            {/* Corpo do Card */}
            <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-semibold leading-tight tracking-[-0.025em] text-gruvbox-fg">
                        {rice.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-gruvbox-accent/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-gruvbox-accent">
                        <Monitor size={12} />
                        {rice.windowManager}
                    </div>
                </div>
                <p className="text-xs text-gruvbox-gray">por <span className="font-mono">@{rice.authorNickname}</span></p>

                {/* RODAPÉ SOCIAL (Reddit Style) */}
                <div className="mt-auto flex items-center justify-between border-t border-gruvbox-gray/10 pt-4">
                    
                    {/* Controles de Karma */}
                    <div className="flex items-center gap-1 bg-gruvbox-gray/5 rounded-full px-1">
                        <button 
                            type="button"
                            aria-label="Dar upvote"
                            onClick={(e) => handleVote(e, 1)}
                            className={`p-1 rounded-full transition-colors ${userVote === 1 ? 'text-gruvbox-primary bg-gruvbox-primary/20' : 'text-gruvbox-gray hover:text-gruvbox-primary hover:bg-gruvbox-gray/10'}`}
                        >
                            <ArrowBigUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
                        </button>
                        
                        <span className={`text-sm font-bold font-mono min-w-[1.5rem] text-center ${userVote === 1 ? 'text-gruvbox-primary' : userVote === -1 ? 'text-gruvbox-blue' : 'text-gruvbox-fg'}`}>
                            {karma}
                        </span>

                        <button 
                            type="button"
                            aria-label="Dar downvote"
                            onClick={(e) => handleVote(e, -1)}
                            className={`p-1 rounded-full transition-colors ${userVote === -1 ? 'text-gruvbox-blue bg-gruvbox-blue/20' : 'text-gruvbox-gray hover:text-gruvbox-blue hover:bg-gruvbox-gray/10'}`}
                        >
                            <ArrowBigDown size={20} className={userVote === -1 ? 'fill-current' : ''} />
                        </button>
                    </div>

                    {/* Contador de Comentários */}
                    <div className="flex items-center gap-2 text-gruvbox-gray text-sm font-mono hover:text-gruvbox-fg transition-colors">
                        <MessageSquare size={16} />
                        <span>{rice.commentCount ?? rice.comments?.length ?? 0}</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
