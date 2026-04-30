import type { StateCreator } from "zustand";
import type { Section, SectionRequest } from "@/lib/types";
import {
  approveSectionRequest,
  denySectionRequest,
  deleteSection,
  listSectionRequests,
  listSections,
  updateSection,
} from "@/lib/data";

export type SectionsSlice = {
  sections: Section[];
  sectionRequests: SectionRequest[];
  sectionsLoading: boolean;
  loadSections: (eventId?: string) => Promise<void>;
  loadSectionRequests: () => Promise<void>;
  approveSectionCreation: (id: string) => Promise<void>;
  rejectSectionCreation: (id: string) => Promise<void>;
  updateSectionStatus: (id: string, status: Section["status"]) => Promise<void>;
  deleteSectionById: (id: string) => Promise<void>;
};

export const createSectionsSlice: StateCreator<SectionsSlice, [], [], SectionsSlice> = (set, get) => ({
  sections: [],
  sectionRequests: [],
  sectionsLoading: false,
  loadSections: async (eventId) => {
    set({ sectionsLoading: true });
    const data = await listSections(eventId);
    set({ sections: data, sectionsLoading: false });
  },
  loadSectionRequests: async () => {
    set({ sectionsLoading: true });
    const data = await listSectionRequests();
    set({ sectionRequests: data, sectionsLoading: false });
  },
  approveSectionCreation: async (id) => {
    const updated = await approveSectionRequest(id);
    if (!updated) return;
    set({
      sectionRequests: get().sectionRequests.map((req) => (req.id === id ? updated : req)),
    });
  },
  rejectSectionCreation: async (id) => {
    const updated = await denySectionRequest(id);
    if (!updated) return;
    set({
      sectionRequests: get().sectionRequests.map((req) => (req.id === id ? updated : req)),
    });
  },
  updateSectionStatus: async (id, status) => {
    const updated = await updateSection(id, { status });
    if (!updated) return;
    set({ sections: get().sections.map((sec) => (sec.id === id ? updated : sec)) });
  },
  deleteSectionById: async (id) => {
    await deleteSection(id);
    set({ sections: get().sections.filter((sec) => sec.id !== id) });
  },
});
