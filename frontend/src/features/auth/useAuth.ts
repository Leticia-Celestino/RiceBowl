import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    nickname: string;
    bio?: string | null;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
    const storedToken = localStorage.getItem('@ricebowl:token');
    const storedUser = localStorage.getItem('@ricebowl:user');

    return {
    token: storedToken,
    user: storedToken && storedUser ? JSON.parse(storedUser) as User : null,
    isAuthenticated: Boolean(storedToken && storedUser),

    login: (token, user) => {
        localStorage.setItem('@ricebowl:token', token);
        localStorage.setItem('@ricebowl:user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('@ricebowl:token');
        localStorage.removeItem('@ricebowl:user');
        set({ token: null, user: null, isAuthenticated: false });
    },
    };
});
