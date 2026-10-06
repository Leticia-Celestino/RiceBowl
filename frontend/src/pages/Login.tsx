import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { useAuth } from '../features/auth/useAuth';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Terminal, Upload } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [nickname, setNickname] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                await api.post('/auth/register', { nickname, email, password });
            }
            const response = await api.post('/auth/login', { email, password });
            const { user } = response.data;
            await api.get('/auth/csrf');
            login(user);
            navigate('/');
        } catch {
            // Apenas removemos o (err) daqui!
            setError(isRegistering
                ? 'Não foi possível criar a conta. Verifique os dados e tente outro e-mail ou nickname.'
                : 'Credenciais inválidas. O RiceBowl negou o acesso.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 flex items-center justify-center bg-gruvbox-bg">
            <GlassPanel className="w-full max-w-md p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-300">
                
                <div className="flex items-center gap-3 border-b border-gruvbox-gray/20 pb-4">
                    <Terminal className="text-gruvbox-primary" size={24} />
                    <h1 className="text-xl font-sans font-bold text-gruvbox-fg">{isRegistering ? 'Criar conta' : 'Autenticação'}</h1>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {isRegistering && (
                        <Input
                            label="Nickname"
                            type="text"
                            placeholder="seu_usuario"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            minLength={3}
                            maxLength={50}
                            required
                        />
                    )}
                    <Input 
                        label="E-mail do sistema" 
                        type="email" 
                        placeholder="root@rice.bowl" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input 
                        label="Senha" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    {error && <span className="text-xs text-gruvbox-error font-mono">{error}</span>}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gruvbox-gray/20 mt-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => navigate('/')}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            icon={<Upload size={16} />} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processando...' : isRegistering ? 'Criar e entrar' : 'Iniciar Sessão'}
                        </Button>
                    </div>
                </form>

                <button
                    type="button"
                    onClick={() => { setIsRegistering(value => !value); setError(''); }}
                    className="text-sm font-mono text-gruvbox-primary hover:underline"
                >
                    {isRegistering ? 'Já tenho uma conta' : 'Ainda não tenho uma conta'}
                </button>

            </GlassPanel>
        </div>
    );
}
