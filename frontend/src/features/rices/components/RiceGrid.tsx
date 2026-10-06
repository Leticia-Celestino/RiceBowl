import type { ReactNode } from 'react';
import type { RiceDTO } from '../../../types/rice';
import { RiceCard } from './RiceCard';

interface RiceGridProps {
    rices: RiceDTO[];
    onSelect: (rice: RiceDTO) => void;
    renderActions?: (rice: RiceDTO) => ReactNode;
}

export function RiceGrid({ rices, onSelect, renderActions }: RiceGridProps) {
    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rices.map(rice => (
                <article key={rice.id} className="group relative min-w-0">
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Abrir detalhes de ${rice.title}`}
                        onClick={() => onSelect(rice)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect(rice);
                            }
                        }}
                        className="cursor-pointer transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gruvbox-primary"
                    >
                        <RiceCard rice={rice} />
                    </div>
                    {renderActions?.(rice)}
                </article>
            ))}
        </div>
    );
}
