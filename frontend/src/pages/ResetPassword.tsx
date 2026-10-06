import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { api } from '../config/api';
import { AuthShell } from '../features/auth/components/AuthShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const [password, setPassword] = useState('');
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setDone(true);
        } catch {
            setError('Este link é inválido, expirou ou já foi utilizado.');
        }
    };

    return (
        <AuthShell eyebrow="Nova credencial" title="Crie uma nova senha" description="A alteração encerra automaticamente todas as sessões abertas.">
            {done ? (
                <div className="space-y-5">
                    <div role="status" className="rounded-2xl border border-gruvbox-accent/25 bg-gruvbox-accent/10 p-5 text-sm text-gruvbox-fg">Senha alterada e sessões anteriores revogadas.</div>
                    <Link to="/login" className="block text-center text-sm text-gruvbox-primary hover:underline">Entrar novamente</Link>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-5">
                    <Input label="Nova senha" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} required />
                    <p className="text-xs leading-relaxed text-gruvbox-gray">Use pelo menos 12 caracteres e uma senha exclusiva.</p>
                    {error && <p role="alert" className="text-sm text-gruvbox-error">{error}</p>}
                    <Button type="submit" className="w-full" icon={<KeyRound size={17} />} disabled={!token}>Salvar nova senha</Button>
                </form>
            )}
        </AuthShell>
    );
}
