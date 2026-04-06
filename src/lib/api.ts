import type {
  AttendanceRecord,
  BulkLink,
  BulkTier,
  DiplomaRecord,
  DiplomaTemplate,
  Event,
  EventRequest,
  Member,
  MembershipRequest,
  Organization,
  OrganizationRequest,
  OrganizationInvitation,
  Presentation,
  Section,
  SectionInvite,
  SectionRequest,
} from "@/lib/types";
import type { ProfileType, Role } from "@/lib/types";
import { tokenStorage } from "@/lib/authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const ROLE_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  superadmin: { email: "superuser@ameca.org", password: "ChangeMe123!" },
  admin: { email: "admin@ameca.org", password: "ChangeMe123!" },
  staff: { email: "staff@ameca.org", password: "ChangeMe123!" },
  member: { email: "member@ameca.org", password: "ChangeMe123!" },
  representative: { email: "member@ameca.org", password: "ChangeMe123!" },
};

type AuthUser = { id: string; name: string; email: string; role: string };
type AuthResponse = { token: string; user: AuthUser };

const normalizeRole = (role: string): Role =>
  role === "superuser" ? "superadmin" : (role as Role);

const normalizeAuthResponse = (response: AuthResponse) => ({
  ...response,
  user: { ...response.user, role: normalizeRole(response.user.role) },
});

const humanizeError = (message: string, status: number) => {
  const normalized = message.toLowerCase();
  const mappings: Array<[string, string]> = [
    ["invalid credentials", "Correo o contraseña inválidos."],
    ["email not verified", "Debes verificar tu correo antes de iniciar sesión."],
    ["email already registered", "El correo ya está registrado."],
    ["event not found", "Evento no encontrado."],
    ["request not found", "Solicitud no encontrada."],
    ["member not found", "Miembro no encontrado."],
    ["section not found", "Sección no encontrada."],
    ["bulk link not found", "Enlace masivo no encontrado."],
    ["invalid token", "El enlace no es válido."],
    ["token expired", "El enlace ha expirado."],
    ["missing fields", "Faltan datos obligatorios."],
    ["invalid date", "La fecha no es válida."],
    ["duplicate scan", "Escaneo duplicado."],
    ["error parsing the body", "No se pudo procesar la solicitud."],
    ["token invalido", "Token inválido."],
    ["email no autorizado", "El correo no está autorizado."],
    ["organization not found", "Organización no encontrada."],
    ["organization already exists", "La organización ya está registrada."],
    ["already a member", "Ya perteneces a esa organización."],
    ["rejection comment required", "El comentario es obligatorio para rechazar."],
    ["rejection comment locked", "El comentario del rechazo ya fue enviado y no puede cambiarse."],
  ];

  const mapped = mappings.find(([key]) => normalized.includes(key));
  if (mapped) {
    return mapped[1];
  }

  if (status === 401) {
    return "Correo o contraseña inválidos.";
  }
  if (status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }
  if (status === 404) {
    return "No se encontró el recurso solicitado.";
  }
  if (status === 409) {
    return "Ya existe un registro con esos datos.";
  }
  if (status >= 500) {
    return "Ocurrió un error en el servidor. Intenta de nuevo.";
  }

  return message || "Ocurrió un error. Intenta de nuevo.";
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  const token = tokenStorage.get();
  if (withAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.detail === "string") {
        message = parsed.detail;
      } else if (Array.isArray(parsed?.detail)) {
        message = parsed.detail.map((item: any) => item?.msg).filter(Boolean).join(", ");
      } else if (typeof parsed?.message === "string") {
        message = parsed.message;
      }
    } catch {
      // raw text response
    }
    throw new Error(humanizeError(message || response.statusText, response.status));
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export async function authLogin(role: Role) {
  const creds = ROLE_CREDENTIALS[role];
  const payload = { email: creds.email, password: creds.password };
  const response = await request<AuthResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(payload) },
    false
  );
  return normalizeAuthResponse(response);
}

export async function authLoginWithCredentials(email: string, password: string) {
  const response = await request<AuthResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
  return normalizeAuthResponse(response);
}

export async function authRegister(payload: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  organizationId?: string;
}) {
  const response = await request<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        full_name: payload.fullName,
        phone_number: payload.phoneNumber ?? null,
        organization_id: payload.organizationId ?? null,
      }),
    },
    false
  );
  return normalizeAuthResponse(response);
}

export async function authRegisterRepresentative(payload: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  organizationName: string;
}) {
  const response = await request<AuthResponse>(
    "/auth/register-representative",
    {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        full_name: payload.fullName,
        phone_number: payload.phoneNumber ?? null,
        organization_name: payload.organizationName,
      }),
    },
    false
  );
  return normalizeAuthResponse(response);
}

export async function authMe() {
  const response = await request<{ id: string; name: string; email: string; role: string }>(
    "/auth/me"
  );
  return { ...response, role: normalizeRole(response.role) };
}

export async function verifyEmail(token: string) {
  const q = encodeURIComponent(token);
  return request<{ ok: boolean }>(`/auth/verify-email?token=${q}`, { method: "POST" }, false);
}

export async function listEvents(): Promise<Event[]> {
  return request<Event[]>("/events", {}, false);
}

export async function getEvent(id: string): Promise<Event | null> {
  return request<Event>(`/events/${id}`, {}, false);
}

export async function getMyTicket(eventId: string) {
  return request<{ token: string; event_id: string }>(`/events/${eventId}/ticket/me`);
}

export async function createEvent(payload: Partial<Event>): Promise<Event> {
  return request<Event>("/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadEventBanner(eventId: string, banner: File): Promise<Event> {
  const form = new FormData();
  form.append("banner", banner);
  return request<Event>(`/admin/events/${eventId}/banner`, {
    method: "POST",
    body: form,
  });
}

export async function updateEvent(id: string, payload: Partial<Event>): Promise<Event | null> {
  return request<Event>(`/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEvent(id: string) {
  return request<{ ok: boolean }>(`/admin/events/${id}`, { method: "DELETE" });
}

export async function listMembers(): Promise<Member[]> {
  return request<Member[]>("/members");
}

export async function createAdminUser(payload: {
  fullName: string;
  email: string;
  role: "admin" | "staff";
}) {
  return request<{ id: string; email: string; role: Role; tempPassword?: string }>(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        role: payload.role,
      }),
    }
  );
}

export async function listOrganizations(): Promise<Organization[]> {
  return request<Organization[]>("/organizations", {}, false);
}

export async function listMyOrganizationRequests(): Promise<OrganizationRequest[]> {
  return request<OrganizationRequest[]>("/organizations/me/requests");
}

export async function createOrganizationJoinRequest(orgId: string) {
  return request<OrganizationRequest>(`/organizations/${orgId}/join-requests`, {
    method: "POST",
  });
}

export async function listOrganizationJoinRequests(orgId: string) {
  return request<OrganizationRequest[]>(`/organizations/${orgId}/join-requests`);
}

export async function updateOrganizationJoinRequest(id: string, status: "approved" | "rejected") {
  return request<OrganizationRequest>(`/organizations/join-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function listPendingOrganizations(): Promise<Organization[]> {
  return request<Organization[]>("/admin/organizations/requests");
}

export async function updateOrganizationStatus(orgId: string, status: "approved" | "rejected") {
  return request<Organization>(`/admin/organizations/${orgId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
export async function getMemberMe(): Promise<Member> {
  return request<Member>("/members/me");
}

export async function updateMember(id: string, payload: Partial<Member>): Promise<Member | null> {
  return request<Member>(`/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listMemberRequests(): Promise<MembershipRequest[]> {
  return request<MembershipRequest[]>("/admin/membership-requests");
}

export async function approveMemberRequest(id: string, comments?: string) {
  return request<MembershipRequest>(`/admin/membership-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "approved", comments }),
  });
}

export async function denyMemberRequest(id: string, comments?: string) {
  return request<MembershipRequest>(`/admin/membership-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "rejected", comments }),
  });
}

export async function listEventRequests(
  eventId: string,
  status?: "pending" | "approved" | "rejected"
): Promise<EventRequest[]> {
  const query = status ? `?status=${status}` : "";
  return request<EventRequest[]>(`/admin/events/${eventId}/requests${query}`);
}

export async function listMyEventRequests(eventId?: string): Promise<EventRequest[]> {
  const query = eventId ? `?event_id=${eventId}` : "";
  return request<EventRequest[]>(`/members/me/event-requests${query}`);
}

export async function approveEventRequest(id: string, comments?: string) {
  return request<EventRequest>(`/admin/event-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "approved", comments }),
  });
}

export async function denyEventRequest(id: string, comments?: string) {
  return request<EventRequest>(`/admin/event-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "rejected", comments }),
  });
}

export async function createEventRequest(
  payload: Partial<EventRequest> & {
    paymentProofFile?: File | null;
    sectionId?: string | null;
    bulkToken?: string | null;
    isSpeaker?: boolean;
  }
) {
  if (!payload.eventId) {
    throw new Error("eventId required");
  }
  const form = new FormData();
  let hasField = false;
  if (payload.sectionId) {
    form.append("section_id", payload.sectionId);
    hasField = true;
  }
  if (payload.bulkToken) {
    form.append("bulk_token", payload.bulkToken);
    hasField = true;
  }
  if (payload.isSpeaker) {
    form.append("is_speaker", "true");
    hasField = true;
  }
  if (payload.paymentProofFile) {
    form.append("payment_proof", payload.paymentProofFile);
    hasField = true;
  }
  if (!hasField) {
    form.append("bulk_token", "");
  }
  return request<EventRequest>(`/events/${payload.eventId}/requests`, {
    method: "POST",
    body: form,
  });
}

export async function listSectionRequests(): Promise<SectionRequest[]> {
  return request<SectionRequest[]>("/admin/section-requests");
}

export async function approveSectionRequest(id: string) {
  return request<SectionRequest>(`/admin/section-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "approved" }),
  });
}

export async function denySectionRequest(id: string) {
  return request<SectionRequest>(`/admin/section-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "rejected" }),
  });
}

export async function listSections(eventId?: string): Promise<Section[]> {
  const query = eventId ? `?event_id=${eventId}` : "";
  return request<Section[]>(`/sections${query}`);
}

export async function updateSection(id: string, payload: Partial<Section>) {
  return request<Section>(`/admin/sections/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: payload.status }),
  });
}

export async function listSectionInvites(sectionId: string): Promise<SectionInvite[]> {
  return request<SectionInvite[]>(`/sections/${sectionId}/invites`);
}

export async function createSectionInvite(sectionId: string, email: string): Promise<SectionInvite> {
  return request<SectionInvite>(`/sections/${sectionId}/invites`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function acceptSectionInvite(token: string): Promise<SectionInvite> {
  return request<SectionInvite>(`/section-invites/${token}/accept`, { method: "POST" });
}

export async function listBulkLinks(eventId?: string): Promise<BulkLink[]> {
  if (!eventId) {
    return [];
  }
  return request<BulkLink[]>(`/admin/events/${eventId}/bulk-links`);
}

export async function createBulkLink(
  eventId: string,
  payload: Partial<BulkLink> & { allowedEmails?: string[] }
) {
  return request<BulkLink>(`/admin/events/${eventId}/bulk-links`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendBulkInvites(bulkId: string) {
  return request<{ ok: boolean }>(`/admin/bulk-links/${bulkId}/send-invites`, {
    method: "POST",
  });
}

export async function validateBulkToken(token: string) {
  return request<{ valid: boolean; message: string; orgName?: string; discountPercent?: number }>(
    `/bulk/${token}/validate`,
    {},
    true
  );
}

export async function registerViaBulk(token: string) {
  return request<{ status: string; message: string }>(`/bulk/${token}/register`, { method: "POST" });
}

export async function listDiplomasByEvent(eventId: string): Promise<DiplomaRecord[]> {
  return request<DiplomaRecord[]>(`/admin/events/${eventId}/diplomas`);
}

export async function sendDiplomas(eventId: string): Promise<DiplomaRecord[]> {
  return request<DiplomaRecord[]>(`/admin/events/${eventId}/diplomas/send`, { method: "POST" });
}

export async function sendDiplomaRecord(recordId: string): Promise<DiplomaRecord | null> {
  return request<DiplomaRecord>(`/admin/diplomas/${recordId}/send`, { method: "POST" });
}

export async function listMyDiplomas(memberId: string): Promise<DiplomaRecord[]> {
  return request<DiplomaRecord[]>("/members/me/diplomas");
}

export async function downloadMyDiploma(recordId: string) {
  return request<{ url: string }>(`/members/me/diplomas/${recordId}/download`);
}

export async function getDiplomaTemplate(eventId: string): Promise<DiplomaTemplate | null> {
  return request<DiplomaTemplate | null>(`/admin/events/${eventId}/diploma-template`);
}

export async function saveDiplomaTemplate(
  eventId: string,
  template: DiplomaTemplate,
  assetFile?: File | null
): Promise<DiplomaTemplate | null> {
  const form = new FormData();
  form.append("fields_json", JSON.stringify(template.fields ?? []));
  if (assetFile) {
    form.append("asset", assetFile);
  }
  return request<DiplomaTemplate>(`/admin/events/${eventId}/diploma-template`, {
    method: "PUT",
    body: form,
  });
}

export async function computeAttendanceSummary(eventId: string) {
  return request<{ attendedDaysByMember: Record<string, number>; totalAttendees: number }>(
    `/admin/events/${eventId}/attendance-summary`
  );
}

export async function generateDiplomas(eventId: string, minRequiredDays: number) {
  return request<DiplomaRecord[]>(`/admin/events/${eventId}/diplomas/generate`, {
    method: "POST",
    body: JSON.stringify({ minRequiredDays }),
  });
}

export async function recordAttendanceScan(eventId: string, token: string, day: number) {
  return request<AttendanceRecord>("/staff/attendance/scan", {
    method: "POST",
    body: JSON.stringify({ event_id: eventId, qr_token: token, day }),
  });
}

export async function listAttendance(eventId?: string) {
  const query = eventId ? `?event_id=${eventId}` : "";
  return request<AttendanceRecord[]>(`/attendance${query}`);
}

export async function searchAttendance(query?: string) {
  const q = query ? `?query=${encodeURIComponent(query)}` : "";
  return request<AttendanceRecord[]>(`/attendance/search${q}`);
}

export async function listBulkTiers(eventId: string) {
  return request<BulkTier[]>(`/admin/events/${eventId}/bulk-tiers`);
}

export async function saveBulkTiers(eventId: string, tiers: BulkTier[]) {
  return request<BulkTier[]>(`/admin/events/${eventId}/bulk-tiers`, {
    method: "PUT",
    body: JSON.stringify(tiers),
  });
}

export async function createMembershipUpgradeRequest(
  profileType: ProfileType | string,
  paymentProof?: File | null,
  schoolIdentification?: File | null
) {
  const form = new FormData();
  form.append("profile_type", profileType);
  if (paymentProof) {
    form.append("payment_proof", paymentProof);
  }
  if (schoolIdentification) {
    form.append("school_identification", schoolIdentification);
  }
  return request<MembershipRequest>("/members/me/upgrade-requests", {
    method: "POST",
    body: form,
  });
}

export async function listMembershipUpgradeRequests() {
  return request<MembershipRequest[]>("/members/me/upgrade-requests");
}

export async function listOrganizationInvites(): Promise<OrganizationInvitation[]> {
  return request<OrganizationInvitation[]>("/organizations/me/invites");
}

export async function acceptOrganizationInvite(token: string) {
  return request<OrganizationInvitation>(`/organizations/invites/${token}/accept`, {
    method: "POST",
  });
}

export async function inviteOrganizationMembers(orgId: string, emails: string[]) {
  return request<OrganizationInvitation[]>(`/organizations/${orgId}/invites`, {
    method: "POST",
    body: JSON.stringify({ emails }),
  });
}

export async function listMyPresentations(eventId: string) {
  return request<Presentation[]>(`/events/${eventId}/presentations/me`);
}

export async function uploadPresentation(
  eventId: string,
  file: File,
  payload?: { name?: string; description?: string }
) {
  const form = new FormData();
  form.append("file", file);
  if (payload?.name) form.append("name", payload.name);
  if (payload?.description) form.append("description", payload.description);
  return request<Presentation>(`/events/${eventId}/presentations`, {
    method: "POST",
    body: form,
  });
}

export async function deletePresentation(id: string) {
  return request<{ ok: boolean }>(`/presentations/${id}`, { method: "DELETE" });
}

export async function listEventSpeakers(eventId: string) {
  return request<Presentation[]>(`/admin/events/${eventId}/speakers`);
}

export async function downloadPresentation(presentationId: string) {
  return request<{ url: string }>(`/admin/presentations/${presentationId}/download`);
}
