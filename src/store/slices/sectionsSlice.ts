import type { StateCreator } from "zustand";
import type { PaginatedResponse, Section, SectionRequest } from "@/lib/types";
import {
  approveSectionRequest,
  denySectionRequest,
  deleteSection,
  listAdminSections,
  listSectionRequests,
  listSections,
  updateSection,
} from "@/lib/data";

export type SectionRequestReviewStatus = "pending" | "rejected";

const ensureArray = <T>(value: T[] | PaginatedResponse<T>): T[] =>
  Array.isArray(value) ? value : value.items;

export type SectionsSlice = {
  sections: Section[];
  sectionRequests: SectionRequest[];
  sectionsPage: number;
  sectionsTotal: number;
  sectionsQuery: string;
  sectionRequestsPage: number;
  sectionRequestsTotal: number;
  sectionRequestsQuery: string;
  sectionRequestsStatus: SectionRequestReviewStatus;
  sectionsLoading: boolean;
  loadSections: (eventId?: string) => Promise<void>;
  loadAdminSections: (page?: number, query?: string) => Promise<void>;
  loadSectionRequests: (
    page?: number,
    query?: string,
    status?: SectionRequestReviewStatus
  ) => Promise<void>;
  approveSectionCreation: (id: string) => Promise<void>;
  rejectSectionCreation: (id: string) => Promise<void>;
  updateSectionStatus: (id: string, status: Section["status"]) => Promise<void>;
  deleteSectionById: (id: string) => Promise<void>;
};

export const createSectionsSlice: StateCreator<SectionsSlice, [], [], SectionsSlice> = (set, get) => ({
  sections: [],
  sectionRequests: [],
  sectionsPage: 1,
  sectionsTotal: 0,
  sectionsQuery: "",
  sectionRequestsPage: 1,
  sectionRequestsTotal: 0,
  sectionRequestsQuery: "",
  sectionRequestsStatus: "pending",
  sectionsLoading: false,
  loadSections: async (eventId) => {
    set({ sectionsLoading: true });
    const data = await listSections(eventId);
    set({ sections: data, sectionsLoading: false });
  },
  loadAdminSections: async (page, query) => {
    set({ sectionsLoading: true });
    const requestedPage = page ?? get().sectionsPage;
    const requestedQuery = query ?? get().sectionsQuery;
    const result = await listAdminSections(requestedQuery, requestedPage, 20, "approved");
    set({
      sections: result.items,
      sectionsPage: result.page,
      sectionsTotal: result.total,
      sectionsQuery: requestedQuery,
      sectionsLoading: false,
    });
  },
  loadSectionRequests: async (page, query, status) => {
    set({ sectionsLoading: true });
    const requestedPage = page ?? get().sectionRequestsPage;
    const requestedQuery = query ?? get().sectionRequestsQuery;
    const requestedStatus = status ?? get().sectionRequestsStatus;
    const result = await listSectionRequests(requestedQuery, requestedPage, 20, requestedStatus);
    const data = ensureArray(result);
    set({
      sectionRequests: data,
      sectionRequestsPage: Array.isArray(result) ? 1 : result.page,
      sectionRequestsTotal: Array.isArray(result) ? data.length : result.total,
      sectionRequestsQuery: requestedQuery,
      sectionRequestsStatus: requestedStatus,
      sectionsLoading: false,
    });
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
