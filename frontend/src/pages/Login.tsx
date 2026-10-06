import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { api } from '../config/api';
import { useAuth } from '../features/auth/useAuth';
import { AuthShell } from '../features/auth/components/AuthShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuth(state => state.login);
    const returnTo = typeof location.state?.from === 'string' && location.state.from.startsWith('/')
        ? location.state.from
        : '/';

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            if (isRegistering) {
                await api.post('/auth/register', { nickname, email, password });
                setMessage('Cadastro recebido. Confira seu e-mail para confirmar a conta antes de entrar.');
                setIsRegistering(false);
                setPassword('');
                return;
            }
            const { data } = await api.post('/auth/login', { email, password });
            login(data.user);
            navigate(returnTo, { replace: true });
        } catch {
            setError(isRegistering
                ? 'Não foi possível concluir o cadastro. Revise os campos e tente novamente.'
                : 'Não foi possível entrar. Confira as credenciais e a confirmação do e-mail.');
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async () => {
        setError('');
        try {
            await api.post('/auth/resend-verification', { email });
            setMessage('Se houver uma conta pendente, um novo link foi enviado.');
        } catch {
            setError('Aguarde um pouco antes de solicitar outro link.');
        }
    };

    return (
        <AuthShell
            eyebrow={isRegistering ? 'Nova conta' : 'Área de membros'}
            title={isRegistering ? 'Entre para a comunidade' : 'Bom ter você de volta'}
            description={isRegistering ? 'Crie sua identidade e comece a documentar seus ambientes.' : 'Acesse sua coleção, publique e participe das discussões.'}
        >
            <form onSubmit={submit} className="space-y-5">
                {isRegistering && (
                    <Input label="Nickname" autoComplete="username" placeholder="seu_usuario" value={nickname} onChange={event => setNickname(event.target.value)} minLength={3} maxLength={50} pattern="[A-Za-z0-9_-]+" required />
                )}
                <Input label="E-mail" type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={event => setEmail(event.target.value)} maxLength={100} required />
                <div>
                    <Input label="Senha" type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} minLength={12} maxLength={128} required />
                    {!isRegistering && <Link to="/forgot-password" className="mt-2 block text-right text-xs text-gruvbox-gray hover:text-gruvbox-primary">Esqueci minha senha</Link>}
                </div>
                {isRegistering && <p className="text-xs leading-relaxed text-gruvbox-gray">Mínimo de 12 caracteres. Prefira uma frase longa e exclusiva.</p>}
                {error && <p role="alert" className="rounded-xl border border-gruvbox-error/20 bg-gruvbox-error/10 p-3 text-sm text-gruvbox-error">{error}</p>}
                {message && <p role="status" className="rounded-xl border border-gruvbox-accent/20 bg-gruvbox-accent/10 p-3 text-sm text-gruvbox-fg">{message}</p>}
                <Button type="submit" className="w-full py-3" icon={isRegistering ? <UserPlus size={17} /> : <ArrowRight size={17} />} disabled={isLoading}>
                    {isLoading ? 'Aguarde…' : isRegistering ? 'Criar conta' : 'Entrar'}
                </Button>
            </form>

            {!isRegistering && error && email && (
                <button type="button" onClick={() => void resendVerification()} className="mt-4 w-full text-center text-xs text-gruvbox-gray hover:text-gruvbox-primary">
                    Reenviar confirmação de e-mail
                </button>
            )}

            <div className="mt-8 border-t border-gruvbox-gray/15 pt-6 text-center text-sm text-gruvbox-gray">
                {isRegistering ? 'Já possui uma conta?' : 'Ainda não faz parte?'}{' '}
                <button type="button" onClick={() => { setIsRegistering(value => !value); setError(''); setMessage(''); }} className="font-medium text-gruvbox-primary hover:underline">
                    {isRegistering ? 'Fazer login' : 'Criar uma conta'}
                </button>
            </div>
        </AuthShell>
    );
}
