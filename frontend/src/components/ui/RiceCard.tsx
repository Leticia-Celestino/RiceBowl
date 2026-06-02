// src/components/ui/RiceCard.tsx
import { useState } from 'react';
import { Monitor, ArrowBigUp, ArrowBigDown, MessageSquare } from 'lucide-react';
import type { RiceDTO } from '../../types/rice';

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
        if (userVote === value) {
            setKarma(prev => prev - value); // Remove o voto
            setUserVote(0);
        } else {
            setKarma(prev => prev - userVote + value); // Troca ou adiciona o voto
            setUserVote(value);
        }

        // Chamada real para a API no Back-end
        try {
            const token = localStorage.getItem('token'); // Ajuste conforme você guarda o seu token!
            await fetch(`http://localhost:8080/rices/${rice.id}/vote?value=${value}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Falha ao computar o voto", error);
            // Se falhar, nós poderíamos reverter o estado aqui para garantir a integridade
        }
    };

    return (
        <div className="group relative bg-gruvbox-bg border border-gruvbox-gray/20 rounded-lg overflow-hidden hover:border-gruvbox-primary/50 transition-all duration-300 cursor-pointer break-inside-avoid mb-6 flex flex-col">
            
            {/* Imagem de Capa */}
            <div className="relative w-full overflow-hidden bg-gruvbox-bg/50">
                <img 
                    src={rice.coverUrl || '/no_cover.png'} 
                    alt={rice.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
            </div>

            {/* Corpo do Card */}
            <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-gruvbox-fg font-bold text-lg font-sans leading-tight">
                        {rice.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-gruvbox-accent bg-gruvbox-accent/10 px-2 py-1 rounded">
                        <Monitor size={12} />
                        {rice.windowManager}
                    </div>
                </div>
                <p className="text-sm font-mono text-gruvbox-gray">@{rice.authorNickname}</p>

                {/* RODAPÉ SOCIAL (Reddit Style) */}
                <div className="mt-2 pt-3 border-t border-gruvbox-gray/10 flex items-center justify-between">
                    
                    {/* Controles de Karma */}
                    <div className="flex items-center gap-1 bg-gruvbox-gray/5 rounded-full px-1">
                        <button 
                            onClick={(e) => handleVote(e, 1)}
                            className={`p-1 rounded-full transition-colors ${userVote === 1 ? 'text-gruvbox-primary bg-gruvbox-primary/20' : 'text-gruvbox-gray hover:text-gruvbox-primary hover:bg-gruvbox-gray/10'}`}
                        >
                            <ArrowBigUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
                        </button>
                        
                        <span className={`text-sm font-bold font-mono min-w-[1.5rem] text-center ${userVote === 1 ? 'text-gruvbox-primary' : userVote === -1 ? 'text-gruvbox-blue' : 'text-gruvbox-fg'}`}>
                            {karma}
                        </span>

                        <button 
                            onClick={(e) => handleVote(e, -1)}
                            className={`p-1 rounded-full transition-colors ${userVote === -1 ? 'text-gruvbox-blue bg-gruvbox-blue/20' : 'text-gruvbox-gray hover:text-gruvbox-blue hover:bg-gruvbox-gray/10'}`}
                        >
                            <ArrowBigDown size={20} className={userVote === -1 ? 'fill-current' : ''} />
                        </button>
                    </div>

                    {/* Contador de Comentários */}
                    <div className="flex items-center gap-2 text-gruvbox-gray text-sm font-mono hover:text-gruvbox-fg transition-colors">
                        <MessageSquare size={16} />
                        <span>{rice.comments?.length || 0}</span>
                    </div>

                </div>
            </div>
        </div>
    );
}