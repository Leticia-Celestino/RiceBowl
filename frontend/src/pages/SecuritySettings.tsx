import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { api } from '../config/api';
import { GlassPanel } from '../components/ui/GlassPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await api.post('/auth/change-password', { currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setMessage('Senha atualizada. Todas as outras sessões foram encerradas.');
        } catch {
            setError('Não foi possível alterar a senha. Confira a senha atual.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-14">
            <PageHeader icon={<ShieldCheck size={24} />} title="Segurança da conta" description="Gerencie sua credencial e encerre acessos antigos." />
            <GlassPanel className="mt-8 p-6 sm:p-8">
                <form onSubmit={submit} className="space-y-5">
                    <Input label="Senha atual" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required />
                    <Input label="Nova senha" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
                    <p className="text-xs leading-relaxed text-gruvbox-gray">Ao salvar, todas as sessões anteriores serão revogadas. Este dispositivo recebe uma nova sessão.</p>
                    {message && <p role="status" className="rounded-xl bg-gruvbox-accent/10 p-3 text-sm text-gruvbox-fg">{message}</p>}
                    {error && <p role="alert" className="rounded-xl bg-gruvbox-error/10 p-3 text-sm text-gruvbox-error">{error}</p>}
                    <Button type="submit" disabled={loading}>{loading ? 'Atualizando…' : 'Atualizar senha'}</Button>
                </form>
            </GlassPanel>
        </div>
    );
}
