import type { StateCreator } from "zustand";
import type { Member } from "@/lib/types";
import { deleteMember, getMemberMe, listMembers, updateMember, updateMemberMe } from "@/lib/data";
import type { AuthSlice } from "./authSlice";

export type MembersSlice = {
  members: Member[];
  membersLoading: boolean;
  loadMembers: () => Promise<void>;
  updateMemberProfile: (id: string, payload: Partial<Member>) => Promise<void>;
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
    const data =
      role === "admin" || role === "superadmin" ? await listMembers() : [await getMemberMe()];
    set({ members: data, membersLoading: false });
  },
  updateMemberProfile: async (id, payload) => {
    const role = get().role;
    const updated =
      role === "admin" || role === "superadmin"
        ? await updateMember(id, payload)
        : await updateMemberMe(payload);
    if (!updated) return;
    set({
      members: get().members.map((member) => (member.id === id ? updated : member)),
    });
  },
  removeMember: async (id) => {
    await deleteMember(id);
    set({ members: get().members.filter((member) => member.id !== id) });
  },
});
