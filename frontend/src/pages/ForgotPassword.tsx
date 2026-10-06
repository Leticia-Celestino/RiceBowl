import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { api } from '../config/api';
import { AuthShell } from '../features/auth/components/AuthShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell eyebrow="Recuperação segura" title="Esqueceu a senha?" description="Se a conta existir, enviaremos um link temporário e de uso único.">
            {sent ? (
                <div role="status" className="rounded-2xl border border-gruvbox-accent/25 bg-gruvbox-accent/10 p-5 text-sm leading-relaxed text-gruvbox-fg">
                    Confira sua caixa de entrada e o spam. Por segurança, a resposta é a mesma para qualquer e-mail.
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-5">
                    <Input label="E-mail" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
                    <Button type="submit" className="w-full" icon={<Mail size={17} />} disabled={loading}>
                        {loading ? 'Enviando…' : 'Enviar link seguro'}
                    </Button>
                </form>
            )}
            <Link to="/login" className="mt-6 block text-center text-sm text-gruvbox-primary hover:underline">Voltar ao login</Link>
        </AuthShell>
    );
}
