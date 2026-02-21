import type { StateCreator } from "zustand";
import type { Member } from "@/lib/types";
import { listMembers, updateMember } from "@/lib/mock/api";

export type MembersSlice = {
  members: Member[];
  membersLoading: boolean;
  loadMembers: () => Promise<void>;
  updateMemberProfile: (id: string, payload: Partial<Member>) => Promise<void>;
};

export const createMembersSlice: StateCreator<MembersSlice, [], [], MembersSlice> = (set, get) => ({
  members: [],
  membersLoading: false,
  loadMembers: async () => {
    set({ membersLoading: true });
    const data = await listMembers();
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
