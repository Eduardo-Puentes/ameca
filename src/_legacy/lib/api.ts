import axios from "axios";
import type {
  BulkLink,
  BulkValidation,
  Event,
  EventRequest,
  RegistrationStatus,
  SectionRequest,
  User,
} from "./types";

export type ApiEvent = {
  id: string;
  name: string;
  start_date: string;
  duration: number;
  open: boolean;
};

export type ApiEventRequest = {
  id: string;
  event_id: string;
  member_name: string;
  member_email: string;
  section_name: string;
  status: string;
  payment_proof_url?: string;
  comments?: string;
};

export type ApiSectionRequest = {
  id: string;
  event_id: string;
  event_name: string;
  representative_name: string;
  p_count: number;
  status: string;
};

export type ApiBulkLink = {
  id: string;
  event_id: string;
  org_name: string;
  token: string;
  max_uses: number;
  used_count: number;
  expires_at: string;
  created_by_admin: string;
};

export type ApiMember = {
  id: string;
  full_name: string;
  email: string;
  profile_type: string;
  verified: boolean;
  expiration_date: string;
  role: string;
};

export type ApiSection = {
  id: string;
  event_id: string;
  name: string;
  representative_name: string;
  p_count: number;
  status: string;
};

export type ApiBulkValidation = {
  token: string;
  valid: boolean;
  allowed: boolean;
  message: string;
  org_name?: string;
};

export type CreateBulkLinkPayload = {
  org_name: string;
  max_uses: number;
  expires_at: string;
  allowed_emails?: string[];
};

export const mapEvent = (event: ApiEvent): Event => ({
  id: event.id,
  name: event.name,
  startDate: event.start_date,
  duration: event.duration,
  open: event.open,
});

export const mapEventRequest = (request: ApiEventRequest): EventRequest => ({
  id: request.id,
  eventId: request.event_id,
  memberName: request.member_name,
  memberEmail: request.member_email,
  sectionName: request.section_name,
  status: request.status as EventRequest["status"],
  paymentProofUrl: request.payment_proof_url,
  comments: request.comments,
});

export const mapSectionRequest = (request: ApiSectionRequest): SectionRequest => ({
  id: request.id,
  eventId: request.event_id,
  eventName: request.event_name,
  representativeName: request.representative_name,
  pCount: request.p_count,
  status: request.status as SectionRequest["status"],
});

export const mapBulkLink = (link: ApiBulkLink): BulkLink => ({
  id: link.id,
  eventId: link.event_id,
  orgName: link.org_name,
  token: link.token,
  maxUses: link.max_uses,
  usedCount: link.used_count,
  expiresAt: link.expires_at,
  createdByAdmin: link.created_by_admin,
});

export const mapBulkValidation = (validation: ApiBulkValidation): BulkValidation => ({
  token: validation.token,
  valid: validation.valid,
  allowed: validation.allowed,
  message: validation.message,
  orgName: validation.org_name,
});

export const mapMember = (member: ApiMember) => ({
  id: member.id,
  fullName: member.full_name,
  email: member.email,
  profileType: member.profile_type,
  verified: member.verified,
  expirationDate: member.expiration_date,
  role: member.role as User["role"],
});

export const mapSection = (section: ApiSection) => ({
  id: section.id,
  eventId: section.event_id,
  name: section.name,
  representativeName: section.representative_name,
  pCount: section.p_count,
  status: section.status as "pending" | "approved" | "denied",
});

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export const AuthAPI = {
  login: (payload: { email: string; password: string }) =>
    api.post<{ access_token: string; user: User }>("/auth/login", payload),
  me: () => api.get<User>("/auth/me"),
};

export const EventsAPI = {
  list: () => api.get<ApiEvent[]>("/events"),
  get: (id: string) => api.get<ApiEvent>(`/events/${id}`),
  ticket: (id: string) =>
    api.get<{ token: string; event_id: string }>(`/events/${id}/ticket/me`),
};

export const AdminAPI = {
  listEventRequests: (eventId: string) =>
    api.get<ApiEventRequest[]>(`/admin/events/${eventId}/requests`),
  updateRequest: (requestId: string, payload: { status: string; comments?: string }) =>
    api.patch<ApiEventRequest>(`/admin/requests/${requestId}`, payload),
  listSectionRequests: (eventId: string) =>
    api.get<ApiSectionRequest[]>(`/admin/events/${eventId}/section-requests`),
  updateSection: (sectionId: string, payload: { status: string }) =>
    api.patch<ApiSectionRequest>(`/admin/sections/${sectionId}`, payload),
  listSections: (eventId: string) =>
    api.get<ApiSection[]>(`/admin/events/${eventId}/sections`),
  updateSectionStatus: (sectionId: string, payload: { status: string }) =>
    api.patch<ApiSection>(`/admin/sections/${sectionId}/status`, payload),
  listBulkLinks: (eventId: string) =>
    api.get<ApiBulkLink[]>(`/admin/events/${eventId}/bulk-links`),
  createBulkLink: (eventId: string, payload: CreateBulkLinkPayload) =>
    api.post<ApiBulkLink>(`/admin/events/${eventId}/bulk-links`, payload),
};

export const MembersAPI = {
  list: () => api.get<ApiMember[]>("/members"),
  me: () => api.get<ApiMember>("/members/me"),
  updateMe: (payload: Partial<ApiMember>) => api.patch<ApiMember>("/members/me", payload),
  update: (id: string, payload: Partial<ApiMember>) =>
    api.patch<ApiMember>(`/members/${id}`, payload),
};

export const BulkAPI = {
  validate: (token: string, email: string) =>
    api.get<ApiBulkValidation>(`/bulk/${token}`, { params: { email } }),
  register: (token: string, payload: { email: string; full_name: string }) =>
    api.post<{ status: RegistrationStatus }>(`/bulk/${token}/register`, payload),
};

export default api;
