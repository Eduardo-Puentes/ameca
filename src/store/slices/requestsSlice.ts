import type { StateCreator } from "zustand";
import type {
  CostType,
  EventRequest,
  MembershipRequest,
  RequestStatusCounts,
  RequestStatusFilter,
} from "@/lib/types";
import type { AuthSlice } from "./authSlice";
import {
  approveEventRequest,
  approveMemberRequest,
  createMembershipUpgradeRequest,
  createEventRequest,
  denyEventRequest,
  denyMemberRequest,
  listAdminEventRequests,
  listEventRequests,
  listMyEventRequests,
  listMembershipUpgradeRequests,
  listMemberRequests,
} from "@/lib/data";

const EMPTY_STATUS_COUNTS: RequestStatusCounts = { pending: 0, approved: 0, rejected: 0 };

const getStatusCounts = <T extends { status: "pending" | "approved" | "rejected" }>(
  items: T[]
): RequestStatusCounts => ({
  pending: items.filter((item) => item.status === "pending").length,
  approved: items.filter((item) => item.status === "approved").length,
  rejected: items.filter((item) => item.status === "rejected").length,
});

const ensureArray = <T>(value: T[] | { items?: T[] } | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

export type RequestsSlice = {
  membershipRequests: MembershipRequest[];
  eventRequests: EventRequest[];
  membershipRequestsPage: number;
  membershipRequestsTotal: number;
  membershipRequestStatusCounts: RequestStatusCounts;
  membershipRequestsQuery: string;
  membershipRequestsCostType: CostType;
  membershipRequestsStatus: RequestStatusFilter;
  eventRequestsPage: number;
  eventRequestsTotal: number;
  eventRequestStatusCounts: RequestStatusCounts;
  eventRequestsQuery: string;
  eventRequestsCostType: CostType;
  dashboardEventRequests: EventRequest[];
  dashboardEventRequestsPage: number;
  dashboardEventRequestsTotal: number;
  dashboardEventRequestStatusCounts: RequestStatusCounts;
  dashboardEventRequestsQuery: string;
  dashboardEventRequestsCostType: CostType;
  dashboardEventRequestsEventId: string | null;
  requestPageSize: number;
  requestsLoading: boolean;
  currentEventRequestsEventId: string | null;
  loadMembershipRequests: (
    page?: number,
    query?: string,
    costType?: CostType,
    status?: RequestStatusFilter
  ) => Promise<void>;
  loadDashboardEventRequests: (
    eventId?: string | null,
    page?: number,
    query?: string,
    costType?: CostType
  ) => Promise<void>;
  createMembershipRequest: (
    profileType: string,
    paymentProof?: File | null,
    schoolIdentification?: File | null
  ) => Promise<void>;
  loadEventRequests: (
    eventId: string,
    page?: number,
    query?: string,
    costType?: CostType
  ) => Promise<void>;
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
  membershipRequestsPage: 1,
  membershipRequestsTotal: 0,
  membershipRequestStatusCounts: EMPTY_STATUS_COUNTS,
  membershipRequestsQuery: "",
  membershipRequestsCostType: "all",
  membershipRequestsStatus: "pending",
  eventRequestsPage: 1,
  eventRequestsTotal: 0,
  eventRequestStatusCounts: EMPTY_STATUS_COUNTS,
  eventRequestsQuery: "",
  eventRequestsCostType: "all",
  dashboardEventRequests: [],
  dashboardEventRequestsPage: 1,
  dashboardEventRequestsTotal: 0,
  dashboardEventRequestStatusCounts: EMPTY_STATUS_COUNTS,
  dashboardEventRequestsQuery: "",
  dashboardEventRequestsCostType: "all",
  dashboardEventRequestsEventId: null,
  requestPageSize: 20,
  requestsLoading: false,
  currentEventRequestsEventId: null,
  loadMembershipRequests: async (page, query, costType, status) => {
    set({ requestsLoading: true });
    const role = get().role;
    const requestedPage = page ?? get().membershipRequestsPage;
    const requestedQuery = query ?? get().membershipRequestsQuery;
    const requestedCostType = costType ?? get().membershipRequestsCostType;
    const requestedStatus = status ?? get().membershipRequestsStatus;
    if (role === "admin" || role === "treasurer" || role === "superadmin") {
      const result = await listMemberRequests(
        requestedQuery,
        requestedPage,
        get().requestPageSize,
        requestedCostType,
        requestedStatus
      );
      set({
        membershipRequests: result.items,
        membershipRequestsPage: result.page,
        membershipRequestsTotal: result.total,
        membershipRequestsQuery: requestedQuery,
        membershipRequestsCostType: requestedCostType,
        membershipRequestsStatus: requestedStatus,
        membershipRequestStatusCounts: result.statusCounts ?? EMPTY_STATUS_COUNTS,
        requestsLoading: false,
      });
      return;
    }
    const data = ensureArray(await listMembershipUpgradeRequests());
    set({
      membershipRequests: data,
      membershipRequestsPage: 1,
      membershipRequestsTotal: data.length,
      membershipRequestsQuery: "",
      membershipRequestsCostType: "all",
      membershipRequestsStatus: "pending",
      membershipRequestStatusCounts: getStatusCounts(data),
      requestsLoading: false,
    });
  },
  loadDashboardEventRequests: async (eventId, page, query, costType) => {
    set({ requestsLoading: true });
    const requestedEventId =
      eventId === undefined ? get().dashboardEventRequestsEventId : eventId;
    const requestedPage = page ?? get().dashboardEventRequestsPage;
    const requestedQuery = query ?? get().dashboardEventRequestsQuery;
    const requestedCostType = costType ?? get().dashboardEventRequestsCostType;
    const result = requestedEventId
      ? await listEventRequests(
          requestedEventId,
          undefined,
          requestedQuery,
          requestedPage,
          get().requestPageSize,
          requestedCostType
        )
      : await listAdminEventRequests(
          undefined,
          requestedQuery,
          requestedPage,
          get().requestPageSize,
          requestedCostType
        );
    set({
      dashboardEventRequests: result.items,
      dashboardEventRequestsPage: result.page,
      dashboardEventRequestsTotal: result.total,
      dashboardEventRequestsQuery: requestedQuery,
      dashboardEventRequestsCostType: requestedCostType,
      dashboardEventRequestsEventId: requestedEventId,
      dashboardEventRequestStatusCounts: result.statusCounts ?? EMPTY_STATUS_COUNTS,
      requestsLoading: false,
    });
  },
  createMembershipRequest: async (profileType, paymentProof, schoolIdentification) => {
    set({ requestsLoading: true });
    await createMembershipUpgradeRequest(profileType, paymentProof, schoolIdentification);
    const data = ensureArray(await listMembershipUpgradeRequests());
    set({
      membershipRequests: data,
      membershipRequestsPage: 1,
      membershipRequestsTotal: data.length,
      membershipRequestStatusCounts: getStatusCounts(data),
      requestsLoading: false,
    });
  },
  loadEventRequests: async (eventId, page, query, costType) => {
    set({ requestsLoading: true });
    const role = get().role;
    const requestedPage = page ?? get().eventRequestsPage;
    const requestedQuery = query ?? get().eventRequestsQuery;
    const requestedCostType = costType ?? get().eventRequestsCostType;
    if (role === "admin" || role === "treasurer" || role === "superadmin") {
      const result = await listEventRequests(
        eventId,
        undefined,
        requestedQuery,
        requestedPage,
        get().requestPageSize,
        requestedCostType
      );
      set({
        eventRequests: result.items,
        eventRequestsPage: result.page,
        eventRequestsTotal: result.total,
        eventRequestsQuery: requestedQuery,
        eventRequestsCostType: requestedCostType,
        eventRequestStatusCounts: result.statusCounts ?? EMPTY_STATUS_COUNTS,
        currentEventRequestsEventId: eventId,
        requestsLoading: false,
      });
      return;
    }
    const data = ensureArray(await listMyEventRequests(eventId));
    set({
      eventRequests: data,
      eventRequestsPage: 1,
      eventRequestsTotal: data.length,
      eventRequestsQuery: "",
      eventRequestsCostType: "all",
      eventRequestStatusCounts: getStatusCounts(data),
      currentEventRequestsEventId: eventId,
      requestsLoading: false,
    });
  },
  createMemberEventRequest: async (payload) => {
    const created = await createEventRequest(payload);
    set({ eventRequests: [created, ...get().eventRequests] });
    return created;
  },
  approveMembershipRequest: async (id, comments) => {
    const updated = await approveMemberRequest(id, comments);
    if (!updated) return;
    await get().loadMembershipRequests(
      get().membershipRequestsPage,
      get().membershipRequestsQuery,
      get().membershipRequestsCostType,
      get().membershipRequestsStatus
    );
  },
  rejectMembershipRequest: async (id, comments) => {
    const updated = await denyMemberRequest(id, comments);
    if (!updated) return;
    await get().loadMembershipRequests(
      get().membershipRequestsPage,
      get().membershipRequestsQuery,
      get().membershipRequestsCostType,
      get().membershipRequestsStatus
    );
  },
  approveEventRegistration: async (id, comments) => {
    const updated = await approveEventRequest(id, comments);
    if (!updated) return;
    await get().loadDashboardEventRequests(
      get().dashboardEventRequestsEventId,
      get().dashboardEventRequestsPage,
      get().dashboardEventRequestsQuery,
      get().dashboardEventRequestsCostType
    );
    const eventId = get().currentEventRequestsEventId;
    if (eventId) {
      await get().loadEventRequests(
        eventId,
        get().eventRequestsPage,
        get().eventRequestsQuery,
        get().eventRequestsCostType
      );
    }
  },
  rejectEventRegistration: async (id, comments) => {
    const updated = await denyEventRequest(id, comments);
    if (!updated) return;
    await get().loadDashboardEventRequests(
      get().dashboardEventRequestsEventId,
      get().dashboardEventRequestsPage,
      get().dashboardEventRequestsQuery,
      get().dashboardEventRequestsCostType
    );
    const eventId = get().currentEventRequestsEventId;
    if (eventId) {
      await get().loadEventRequests(
        eventId,
        get().eventRequestsPage,
        get().eventRequestsQuery,
        get().eventRequestsCostType
      );
    }
  },
});
