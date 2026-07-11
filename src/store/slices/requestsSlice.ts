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
const toEventQueueStatus = (status: RequestStatusFilter): "pending" | "rejected" | undefined =>
  status === "pending" || status === "rejected" ? status : undefined;

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
  pendingMembershipRequestsCount: number;
  eventRequestsPage: number;
  eventRequestsTotal: number;
  eventRequestStatusCounts: RequestStatusCounts;
  eventRequestsQuery: string;
  eventRequestsCostType: CostType;
  eventRequestsStatus: RequestStatusFilter;
  dashboardEventRequests: EventRequest[];
  dashboardEventRequestsPage: number;
  dashboardEventRequestsTotal: number;
  dashboardEventRequestStatusCounts: RequestStatusCounts;
  dashboardEventRequestsQuery: string;
  dashboardEventRequestsCostType: CostType;
  dashboardEventRequestsStatus: RequestStatusFilter;
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
  loadPendingMembershipRequestsCount: () => Promise<void>;
  loadDashboardEventRequests: (
    eventId?: string | null,
    page?: number,
    query?: string,
    costType?: CostType,
    status?: RequestStatusFilter
  ) => Promise<void>;
  createMembershipRequest: (
    profileType: string,
    paymentProof?: File | null,
    schoolIdentification?: File | null,
    cv?: File | null
  ) => Promise<void>;
  loadEventRequests: (
    eventId?: string,
    page?: number,
    query?: string,
    costType?: CostType,
    status?: RequestStatusFilter
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
  pendingMembershipRequestsCount: 0,
  eventRequestsPage: 1,
  eventRequestsTotal: 0,
  eventRequestStatusCounts: EMPTY_STATUS_COUNTS,
  eventRequestsQuery: "",
  eventRequestsCostType: "all",
  eventRequestsStatus: "pending",
  dashboardEventRequests: [],
  dashboardEventRequestsPage: 1,
  dashboardEventRequestsTotal: 0,
  dashboardEventRequestStatusCounts: EMPTY_STATUS_COUNTS,
  dashboardEventRequestsQuery: "",
  dashboardEventRequestsCostType: "all",
  dashboardEventRequestsStatus: "pending",
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
        pendingMembershipRequestsCount:
          requestedStatus === "pending"
            ? result.total
            : result.statusCounts?.pending ?? get().pendingMembershipRequestsCount,
        membershipRequestStatusCounts: result.statusCounts ?? EMPTY_STATUS_COUNTS,
        requestsLoading: false,
      });
      return;
    }
    const result = await listMembershipUpgradeRequests(
      requestedQuery,
      requestedPage,
      get().requestPageSize,
      requestedStatus
    );
    const data = ensureArray(result);
    set({
      membershipRequests: data,
      membershipRequestsPage: Array.isArray(result) ? 1 : result.page,
      membershipRequestsTotal: Array.isArray(result) ? data.length : result.total,
      membershipRequestsQuery: requestedQuery,
      membershipRequestsCostType: "all",
      membershipRequestsStatus: requestedStatus,
      pendingMembershipRequestsCount:
        requestedStatus === "pending"
          ? Array.isArray(result)
            ? data.length
            : result.total
          : Array.isArray(result)
            ? getStatusCounts(data).pending
            : result.statusCounts?.pending ?? get().pendingMembershipRequestsCount,
      membershipRequestStatusCounts: Array.isArray(result)
        ? getStatusCounts(data)
        : result.statusCounts ?? EMPTY_STATUS_COUNTS,
      requestsLoading: false,
    });
  },
  loadPendingMembershipRequestsCount: async () => {
    const role = get().role;
    if (!(role === "admin" || role === "treasurer" || role === "superadmin")) return;
    const result = await listMemberRequests("", 1, 1, "all", "pending");
    set({
      pendingMembershipRequestsCount: result.total,
      membershipRequestStatusCounts: {
        ...get().membershipRequestStatusCounts,
        pending: result.total,
      },
    });
  },
  loadDashboardEventRequests: async (eventId, page, query, costType, status) => {
    set({ requestsLoading: true });
    const requestedEventId =
      eventId === undefined ? get().dashboardEventRequestsEventId : eventId;
    const requestedPage = page ?? get().dashboardEventRequestsPage;
    const requestedQuery = query ?? get().dashboardEventRequestsQuery;
    const requestedCostType = costType ?? get().dashboardEventRequestsCostType;
    const requestedStatus = status ?? get().dashboardEventRequestsStatus;
    const adminStatus = toEventQueueStatus(requestedStatus);
    const result = requestedEventId
      ? await listEventRequests(
          requestedEventId,
          adminStatus,
          requestedQuery,
          requestedPage,
          get().requestPageSize,
          requestedCostType
        )
      : await listAdminEventRequests(
          adminStatus,
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
      dashboardEventRequestsStatus: requestedStatus,
      dashboardEventRequestsEventId: requestedEventId,
      dashboardEventRequestStatusCounts: result.statusCounts ?? EMPTY_STATUS_COUNTS,
      requestsLoading: false,
    });
  },
  createMembershipRequest: async (profileType, paymentProof, schoolIdentification, cv) => {
    set({ requestsLoading: true });
    try {
      await createMembershipUpgradeRequest(profileType, paymentProof, schoolIdentification, cv);
      const data = ensureArray(await listMembershipUpgradeRequests());
      set({
        membershipRequests: data,
        membershipRequestsPage: 1,
        membershipRequestsTotal: data.length,
        membershipRequestStatusCounts: getStatusCounts(data),
      });
    } finally {
      set({ requestsLoading: false });
    }
  },
  loadEventRequests: async (eventId, page, query, costType, status) => {
    set({ requestsLoading: true });
    const role = get().role;
    const requestedPage = page ?? get().eventRequestsPage;
    const requestedQuery = query ?? get().eventRequestsQuery;
    const requestedCostType = costType ?? get().eventRequestsCostType;
    const requestedStatus = status ?? get().eventRequestsStatus;
    const adminStatus = toEventQueueStatus(requestedStatus);
    if (role === "admin" || role === "treasurer" || role === "superadmin") {
      const result = eventId
        ? await listEventRequests(
            eventId,
            adminStatus,
            requestedQuery,
            requestedPage,
            get().requestPageSize,
            requestedCostType
          )
        : await listAdminEventRequests(
            adminStatus,
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
        eventRequestsStatus: requestedStatus,
        eventRequestStatusCounts: result.statusCounts ?? EMPTY_STATUS_COUNTS,
        currentEventRequestsEventId: eventId ?? null,
        requestsLoading: false,
      });
      return;
    }
    const result = await listMyEventRequests(
      eventId,
      requestedQuery,
      requestedPage,
      get().requestPageSize,
      requestedStatus
    );
    const data = ensureArray(result);
    set({
      eventRequests: data,
      eventRequestsPage: Array.isArray(result) ? 1 : result.page,
      eventRequestsTotal: Array.isArray(result) ? data.length : result.total,
      eventRequestsQuery: requestedQuery,
      eventRequestsCostType: "all",
      eventRequestsStatus: requestedStatus,
      eventRequestStatusCounts: Array.isArray(result)
        ? getStatusCounts(data)
        : result.statusCounts ?? EMPTY_STATUS_COUNTS,
      currentEventRequestsEventId: eventId ?? null,
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
