import type { StateCreator } from "zustand";
import type { BulkLink, BulkTier } from "@/lib/types";
import {
  createBulkLink,
  listBulkLinks,
  listBulkTiers,
  registerViaBulk,
  saveBulkTiers,
  sendBulkInvites,
  validateBulkToken,
} from "@/lib/data";

export type BulkSlice = {
  bulkLinks: BulkLink[];
  bulkTiers: BulkTier[];
  validation: {
    valid: boolean;
    message: string;
    orgName?: string;
    discountPercent?: number;
  } | null;
  bulkLoading: boolean;
  loadBulkLinks: (eventId?: string) => Promise<void>;
  loadBulkTiers: (eventId: string) => Promise<void>;
  saveTiers: (eventId: string, tiers: BulkTier[]) => Promise<void>;
  createLink: (
    eventId: string,
    payload: Partial<BulkLink> & { allowedEmails?: string[] }
  ) => Promise<BulkLink>;
  sendInvites: (bulkId: string) => Promise<void>;
  validateToken: (token: string) => Promise<void>;
  registerWithToken: (token: string) => Promise<{ status: string; message: string }>;
};

export const createBulkSlice: StateCreator<BulkSlice, [], [], BulkSlice> = (set, get) => ({
  bulkLinks: [],
  bulkTiers: [],
  validation: null,
  bulkLoading: false,
  loadBulkLinks: async (eventId) => {
    set({ bulkLoading: true });
    const data = await listBulkLinks(eventId);
    set({ bulkLinks: data, bulkLoading: false });
  },
  loadBulkTiers: async (eventId) => {
    const data = await listBulkTiers(eventId);
    set({ bulkTiers: data });
  },
  saveTiers: async (eventId, tiers) => {
    const saved = await saveBulkTiers(eventId, tiers);
    set({ bulkTiers: saved });
  },
  createLink: async (eventId, payload) => {
    const created = await createBulkLink(eventId, payload);
    set({ bulkLinks: [created, ...get().bulkLinks] });
    return created;
  },
  sendInvites: async (bulkId) => {
    await sendBulkInvites(bulkId);
  },
  validateToken: async (token) => {
    const result = await validateBulkToken(token);
    set({ validation: result });
  },
  registerWithToken: async (token) => {
    return registerViaBulk(token);
  },
});
