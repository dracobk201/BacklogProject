import { create } from 'zustand';

interface AuthUIState {
    isLoginModalOpen: boolean;
    setLoginModalOpen: (isOpen: boolean) => void;
}

// Zustand store example for Auth UI state
export const useAuthUIStore = create<AuthUIState>((set) => ({
    isLoginModalOpen: false,
    setLoginModalOpen: (isOpen: boolean) => set({ isLoginModalOpen: isOpen })
}));
