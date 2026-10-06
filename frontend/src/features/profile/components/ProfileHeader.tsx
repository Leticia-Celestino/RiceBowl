import { Image as ImageIcon, Star, User } from 'lucide-react';
import type { ReactNode } from 'react';

export interface UserProfile {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    bio: string | null;
    totalKarma: number;
    riceCount: number;
}

export function ProfileHeader({ profile }: { profile: UserProfile }) {
    return (
        <header className="relative flex flex-col items-center gap-6 overflow-hidden rounded-lg border border-gruvbox-gray/20 bg-gruvbox-bg/50 p-6 shadow-md backdrop-blur-md md:flex-row md:items-start">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gruvbox-primary/5 blur-3xl" />
            <div className="z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gruvbox-primary/50 bg-gruvbox-bg shadow-lg">
                {profile.avatarUrl
                    ? <img src={profile.avatarUrl} alt={profile.nickname} className="h-full w-full object-cover" />
                    : <User size={40} className="text-gruvbox-gray" aria-hidden="true" />}
            </div>
            <div className="z-10 flex w-full flex-grow flex-col text-center md:text-left">
                <h1 className="mb-1 font-sans text-3xl font-bold text-gruvbox-fg">@{profile.nickname}</h1>
                <p className="max-w-2xl whitespace-pre-wrap font-sans text-sm text-gruvbox-fg/80">
                    {profile.bio || 'Nenhuma biografia fornecida. Apenas dotfiles.'}
                </p>
                <dl className="mt-6 flex justify-center gap-6 border-t border-gruvbox-gray/10 pt-4 md:justify-start">
                    <ProfileStat icon={<ImageIcon size={18} />} label="Setups" value={profile.riceCount} tone="accent" />
                    <ProfileStat icon={<Star size={18} />} label="Karma" value={profile.totalKarma} tone="yellow" />
                </dl>
            </div>
        </header>
    );
}

function ProfileStat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: 'accent' | 'yellow' }) {
    return (
        <div className="flex items-center gap-2">
            <span className={tone === 'accent' ? 'text-gruvbox-accent' : 'text-gruvbox-yellow'}>{icon}</span>
            <div className="flex flex-col">
                <dt className="font-mono text-xs uppercase tracking-wider text-gruvbox-gray">{label}</dt>
                <dd className="text-lg font-bold leading-none text-gruvbox-fg">{value}</dd>
            </div>
        </div>
    );
}
