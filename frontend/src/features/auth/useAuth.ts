import { create } from 'zustand';
import { api } from '../../config/api';

interface User {
    id: string;
    email: string;
    nickname: string;
    bio?: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isHydrating: boolean;
    hydrate: () => Promise<void>;
    login: (user: User) => void;
    logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isHydrating: true,

    hydrate: async () => {
        try {
            const { data: user } = await api.get<User>('/users/me');
            set({ user, isAuthenticated: true, isHydrating: false });
        } catch {
            set({ user: null, isAuthenticated: false, isHydrating: false });
        }
    },

    login: (user) => {
        set({ user, isAuthenticated: true, isHydrating: false });
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            set({ user: null, isAuthenticated: false, isHydrating: false });
        }
    },
}));
