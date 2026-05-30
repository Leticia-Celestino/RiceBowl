import { X, Download, Monitor, Cpu, Calendar } from 'lucide-react';
import type { RiceDTO } from '../../types/rice';
import { GlassPanel } from './GlassPanel';
import { Tag } from './Tag';
import { Button } from './Button';

interface RiceModalProps {
    rice: RiceDTO | null;
    onClose: () => void;
}

export function RiceModal({ rice, onClose }: RiceModalProps) {
    if (!rice) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop com desfoque */}
            <div 
                className="absolute inset-0 bg-gruvbox-bg/80 backdrop-blur-md"
                onClick={onClose}
            />

            <GlassPanel className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
                {/* Botão de Fechar */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gruvbox-bg/50 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                    
                    {/* Lado Esquerdo: Imagem */}
                    <div className="md:w-3/5 bg-gruvbox-bg/30 border-b md:border-b-0 md:border-r border-gruvbox-gray/20">
                        <img 
                            src={rice.coverUrl || '/no_cover.png'} 
                            alt={rice.title}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Lado Direito: Informações */}
                    <div className="md:w-2/5 p-6 flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-sans font-bold text-gruvbox-fg">{rice.title}</h2>
                            <p className="text-gruvbox-gray text-sm font-mono">@{rice.authorNickname}</p>
                        </div>

                        {/* Badges de Sistema */}
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

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {rice.tags.map(tag => (
                                <Tag key={tag} label={tag} />
                            ))}
                        </div>

                        {/* Descrição */}
                        <div className="flex-grow">
                            <h3 className="text-xs uppercase text-gruvbox-gray font-mono mb-2">Descrição</h3>
                            <p className="text-gruvbox-fg/80 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                {rice.description}
                            </p>
                        </div>

                        {/* Rodapé do Modal */}
                        <div className="pt-4 border-t border-gruvbox-gray/10 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-gruvbox-gray text-[10px] font-mono">
                                <Calendar size={12} />
                                Postado em {new Date(rice.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                            
                            {rice.configUrl && (
                                <Button 
                                    className="w-full justify-center"
                                    onClick={() => window.open(rice.configUrl!, '_blank')}
                                    icon={<Download size={18} />}
                                >
                                    Baixar Dotfiles
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
}