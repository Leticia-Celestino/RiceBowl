import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../config/api';
import { AuthShell } from '../features/auth/components/AuthShell';

export function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const [state, setState] = useState<'loading' | 'done' | 'error'>(token ? 'loading' : 'error');

    useEffect(() => {
        if (!token) return;
        void api.post('/auth/verify-email', { token })
            .then(() => setState('done'))
            .catch(() => setState('error'));
    }, [token]);

    return (
        <AuthShell eyebrow="Confirmação de conta" title={state === 'done' ? 'E-mail confirmado' : state === 'error' ? 'Link indisponível' : 'Confirmando…'} description={state === 'done' ? 'Sua conta está pronta para explorar e publicar.' : state === 'error' ? 'O link pode ter expirado ou já ter sido usado.' : 'Só um instante enquanto validamos seu link seguro.'}>
            <div role="status" className="rounded-2xl border border-gruvbox-gray/20 bg-gruvbox-bg/40 p-5 text-sm text-gruvbox-gray">
                {state === 'loading' && 'Validando token de uso único…'}
                {state === 'done' && <Link to="/login" className="font-medium text-gruvbox-primary hover:underline">Continuar para o login</Link>}
                {state === 'error' && <Link to="/login" className="font-medium text-gruvbox-primary hover:underline">Voltar e solicitar um novo link</Link>}
            </div>
        </AuthShell>
    );
}
