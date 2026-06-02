import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { X, Download, Monitor, Cpu, Calendar, Send, User } from 'lucide-react';
import type { RiceDTO, CommentDTO } from '../../types/rice';
import { GlassPanel } from './GlassPanel';
import { Tag } from './Tag';
import { Button } from './Button';

interface RiceModalProps {
    rice: RiceDTO | null;
    onClose: () => void;
}

type CommentsState = {
    riceId: RiceDTO['id'] | null;
    items: CommentDTO[];
};

type DraftState = {
    riceId: RiceDTO['id'] | null;
    text: string;
};

export function RiceModal({ rice, onClose }: RiceModalProps) {
    const [commentsState, setCommentsState] = useState<CommentsState>({
        riceId: rice?.id ?? null,
        items: rice?.comments ?? [],
    });

    const [draftState, setDraftState] = useState<DraftState>({
        riceId: rice?.id ?? null,
        text: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!rice) return;

        const controller = new AbortController();

        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8080/rices/${rice.id}/comments`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                if (!response.ok) return;

                const data = await response.json();

                const fetchedComments = Array.isArray(data) ? data : (data.content || []);

                setCommentsState({
                    riceId: rice.id,
                    items: fetchedComments,
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Erro ao carregar a discussão:', error);
                }
            }
        };

        fetchComments();

        return () => controller.abort();
    }, [rice?.id]);

    if (!rice) return null;

    const comments =
        commentsState.riceId === rice.id
            ? commentsState.items
            : (rice.comments ?? []);

    const newComment =
        draftState.riceId === rice.id ? draftState.text : '';

    const handleCommentSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/rices/${rice.id}/comments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (response.ok) {
                const optimisticComment: CommentDTO = {
                    id: crypto.randomUUID(),
                    content: newComment,
                    authorNickname: 'Você',
                    createdAt: new Date().toISOString(),
                };

                setCommentsState(prev => ({
                    riceId: rice.id,
                    items:
                        prev.riceId === rice.id
                            ? [...prev.items, optimisticComment]
                            : [...(rice.comments ?? []), optimisticComment],
                }));

                setDraftState({
                    riceId: rice.id,
                    text: '',
                });
            }
        } catch (error) {
            console.error('Falha ao enviar comentário', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-gruvbox-bg/80 backdrop-blur-md"
                onClick={onClose}
            />

            <GlassPanel className="w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gruvbox-bg/50 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    <div className="md:w-[55%] bg-gruvbox-bg/30 border-b md:border-b-0 md:border-r border-gruvbox-gray/20 overflow-y-auto">
                        <img
                            src={rice.coverUrl || '/no_cover.png'}
                            alt={rice.title}
                            className="w-full h-auto object-contain"
                        />
                    </div>

                    <div className="md:w-[45%] flex flex-col h-full bg-gruvbox-bg/10">
                        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
                            <div>
                                <h2 className="text-2xl font-sans font-bold text-gruvbox-fg">{rice.title}</h2>
                                <p className="text-gruvbox-gray text-sm font-mono">@{rice.authorNickname}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 p-2 rounded bg-gruvbox-bg/50 border border-gruvbox-gray/10">
                                    <Cpu size={16} className="text-gruvbox-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-gruvbox-gray font-mono">Distro</span>
                                        <span className="text-xs text-gruvbox-fg font-bold">{rice.distro}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-2 rounded bg-gruvbox-bg/50 border border-gruvbox-gray/10">
                                    <Monitor size={16} className="text-gruvbox-accent" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-gruvbox-gray font-mono">WM / DE</span>
                                        <span className="text-xs text-gruvbox-fg font-bold">{rice.windowManager}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {rice.tags.map(tag => (
                                    <Tag key={tag} label={tag} />
                                ))}
                            </div>

                            <div>
                                <h3 className="text-[10px] uppercase text-gruvbox-gray font-mono mb-2">Descrição</h3>
                                <p className="text-gruvbox-fg/80 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                    {rice.description}
                                </p>
                            </div>

                            <hr className="border-gruvbox-gray/10" />

                            <div className="flex flex-col gap-4">
                                <h3 className="text-[10px] uppercase text-gruvbox-gray font-mono">
                                    Discussão ({comments.length})
                                </h3>

                                {comments.length === 0 ? (
                                    <div className="text-center py-6 text-sm font-mono text-gruvbox-gray/50">
                                        Ninguém comentou ainda. Seja o primeiro a pedir os dotfiles!
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {comments.map(comment => (
                                            <div key={comment.id} className="flex gap-3 text-sm">
                                                <div className="w-8 h-8 rounded bg-gruvbox-gray/10 flex items-center justify-center flex-shrink-0 text-gruvbox-gray">
                                                    <User size={16} />
                                                </div>

                                                <div className="flex flex-col bg-gruvbox-bg/50 p-3 rounded-md border border-gruvbox-gray/10 w-full">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-gruvbox-primary font-mono text-xs">
                                                            @{comment.authorNickname}
                                                        </span>
                                                        <span className="text-[10px] text-gruvbox-gray font-mono">
                                                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>

                                                    <p className="text-gruvbox-fg font-sans leading-relaxed break-words">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gruvbox-gray/10 bg-gruvbox-bg/80 backdrop-blur-sm flex flex-col gap-3 shrink-0">
                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) =>
                                        setDraftState({
                                            riceId: rice.id,
                                            text: e.target.value,
                                        })
                                    }
                                    placeholder="Comente sobre o setup..."
                                    className="flex-grow bg-gruvbox-bg border border-gruvbox-gray/30 rounded-md px-3 py-2 text-sm text-gruvbox-fg focus:outline-none focus:border-gruvbox-primary transition-colors font-sans"
                                    disabled={isSubmitting}
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="bg-gruvbox-primary/10 text-gruvbox-primary hover:bg-gruvbox-primary/20 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-md transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>

                            <div className="flex items-center justify-between mt-1">
                                <div className="text-gruvbox-gray text-[10px] font-mono flex items-center gap-1">
                                    <Calendar size={12} />
                                    Postado em {new Date(rice.createdAt).toLocaleDateString('pt-BR')}
                                </div>

                                {rice.configUrl && (
                                    <Button
                                        className="text-xs py-1.5 px-4"
                                        onClick={() => window.open(rice.configUrl!, '_blank')}
                                        icon={<Download size={14} />}
                                    >
                                        Baixar Dotfiles
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
}