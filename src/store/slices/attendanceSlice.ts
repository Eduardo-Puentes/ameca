import type { StateCreator } from "zustand";
import type { AttendanceRecord } from "@/lib/types";
import { listAttendance, recordAttendanceScan, searchAttendance } from "@/lib/mock/api";

export type AttendanceSlice = {
  attendanceRecords: AttendanceRecord[];
  attendanceLoading: boolean;
  loadAttendance: (eventId?: string) => Promise<void>;
  searchRecords: (query: string) => Promise<void>;
  scanToken: (eventId: string, token: string, day: number) => Promise<AttendanceRecord>;
};

export const createAttendanceSlice: StateCreator<AttendanceSlice, [], [], AttendanceSlice> = (
  set,
  get
) => ({
  attendanceRecords: [],
  attendanceLoading: false,
  loadAttendance: async (eventId) => {
    set({ attendanceLoading: true });
    const data = await listAttendance(eventId);
    set({ attendanceRecords: data, attendanceLoading: false });
  },
  searchRecords: async (query) => {
    set({ attendanceLoading: true });
    const data = await searchAttendance(query);
    set({ attendanceRecords: data, attendanceLoading: false });
  },
  scanToken: async (eventId, token, day) => {
    const record = await recordAttendanceScan(eventId, token, day);
    set({ attendanceRecords: [record, ...get().attendanceRecords] });
    return record;
  },
});
