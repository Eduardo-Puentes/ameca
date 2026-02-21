import {StateCreator} from "zustand";
import axios from "axios";
import { parseOrThrow } from "../Parse";

import { 
    MemberSummaryArraySchema,
    MemberSummarySchema, type MemberSummary, DEFAULT_MEMBER_SUMMARY,
    MemberDetailSchema, type MemberDetail, DEFAULT_MEMBER_DETAIL
} from "../schemas/MemberSchemas";

import { fetchMemberByIdService, fetchMembersService } from "../handlers/MemberHandlers";

export type MemberSlice = {
    members: MemberSummary[];
    selectedMember: MemberDetail;
    isLoading: boolean;
    error?: string;

    fetchMembers: () => Promise<void>;
    fetchMemberById: (id: number) => Promise<void>;
    clearSelectedMember: () => void;
}

export const createMemberSlice: StateCreator<MemberSlice, [], [], MemberSlice> = (set) => ({
    members: [],
    selectedMember: DEFAULT_MEMBER_DETAIL,
    isLoading: false, 
    error: undefined,

    fetchMembers: async () => {
        set({ isLoading: true, error: undefined });
        try {
            const members = await fetchMembersService();
            set({ members, isLoading: false });
        } catch (err) {
            set({
                isLoading: false,
                error: err instanceof Error ? err.message : "Failed to fetch members",
            });
        }
    },

    fetchMemberById: async (id: number) => {
        set({ isLoading: true, error: undefined });

        try {
            const selectedMember = await fetchMemberByIdService(id);
            set({selectedMember, isLoading: false});
        } catch (err) {
            set({
                isLoading: false,
                error: err instanceof Error ? err.message : "Failed to fetch selected member",
            });
        }
    },

    clearSelectedMember: () => set({ selectedMember: DEFAULT_MEMBER_DETAIL }),
});