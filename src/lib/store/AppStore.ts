import { create } from "zustand";
import { createMemberSlice, type MemberSlice } from "./MemberSlice";

export type AppState = MemberSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createMemberSlice(...a),
}));