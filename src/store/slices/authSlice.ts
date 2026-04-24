import type { StateCreator } from "zustand";
import type { Role, User } from "@/lib/types";
import {
  authLogin,
  authLoginWithCredentials,
  authMe,
  authRegister,
  authLogout,
} from "@/lib/data";
import { tokenStorage } from "@/lib/authStorage";

export type AuthSlice = {
  user: User | null;
  token: string | null;
  role: Role | null;
  authLoading: boolean;
  authReady: boolean;
  loginAs: (role: Role) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  registerMember: (payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => Promise<User>;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  token: null,
  role: null,
  authLoading: false,
  authReady: false,
  loginAs: async (role) => {
    set({ authLoading: true });
    try {
      const response = await authLogin(role);
      tokenStorage.set(response.token);
      set({
        user: response.user,
        token: response.token,
        role: response.user.role,
        authLoading: false,
        authReady: true,
      });
    } catch (error) {
      set({ authLoading: false, authReady: true });
      throw error;
    }
  },
  loginWithCredentials: async (email, password) => {
    set({ authLoading: true });
    try {
      const response = await authLoginWithCredentials(email, password);
      tokenStorage.set(response.token);
      set({
        user: response.user,
        token: response.token,
        role: response.user.role,
        authLoading: false,
        authReady: true,
      });
      return response.user;
    } catch (error) {
      set({ authLoading: false, authReady: true });
      throw error;
    }
  },
  registerMember: async (payload) => {
    set({ authLoading: true });
    try {
      const response = await authRegister(payload);
      tokenStorage.set(response.token);
      set({
        user: response.user,
        token: response.token,
        role: response.user.role,
        authLoading: false,
        authReady: true,
      });
      return response.user;
    } catch (error) {
      set({ authLoading: false, authReady: true });
      throw error;
    }
  },
  hydrateSession: async () => {
    const token = tokenStorage.get();
    try {
      const user = await authMe();
      set({ user, token, role: user.role, authReady: true });
    } catch {
      tokenStorage.clear();
      set({ user: null, token: null, role: null, authReady: true });
    }
  },
  logout: async () => {
    try {
      await authLogout();
    } catch {
      // Clear local state even if the server-side cookie is already gone.
    }
    tokenStorage.clear();
    set({ user: null, token: null, role: null, authReady: true });
  },
});
