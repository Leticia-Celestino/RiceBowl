import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    nickname: string;
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


    return {
    token: storedToken,
    user: storedToken ? { id: '1', email: 'leticia@rice.bowl', nickname: 'leticia' } : null,
    isAuthenticated: !!storedToken,

    login: (token, user) => {
        localStorage.setItem('@ricebowl:token', token);
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('@ricebowl:token');
        set({ token: null, user: null, isAuthenticated: false });
    },
    };
});