import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { RiceModal } from '../features/rices/components/RiceModal';
import type { RiceDTO, PageResponse } from '../types/rice';
import { api } from '../config/api';
import { useAuth } from '../features/auth/useAuth';
import { PageState } from '../components/ui/PageState';
import { RiceGrid } from '../features/rices/components/RiceGrid';
import { ProfileHeader, type UserProfile } from '../features/profile/components/ProfileHeader';

export function Profile() {
    const { nickname } = useParams<{ nickname: string }>();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [rices, setRices] = useState<RiceDTO[]>([]);
    const [selectedRice, setSelectedRice] = useState<RiceDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useAuth(state => state.user);
    const isOwner = currentUser?.nickname.toLowerCase() === nickname?.toLowerCase();

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
                const profileRes = await api.get<UserProfile>(`/users/${nickname}`, {
                    signal: controller.signal,
                });
                setProfile(profileRes.data);

                const ricesRes = await api.get<PageResponse<RiceDTO>>(`/rices?author=${nickname}`, {
                    signal: controller.signal,
                });
                setRices(ricesRes.data.content);

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
        return <PageState loading>{`Carregando perfil de @${nickname ?? ''}...`}</PageState>;
    }

    if (!profile) {
        return <PageState tone="error">Usuário não encontrado.</PageState>;
    }

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full relative">
            
            <ProfileHeader profile={profile} />

            {/* GRID DE RICES */}
            <div className="mt-4">
                <h3 className="text-lg font-bold text-gruvbox-fg font-sans mb-4 flex items-center gap-2 border-b border-gruvbox-gray/10 pb-2">
                    Vitrine de @{profile.nickname}
                </h3>
                
                {rices.length === 0 ? (
                    <PageState>Este usuário ainda não publicou nenhum setup.</PageState>
                ) : (
                    <RiceGrid
                        rices={rices}
                        onSelect={setSelectedRice}
                        renderActions={rice => isOwner ? (
                            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                                <button
                                    type="button"
                                    aria-label={`Excluir ${rice.title}`}
                                    className="rounded bg-gruvbox-bg/80 p-2 text-gruvbox-red shadow backdrop-blur-sm hover:bg-gruvbox-red/20"
                                    onClick={() => void handleDelete(rice.id)}
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </div>
                        ) : null}
                    />
                )}
            </div>

            {selectedRice && (
                <RiceModal rice={selectedRice} onClose={() => setSelectedRice(null)} />
            )}
            
        </div>
    );
}
