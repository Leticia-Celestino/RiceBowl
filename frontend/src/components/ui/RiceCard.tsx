import type { RiceDTO } from '../../types/rice';
import { GlassPanel } from './GlassPanel';
import { Avatar } from './Avatar';
import { Tag } from './Tag';

interface RiceCardProps {
    rice: RiceDTO;
}

export function RiceCard({ rice }: RiceCardProps) {
    return (
        <GlassPanel className="overflow-hidden group cursor-pointer hover:border-gruvbox-primary/50 transition-colors break-inside-avoid mb-6">
            
            {/* Foto de Capa com Efeito Hover */}
            <div className="w-full aspect-video bg-gruvbox-bg/50 relative overflow-hidden border-b border-gruvbox-gray/20">
                {rice.coverImageUrl ? (
                    <img 
                        src={rice.coverImageUrl} 
                        alt={rice.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-gruvbox-gray/50">
                        no_cover.png
                    </div>
                )}
            </div>

            {/* Corpo do Card */}
            <div className="p-4 flex flex-col gap-3">
                <h2 className="font-sans font-bold text-lg text-gruvbox-fg line-clamp-1">
                    {rice.title}
                </h2>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {rice.tags.slice(0, 3).map(tag => (
                        <Tag key={tag} label={tag} />
                    ))}
                    {rice.tags.length > 3 && (
                        <span className="text-xs font-mono text-gruvbox-gray mt-1">
                            +{rice.tags.length - 3}
                        </span>
                    )}
                </div>

                {/* Rodapé: Autor e Data */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gruvbox-gray/10">
                    <div className="flex items-center gap-2">
                        <Avatar 
                            src={rice.author?.avatarUrl} 
                            alt={rice.author?.nickname || 'user'} 
                            size="sm" 
                        />
                        <span className="font-mono text-xs text-gruvbox-gray group-hover:text-gruvbox-fg transition-colors">
                            @{rice.author?.nickname || 'unknown'}
                        </span>
                    </div>
                </div>
            </div>
            
        </GlassPanel>
    );
}