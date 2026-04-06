import type { StateCreator } from "zustand";
import type { Member } from "@/lib/types";
import { getMemberMe, listMembers, updateMember } from "@/lib/data";
import type { AuthSlice } from "./authSlice";

export type MembersSlice = {
  members: Member[];
  membersLoading: boolean;
  loadMembers: () => Promise<void>;
  updateMemberProfile: (id: string, payload: Partial<Member>) => Promise<void>;
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
    const updated = await updateMember(id, payload);
    if (!updated) return;
    set({
      members: get().members.map((member) => (member.id === id ? updated : member)),
    });
  },
});
