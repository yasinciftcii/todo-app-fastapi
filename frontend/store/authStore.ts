// frontend/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: any | null;       // Kullanıcı bilgisi
  token: string | null;   // Backend'e göndereceğimiz token
    login: (user: any, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,

    login: (user, token) => {
    // Token'ı localStorage'a da kaydedelim ki sayfa yenilenince gitmesin
    localStorage.setItem('token', token);
    set({ user, token });
    },

    logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    },
}));