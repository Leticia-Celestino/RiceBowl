// src/pages/Upload.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Terminal, UploadCloud, Image as ImageIcon, FileArchive } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { FilePicker } from '../features/upload/components/FilePicker';

export function Upload() {
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [distro, setDistro] = useState('');
    const [windowManager, setWindowManager] = useState('');
    const [tagsText, setTagsText] = useState('');
    
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [configFile, setConfigFile] = useState<File | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        let createdRiceId: string | null = null;

        try {
            const tagsArray = tagsText.split(',').map(tag => tag.trim()).filter(Boolean);
            
            const riceResponse = await api.post('/rices', {
                title,
                description,
                distro,
                windowManager,
                tags: tagsArray
            });
            
            const riceId: string = riceResponse.data.id;
            createdRiceId = riceId;

            if (coverFile) {
                const coverFormData = new FormData();
                coverFormData.append('file', coverFile);
                await api.patch(`/rices/${riceId}/cover`, coverFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (configFile) {
                const configFormData = new FormData();
                configFormData.append('file', configFile);
                await api.patch(`/rices/${riceId}/config`, configFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/');
            
        } catch {
            if (createdRiceId) {
                try {
                    await api.delete(`/rices/${createdRiceId}`);
                } catch {
                    console.error('Não foi possível remover a publicação incompleta.');
                }
            }
            setError('Erro ao enviar os dados. Verifique a conexão com o servidor e o tamanho dos arquivos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <PageHeader icon={<Terminal size={24} />} title="upload_rice.sh" description="Publique o visual e os arquivos de configuração do seu setup." />

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
                        
                        <FilePicker
                            label="Foto de capa"
                            file={coverFile}
                            emptyLabel="Selecionar imagem..."
                            icon={ImageIcon}
                            accent="accent"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            required
                            onChange={setCoverFile}
                        />

                        <FilePicker
                            label="Dotfiles (.zip ou .tar.gz)"
                            file={configFile}
                            emptyLabel="Selecionar arquivo..."
                            icon={FileArchive}
                            accept=".tar.gz,.zip"
                            required
                            onChange={setConfigFile}
                        />

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
