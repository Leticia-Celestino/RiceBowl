import { useState, useEffect } from 'react';

const BOOT_LINES = [
    "[  OK  ] Loading core system modules...",
    "[  OK  ] Initializing IMO-RSA cryptography daemon...",
    "[  OK  ] Mounting virtual filesystems...",
    "[  OK  ] Parsing Alacritty terminal configurations...",
    "[  OK  ] Establishing secure connection to RiceBowl network...",
    "[  OK  ] Starting user interface..."
];

export function FastfetchBoot() {
    const [isVisible, setIsVisible] = useState(() => {
        return !sessionStorage.getItem('ricebowl_booted');
    });
    
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [showFetch, setShowFetch] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        if (!isVisible) return;

        let delay = 0;
        
        // 1. Simula as linhas de log aparecendo rápido
        BOOT_LINES.forEach((line) => {
            delay += Math.random() * 200 + 100; 
            setTimeout(() => {
                setVisibleLines(prev => [...prev, line]);
            }, delay);
        });

        // 2. Mostra a arte ASCII (Fastfetch)
        setTimeout(() => {
            setShowFetch(true);
        }, delay + 300);

        // 3. Aguarda uns segundos para o usuário ler, depois inicia o Fade Out
        setTimeout(() => {
            setIsFadingOut(true);
            
            // 4. Remove da tela e salva na sessão
            setTimeout(() => {
                sessionStorage.setItem('ricebowl_booted', 'true');
                setIsVisible(false);
            }, 500); 
            
        }, delay + 3500); 

    }, [isVisible]); 

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[9999] bg-[#1d2021] text-gruvbox-fg font-mono p-4 sm:p-8 overflow-hidden transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-4xl mx-auto flex flex-col gap-1 mt-4 sm:mt-10">
                
                {/* Logs do Sistema */}
                {visibleLines.map((line, i) => (
                    <div key={i} className="text-sm sm:text-base animate-in fade-in duration-75">
                        <span className="text-gruvbox-green font-bold">{line.substring(0, 8)}</span>
                        <span className="text-gruvbox-fg/80">{line.substring(8)}</span>
                    </div>
                ))}

                {/* Fastfetch ASCII Art & Specs */}
                {showFetch && (
                    <div className="mt-10 flex flex-col md:flex-row gap-6 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-gruvbox-primary font-bold text-[10px] sm:text-xs leading-tight whitespace-pre select-none">
{`       \\   /
        \\ /
       .-Y-.
      /     \\
     |       |
     |_______|
      \\_____/
`}
                        </div>

                        {/* Specs do "Sistema" */}
                        <div className="flex flex-col gap-1 text-sm sm:text-base">
                            <div className="text-gruvbox-primary font-bold mb-2">leticia<span className="text-gruvbox-fg">@</span>ricebowl</div>
                            <div><span className="text-gruvbox-accent font-bold">OS:</span> RiceBowl WebOS 1.0</div>
                            <div><span className="text-gruvbox-accent font-bold">Kernel:</span> React 18 / Vite</div>
                            <div><span className="text-gruvbox-accent font-bold">Uptime:</span> 0 mins</div>
                            <div><span className="text-gruvbox-accent font-bold">Packages:</span> 42 (npm)</div>
                            <div><span className="text-gruvbox-accent font-bold">Shell:</span> bash</div>
                            <div><span className="text-gruvbox-accent font-bold">WM:</span> Tailwind CSS Grid</div>
                            <div><span className="text-gruvbox-accent font-bold">Theme:</span> Gruvbox Dark</div>
                            
                            <div className="flex gap-2 mt-4">
                                <div className="w-5 h-5 bg-gruvbox-bg border border-gruvbox-gray/20 rounded-sm"></div>
                                <div className="w-5 h-5 bg-gruvbox-error rounded-sm"></div>
                                <div className="w-5 h-5 bg-gruvbox-green rounded-sm"></div>
                                <div className="w-5 h-5 bg-gruvbox-accent rounded-sm"></div>
                                <div className="w-5 h-5 bg-gruvbox-blue rounded-sm"></div>
                                <div className="w-5 h-5 bg-gruvbox-primary rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}