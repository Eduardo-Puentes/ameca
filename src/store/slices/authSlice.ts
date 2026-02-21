import type { StateCreator } from "zustand";
import type { Role, User } from "@/lib/types";
import { authLogin } from "@/lib/mock/api";

export type AuthSlice = {
  user: User | null;
  token: string | null;
  role: Role | null;
  authLoading: boolean;
  loginAs: (role: Role) => Promise<void>;
  logout: () => void;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  token: null,
  role: null,
  authLoading: false,
  loginAs: async (role) => {
    set({ authLoading: true });
    const response = await authLogin(role);
    set({
      user: response.user,
      token: response.token,
      role: response.user.role,
      authLoading: false,
    });
  },
  logout: () => set({ user: null, token: null, role: null }),
});
