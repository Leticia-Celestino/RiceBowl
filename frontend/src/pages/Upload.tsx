// src/pages/Upload.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Terminal, UploadCloud, Image as ImageIcon, FileArchive } from 'lucide-react';

export function Upload() {
    const navigate = useNavigate();
    
    // Estados do Formulário (Textos)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [distro, setDistro] = useState('');
    const [windowManager, setWindowManager] = useState('');
    const [tagsText, setTagsText] = useState('');
    
    // Estados dos Arquivos
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [configFile, setConfigFile] = useState<File | null>(null);
    
    // Estados de Controle
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const tagsArray = tagsText.split(',').map(tag => tag.trim()).filter(Boolean);
            
            // 1. Envio dos dados de texto (JSON)
            const riceResponse = await api.post('/rices', {
                title,
                description,
                distro,
                windowManager,
                tags: tagsArray
            });
            
            const riceId = riceResponse.data.id;

            // 2. Envio da imagem de capa (Multipart)
            if (coverFile) {
                const coverFormData = new FormData();
                coverFormData.append('file', coverFile);
                await api.patch(`/rices/${riceId}/cover`, coverFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // 3. Envio dos dotfiles (Multipart)
            if (configFile) {
                const configFormData = new FormData();
                configFormData.append('file', configFile);
                await api.patch(`/rices/${riceId}/config`, configFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Sucesso! Redireciona para a Home
            navigate('/');
            
        } catch {
            setError('Erro ao enviar os dados. Verifique a conexão com o servidor e o tamanho dos arquivos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center gap-3 border-b border-gruvbox-gray/20 pb-4">
                <Terminal className="text-gruvbox-primary" size={24} />
                <h1 className="text-2xl font-mono font-bold text-gruvbox-fg">upload_rice.sh</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <GlassPanel className="p-6 flex flex-col gap-5">
                    
                    <Input 
                        label="Título do Setup" 
                        placeholder="Ex: Minimalist Arch + Hyprland" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                            label="Distribuição (Distro)" 
                            placeholder="Ex: Arch Linux, Zorin OS" 
                            value={distro}
                            onChange={(e) => setDistro(e.target.value)}
                            required
                        />
                        <Input 
                            label="Window Manager / DE" 
                            placeholder="Ex: Hyprland, GNOME, i3wm" 
                            value={windowManager}
                            onChange={(e) => setWindowManager(e.target.value)}
                            required
                        />
                    </div>
                    
                    <Textarea 
                        label="Descrição Detalhada" 
                        placeholder="Conte sobre suas configurações..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <Input 
                        label="Tags (separadas por vírgula)" 
                        placeholder="arch, gruvbox, neovim, wayland" 
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        required
                    />

                    <div className="pt-4 border-t border-gruvbox-gray/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-mono text-gruvbox-gray uppercase">Foto de Capa</label>
                            <label className={`flex items-center gap-3 p-3 border border-dashed rounded-md cursor-pointer transition-colors ${coverFile ? 'border-gruvbox-accent text-gruvbox-accent bg-gruvbox-accent/10' : 'border-gruvbox-gray/30 text-gruvbox-gray hover:bg-gruvbox-gray/5'}`}>
                                <ImageIcon size={20} />
                                <span className="font-sans text-sm truncate">{coverFile ? coverFile.name : 'Selecionar imagem...'}</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-mono text-gruvbox-gray uppercase">Dotfiles (.tar.gz)</label>
                            <label className={`flex items-center gap-3 p-3 border border-dashed rounded-md cursor-pointer transition-colors ${configFile ? 'border-gruvbox-primary text-gruvbox-primary bg-gruvbox-primary/10' : 'border-gruvbox-gray/30 text-gruvbox-gray hover:bg-gruvbox-gray/5'}`}>
                                <FileArchive size={20} />
                                <span className="font-sans text-sm truncate">{configFile ? configFile.name : 'Selecionar .tar.gz...'}</span>
                                <input 
                                    type="file" 
                                    accept=".tar.gz,.zip" 
                                    className="hidden" 
                                    onChange={(e) => setConfigFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>

                    </div>

                    {error && <span className="text-sm text-gruvbox-error font-mono bg-gruvbox-error/10 p-3 rounded-md">{error}</span>}

                </GlassPanel>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => navigate('/')}>
                        Abortar
                    </Button>
                    <Button type="submit" icon={<UploadCloud size={18} />} disabled={isLoading}>
                        {isLoading ? 'Compilando pacotes...' : 'Executar Upload'}
                    </Button>
                </div>
            </form>

        </div>
    );
}