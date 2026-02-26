import type { StateCreator } from "zustand";
import type { DiplomaRecord, DiplomaTemplate } from "@/lib/types";
import {
  computeAttendanceSummary,
  generateDiplomas,
  getDiplomaTemplate,
  listDiplomasByEvent,
  listMyDiplomas,
  saveDiplomaTemplate,
  sendDiplomaRecord,
  sendDiplomas,
} from "@/lib/data";

export type AttendanceSummary = {
  attendedDaysByMember: Record<string, number>;
  totalAttendees: number;
};

export type DiplomasSlice = {
  templateByEvent: Record<string, DiplomaTemplate | null>;
  recordsByEvent: Record<string, DiplomaRecord[]>;
  myDiplomas: DiplomaRecord[];
  attendanceSummaryByEvent: Record<string, AttendanceSummary>;
  diplomasLoading: boolean;
  loadTemplate: (eventId: string) => Promise<void>;
  saveTemplate: (eventId: string, template: DiplomaTemplate, assetFile?: File | null) => Promise<void>;
  loadAttendanceSummary: (eventId: string) => Promise<void>;
  loadEventDiplomas: (eventId: string) => Promise<void>;
  generateForEvent: (eventId: string, minRequiredDays: number) => Promise<void>;
  sendForEvent: (eventId: string) => Promise<void>;
  sendRecord: (recordId: string, eventId: string) => Promise<void>;
  loadMyDiplomas: (memberId: string) => Promise<void>;
};

export const createDiplomasSlice: StateCreator<DiplomasSlice, [], [], DiplomasSlice> = (
  set,
  get
) => ({
  templateByEvent: {},
  recordsByEvent: {},
  myDiplomas: [],
  attendanceSummaryByEvent: {},
  diplomasLoading: false,
  loadTemplate: async (eventId) => {
    set({ diplomasLoading: true });
    const template = await getDiplomaTemplate(eventId);
    set((state) => ({
      templateByEvent: { ...state.templateByEvent, [eventId]: template },
      diplomasLoading: false,
    }));
  },
  saveTemplate: async (eventId, template, assetFile) => {
    set({ diplomasLoading: true });
    const saved = await saveDiplomaTemplate(eventId, template, assetFile);
    set((state) => ({
      templateByEvent: { ...state.templateByEvent, [eventId]: saved },
      diplomasLoading: false,
    }));
  },
  loadAttendanceSummary: async (eventId) => {
    const summary = await computeAttendanceSummary(eventId);
    set((state) => ({
      attendanceSummaryByEvent: { ...state.attendanceSummaryByEvent, [eventId]: summary },
    }));
  },
  loadEventDiplomas: async (eventId) => {
    set({ diplomasLoading: true });
    const records = await listDiplomasByEvent(eventId);
    set((state) => ({
      recordsByEvent: { ...state.recordsByEvent, [eventId]: records },
      diplomasLoading: false,
    }));
  },
  generateForEvent: async (eventId, minRequiredDays) => {
    set({ diplomasLoading: true });
    const records = await generateDiplomas(eventId, minRequiredDays);
    set((state) => ({
      recordsByEvent: { ...state.recordsByEvent, [eventId]: records },
      diplomasLoading: false,
    }));
  },
  sendForEvent: async (eventId) => {
    set({ diplomasLoading: true });
    const records = await sendDiplomas(eventId);
    set((state) => ({
      recordsByEvent: { ...state.recordsByEvent, [eventId]: records },
      diplomasLoading: false,
    }));
  },
  sendRecord: async (recordId, eventId) => {
    const updated = await sendDiplomaRecord(recordId);
    if (!updated) return;
    const records = get().recordsByEvent[eventId] ?? [];
    set((state) => ({
      recordsByEvent: {
        ...state.recordsByEvent,
        [eventId]: records.map((record) => (record.id === recordId ? updated : record)),
      },
    }));
  },
  loadMyDiplomas: async (memberId) => {
    set({ diplomasLoading: true });
    const records = await listMyDiplomas(memberId);
    set({ myDiplomas: records, diplomasLoading: false });
  },
});
