import type { StateCreator } from "zustand";
import type { BulkValidation, MemberProfile, RegistrationStatus } from "@/lib/types";
import { mockMemberProfile, mockRegistrationStatus } from "@/lib/mockData";

export type MemberSlice = {
  profile: MemberProfile;
  registrationStatus: RegistrationStatus;
  bulkValidation: BulkValidation | null;
  qrToken: string | null;
  requestRegistration: () => void;
  setRegistrationStatus: (status: RegistrationStatus) => void;
  updateProfile: (updates: Partial<MemberProfile>) => void;
  validateBulkLink: (token: string, email: string) => void;
  registerViaBulkLink: () => void;
  setQrToken: (token: string | null) => void;
};

export const createMemberSlice: StateCreator<MemberSlice, [], [], MemberSlice> = (set, get) => ({
  profile: mockMemberProfile,
  registrationStatus: mockRegistrationStatus,
  bulkValidation: null,
  qrToken: "QR-AMECA-2026-014",
  requestRegistration: () =>
    set({
      registrationStatus: { status: "pending", comments: "Enviado para revisión." },
    }),
  setRegistrationStatus: (status) => set({ registrationStatus: status }),
  updateProfile: (updates) =>
    set((state) => ({ profile: { ...state.profile, ...updates } })),
  validateBulkLink: (token, email) => {
    const allowed = email.endsWith("@uni.edu");
    set({
      bulkValidation: {
        token,
        valid: token.trim().length > 5,
        allowed,
        message: allowed
          ? "Enlace validado para tu organización."
          : "El email no está en la lista permitida.",
        orgName: "Northview University",
      },
    });
  },
  registerViaBulkLink: () =>
    set({
      registrationStatus: { status: "pending", comments: "Registro masivo enviado." },
    }),
  setQrToken: (token) => set({ qrToken: token }),
});
