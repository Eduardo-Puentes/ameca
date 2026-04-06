import type { StateCreator } from "zustand";
import type { EventRequest, MembershipRequest } from "@/lib/types";
import type { AuthSlice } from "./authSlice";
import {
  approveEventRequest,
  approveMemberRequest,
  createMembershipUpgradeRequest,
  createEventRequest,
  denyEventRequest,
  denyMemberRequest,
  listEventRequests,
  listMyEventRequests,
  listMembershipUpgradeRequests,
  listMemberRequests,
} from "@/lib/data";

export type RequestsSlice = {
  membershipRequests: MembershipRequest[];
  eventRequests: EventRequest[];
  requestsLoading: boolean;
  loadMembershipRequests: () => Promise<void>;
  createMembershipRequest: (profileType: string, paymentProof?: File | null) => Promise<void>;
  loadEventRequests: (eventId: string) => Promise<void>;
  createMemberEventRequest: (
    payload: Partial<EventRequest> & { paymentProofFile?: File | null }
  ) => Promise<EventRequest>;
  approveMembershipRequest: (id: string, comments?: string) => Promise<void>;
  rejectMembershipRequest: (id: string, comments?: string) => Promise<void>;
  approveEventRegistration: (id: string, comments?: string) => Promise<void>;
  rejectEventRegistration: (id: string, comments?: string) => Promise<void>;
};

export const createRequestsSlice: StateCreator<AuthSlice & RequestsSlice, [], [], RequestsSlice> = (
  set,
  get
) => ({
  membershipRequests: [],
  eventRequests: [],
  requestsLoading: false,
  loadMembershipRequests: async () => {
    set({ requestsLoading: true });
    const role = get().role;
    const data =
      role === "admin" || role === "superadmin"
        ? await listMemberRequests()
        : await listMembershipUpgradeRequests();
    set({ membershipRequests: data, requestsLoading: false });
  },
  createMembershipRequest: async (profileType, paymentProof) => {
    set({ requestsLoading: true });
    await createMembershipUpgradeRequest(profileType, paymentProof);
    const data = await listMembershipUpgradeRequests();
    set({ membershipRequests: data, requestsLoading: false });
  },
  loadEventRequests: async (eventId) => {
    set({ requestsLoading: true });
    const role = get().role;
    const data =
      role === "admin" || role === "superadmin"
        ? await listEventRequests(eventId)
        : await listMyEventRequests(eventId);
    set({ eventRequests: data, requestsLoading: false });
  },
  createMemberEventRequest: async (payload) => {
    const created = await createEventRequest(payload);
    set({ eventRequests: [created, ...get().eventRequests] });
    return created;
  },
  approveMembershipRequest: async (id, comments) => {
    const updated = await approveMemberRequest(id, comments);
    if (!updated) return;
    set({
      membershipRequests: get().membershipRequests.map((req) =>
        req.id === id ? updated : req
      ),
    });
  },
  rejectMembershipRequest: async (id, comments) => {
    const updated = await denyMemberRequest(id, comments);
    if (!updated) return;
    set({
      membershipRequests: get().membershipRequests.map((req) =>
        req.id === id ? updated : req
      ),
    });
  },
  approveEventRegistration: async (id, comments) => {
    const updated = await approveEventRequest(id, comments);
    if (!updated) return;
    set({ eventRequests: get().eventRequests.map((req) => (req.id === id ? updated : req)) });
  },
  rejectEventRegistration: async (id, comments) => {
    const updated = await denyEventRequest(id, comments);
    if (!updated) return;
    set({ eventRequests: get().eventRequests.map((req) => (req.id === id ? updated : req)) });
  },
});
