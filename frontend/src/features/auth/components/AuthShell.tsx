import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface AuthShellProps {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
}

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
    return (
        <main className="min-h-screen bg-gruvbox-bg p-4 sm:p-8">
            <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-gruvbox-gray/15 bg-gruvbox-panel/35 shadow-2xl sm:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.1fr_0.9fr]">
                <section className="brand-grid relative hidden overflow-hidden border-r border-gruvbox-gray/15 p-12 lg:flex lg:flex-col lg:justify-between">
                    <Link to="/" className="relative z-10 inline-flex items-center gap-3 text-gruvbox-fg">
                        <span className="brand-mark">R</span>
                        <span className="text-lg font-bold tracking-[-0.03em]">RiceBowl</span>
                    </Link>
                    <div className="relative z-10 max-w-xl">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gruvbox-primary/25 bg-gruvbox-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-gruvbox-primary">
                            <Sparkles size={13} /> Feito pela comunidade
                        </span>
                        <p className="text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-gruvbox-fg">
                            Seu desktop é uma história. Mostre como ela foi montada.
                        </p>
                        <p className="mt-6 max-w-md text-base leading-relaxed text-gruvbox-gray">
                            Descubra ambientes Linux, compartilhe dotfiles e aprenda com configurações reproduzíveis.
                        </p>
                    </div>
                    <p className="relative z-10 font-mono text-[11px] uppercase tracking-[0.16em] text-gruvbox-gray/70">
                        Open source · Linux desktops · dotfiles
                    </p>
                </section>

                <section className="flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md">
                        <Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm text-gruvbox-gray transition-colors hover:text-gruvbox-fg">
                            <ArrowLeft size={16} /> Voltar para a galeria
                        </Link>
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gruvbox-primary">{eyebrow}</p>
                        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-gruvbox-fg">{title}</h1>
                        <p className="mt-3 leading-relaxed text-gruvbox-gray">{description}</p>
                        <div className="mt-8">{children}</div>
                    </div>
                </section>
            </div>
        </main>
    );
}
