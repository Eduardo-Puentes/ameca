import type { StateCreator } from "zustand";
import type { BulkLink, EventRequest, Member, Section, SectionRequest } from "@/lib/types";
import {
  mockBulkLinks,
  mockEventRequests,
  mockMembers,
  mockSectionRequests,
  mockSections,
} from "@/lib/mockData";

export type AdminSlice = {
  eventRequests: EventRequest[];
  sectionRequests: SectionRequest[];
  sections: Section[];
  members: Member[];
  bulkLinks: BulkLink[];
  upgradeRequestsCount: number;
  approveEventRequest: (id: string, comments?: string) => void;
  denyEventRequest: (id: string, comments?: string) => void;
  approveSectionRequest: (id: string) => void;
  denySectionRequest: (id: string) => void;
  approveSection: (id: string) => void;
  denySection: (id: string) => void;
  toggleMemberVerification: (id: string) => void;
  disableBulkLink: (id: string) => void;
  createBulkLink: (payload: {
    eventId: string;
    orgName: string;
    maxUses: number;
    expiresAt: string;
  }) => BulkLink;
};

export const createAdminSlice: StateCreator<AdminSlice, [], [], AdminSlice> = (set, get) => ({
  eventRequests: mockEventRequests,
  sectionRequests: mockSectionRequests,
  sections: mockSections,
  members: mockMembers,
  bulkLinks: mockBulkLinks,
  upgradeRequestsCount: 4,
  approveEventRequest: (id, comments) =>
    set((state) => ({
      eventRequests: state.eventRequests.map((req) =>
        req.id === id ? { ...req, status: "approved", comments } : req
      ),
    })),
  denyEventRequest: (id, comments) =>
    set((state) => ({
      eventRequests: state.eventRequests.map((req) =>
        req.id === id ? { ...req, status: "denied", comments } : req
      ),
    })),
  approveSectionRequest: (id) =>
    set((state) => ({
      sectionRequests: state.sectionRequests.map((req) =>
        req.id === id ? { ...req, status: "approved" } : req
      ),
    })),
  denySectionRequest: (id) =>
    set((state) => ({
      sectionRequests: state.sectionRequests.map((req) =>
        req.id === id ? { ...req, status: "denied" } : req
      ),
    })),
  approveSection: (id) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, status: "approved" } : section
      ),
    })),
  denySection: (id) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, status: "denied" } : section
      ),
    })),
  toggleMemberVerification: (id) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === id ? { ...member, verified: !member.verified } : member
      ),
    })),
  disableBulkLink: (id) =>
    set((state) => ({
      bulkLinks: state.bulkLinks.map((link) =>
        link.id === id ? { ...link, usedCount: link.maxUses } : link
      ),
    })),
  createBulkLink: ({ eventId, orgName, maxUses, expiresAt }) => {
    const token = `BULK-${orgName.slice(0, 3).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    const link: BulkLink = {
      id: `bulk-${Date.now()}`,
      eventId,
      orgName,
      token,
      maxUses,
      usedCount: 0,
      expiresAt,
      createdByAdmin: "Ariana Torres",
    };
    set({ bulkLinks: [link, ...get().bulkLinks] });
    return link;
  },
});
