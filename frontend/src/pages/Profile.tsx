import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Star, Image as ImageIcon, Trash2 } from 'lucide-react';
import { RiceCard } from '../components/ui/RiceCard';
import { RiceModal } from '../components/ui/RiceModal';
import type { RiceDTO, PageResponse } from '../types/rice';
import { api } from '../config/api';

interface UserProfileDTO {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    bio: string | null;
    totalKarma: number;
    riceCount: number;
}

export function Profile() {
    const { nickname } = useParams<{ nickname: string }>();
    
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [rices, setRices] = useState<RiceDTO[]>([]);
    const [selectedRice, setSelectedRice] = useState<RiceDTO | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleDelete = async (riceId: string) => {
        if (!window.confirm('Excluir este rice e seus arquivos permanentemente?')) return;
        try {
            await api.delete(`/rices/${riceId}`);
            setRices(items => items.filter(item => item.id !== riceId));
            setProfile(current => current ? { ...current, riceCount: Math.max(0, current.riceCount - 1) } : current);
        } catch {
            window.alert('Não foi possível excluir o rice.');
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                // 1. Busca os dados do perfil público
                const profileRes = await api.get<UserProfileDTO>(`/users/${nickname}`, {
                    signal: controller.signal,
                });
                setProfile(profileRes.data);

                // 2. Busca apenas os rices deste autor
                const ricesRes = await api.get<PageResponse<RiceDTO>>(`/rices?author=${nickname}`, {
                    signal: controller.signal,
                });
                setRices(ricesRes.data.content);

                // 3. Checa se o usuário logado é o dono do perfil
                if (localStorage.getItem('@ricebowl:token')) {
                    const meRes = await api.get('/users/me', {
                        signal: controller.signal,
                    });
                    setIsOwner(meRes.data.nickname.toLowerCase() === nickname?.toLowerCase());
                }

            } catch (error) {
                if ((error as Error).name !== 'CanceledError') {
                    console.error("Erro ao carregar o perfil:", error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (nickname) {
            void fetchProfileData();
        }

        return () => controller.abort();
    }, [nickname]);

    if (isLoading) {
        return <div className="p-6 text-gruvbox-gray font-mono animate-pulse">Carregando perfil de @{nickname}...</div>;
    }

    if (!profile) {
        return <div className="p-6 text-gruvbox-red font-mono">Usuário não encontrado.</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full relative">
            
            {/* CABEÇALHO DO PERFIL */}
            <div className="bg-gruvbox-bg/50 backdrop-blur-md border border-gruvbox-gray/20 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center md:items-start shadow-md relative overflow-hidden">
                {/* Efeito de brilho de fundo opcional */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gruvbox-primary/5 rounded-full blur-3xl pointer-events-none" />

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gruvbox-bg border-2 border-gruvbox-primary/50 flex items-center justify-center overflow-hidden shrink-0 shadow-lg z-10">
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.nickname} className="w-full h-full object-cover" />
                    ) : (
                        <User size={40} className="text-gruvbox-gray" />
                    )}
                </div>

                {/* Informações */}
                <div className="flex flex-col flex-grow text-center md:text-left z-10 w-full">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gruvbox-fg font-sans mb-1">
                                @{profile.nickname}
                            </h1>
                            <p className="text-sm text-gruvbox-fg/80 font-sans max-w-2xl whitespace-pre-wrap">
                                {profile.bio || "Nenhuma biografia fornecida. Apenas dotfiles."}
                            </p>
                        </div>
                        
                    </div>

                    {/* Estatísticas */}
                    <div className="flex gap-6 mt-6 justify-center md:justify-start border-t border-gruvbox-gray/10 pt-4">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={18} className="text-gruvbox-accent" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gruvbox-gray uppercase font-mono tracking-wider">Setups</span>
                                <span className="text-lg font-bold text-gruvbox-fg leading-none">{profile.riceCount}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-gruvbox-yellow" />
                            <div className="flex flex-col">
                                <span className="text-xs text-gruvbox-gray uppercase font-mono tracking-wider">Karma</span>
                                <span className="text-lg font-bold text-gruvbox-fg leading-none">{profile.totalKarma}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID DE RICES */}
            <div className="mt-4">
                <h3 className="text-lg font-bold text-gruvbox-fg font-sans mb-4 flex items-center gap-2 border-b border-gruvbox-gray/10 pb-2">
                    Vitrine de @{profile.nickname}
                </h3>
                
                {rices.length === 0 ? (
                    <div className="text-center py-20 text-gruvbox-gray font-mono">
                        Este usuário ainda não publicou nenhum setup.
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {rices.map((rice) => (
                            <div 
                                key={rice.id} 
                                className="break-inside-avoid relative group cursor-pointer"
                                onClick={() => setSelectedRice(rice)}
                            >
                                <RiceCard rice={rice} />
                                
                                {/* Ações de Dono: Editar e Apagar (Visível no Hover) */}
                                {isOwner && (
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button 
                                            type="button"
                                            aria-label="Excluir rice"
                                            className="p-2 bg-gruvbox-bg/80 backdrop-blur-sm rounded text-gruvbox-red hover:bg-gruvbox-red/20 shadow"
                                            onClick={(e) => { e.stopPropagation(); void handleDelete(rice.id); }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedRice && (
                <RiceModal rice={selectedRice} onClose={() => setSelectedRice(null)} />
            )}
            
        </div>
    );
}
