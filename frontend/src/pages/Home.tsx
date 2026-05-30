import { GlassPanel } from '../components/ui/GlassPanel';

export function Home() {
    return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <h1 className="text-2xl font-mono font-bold text-gruvbox-fg">~ / home</h1>

        <GlassPanel className="p-8 text-center border-dashed">
        <p className="font-mono text-gruvbox-gray">O feed com os Rices em estilo Masonry aparecerá aqui em breve...</p>
        </GlassPanel>
    </div>
    );
}