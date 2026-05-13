import type { StateCreator } from "zustand";
import type { Member } from "@/lib/types";
import { deleteMember, getMemberMe, listMembers, updateMember, updateMemberMe } from "@/lib/data";
import type { AuthSlice } from "./authSlice";

export type MembersSlice = {
  members: Member[];
  membersLoading: boolean;
  loadMembers: () => Promise<void>;
  updateMemberProfile: (id: string, payload: Partial<Member>) => Promise<Member | null>;
  removeMember: (id: string) => Promise<void>;
};

export const createMembersSlice: StateCreator<AuthSlice & MembersSlice, [], [], MembersSlice> = (
  set,
  get
) => ({
  members: [],
  membersLoading: false,
  loadMembers: async () => {
    set({ membersLoading: true });
    const role = get().role;
    const canListMembers = role === "admin" || role === "superadmin" || role === "treasurer";
    const data =
      canListMembers ? await listMembers() : [await getMemberMe()];
    set({ members: data, membersLoading: false });
  },
  updateMemberProfile: async (id, payload) => {
    const role = get().role;
    const canUpdateMembers = role === "admin" || role === "superadmin";
    const updated =
      canUpdateMembers
        ? await updateMember(id, payload)
        : await updateMemberMe(payload);
    if (!updated) return null;
    set({
      members: get().members.some((member) => member.id === updated.id)
        ? get().members.map((member) => (member.id === updated.id ? updated : member))
        : [updated, ...get().members],
    });
    return updated;
  },
  removeMember: async (id) => {
    await deleteMember(id);
    set({ members: get().members.filter((member) => member.id !== id) });
  },
});
