import type {
  AdminUser,
  AdminUserCreatePayload,
  AdminUserCreateResult,
  AdminUserUpdatePayload,
  AttendanceRecord,
  BackendRole,
  CostType,
  DiplomaRecord,
  DiplomaTemplate,
  Event,
  EventMemberRegistration,
  EventUpsertPayload,
  EventRequest,
  Member,
  MemberEventRegistration,
  MemberUpdatePayload,
  MembershipRequest,
  PaginatedResponse,
  Presentation,
  RequestStatusFilter,
  Section,
  SectionDetail,
  SectionInvite,
  SectionRequest,
} from "@/lib/types";
import type { ProfileType, Role } from "@/lib/types";
import { tokenStorage } from "@/lib/authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const ROLE_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  superadmin: { email: "superuser@ameca.org", password: "ChangeMe123!" },
  admin: { email: "admin@ameca.org", password: "ChangeMe123!" },
  treasurer: { email: "treasurer@ameca.org", password: "ChangeMe123!" },
  staff: { email: "staff@ameca.org", password: "ChangeMe123!" },
  member: { email: "member@ameca.org", password: "ChangeMe123!" },
  representative: { email: "member@ameca.org", password: "ChangeMe123!" },
};

type AuthUser = { id: string; name: string; email: string; role: BackendRole };
type AuthResponse = { token: string; user: AuthUser };
type RegisterResponse = { ok: boolean };

const normalizeRole = (role: BackendRole): Role =>
  role === "superuser" ? "superadmin" : (role as Role);

const normalizeAuthResponse = (response: AuthResponse) => ({
  ...response,
  user: { ...response.user, role: normalizeRole(response.user.role) },
});

const toEpochDay = (value: Event["startDate"] | undefined) => {
  if (typeof value === "number") return value;
  if (!value) return value;
  const parsed = new Date(`${value}T00:00:00Z`).getTime();
  return Number.isNaN(parsed) ? value : Math.floor(parsed / 1000);
};

const normalizeEventPayload = (payload: EventUpsertPayload) => ({
  ...payload,
  startDate: toEpochDay(payload.startDate),
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
    ["invalid token", "El enlace no es válido."],
    ["token expired", "El enlace ha expirado."],
    ["missing fields", "Faltan datos obligatorios."],
    ["duplicate scan", "Escaneo duplicado."],
    ["ticket not found", "El boleto no es válido para este evento."],
    ["payment proof is required", "Debes subir tu comprobante de pago."],
    ["event registration is closed", "El registro del evento está cerrado."],
    ["already registered", "Ya estás registrado en este evento."],
    ["resolve registered event members before deleting this event", "No puedes eliminar un evento con usuarios registrados."],
    ["email verification cannot be revoked by admins", "La verificación por correo no puede retirarse desde administración."],
    ["profile type must be changed", "El tipo de membresía se cambia desde una solicitud de upgrade."],
    ["member must accept the section invite", "Debes aceptar la invitación antes de usar esta sección."],
    ["member already belongs to another section", "Ya perteneces a otra sección de este evento."],
    ["remove all section members before deleting this section", "Retira primero a todos los integrantes de la sección. Debe quedar solo el representante."],
    ["transfer the section representative before removing this member", "Transfiere la representación antes de retirar a este integrante."],
    ["only a treasurer or superuser can approve a membership request with an associated cost", "Solo tesorería o superadmin puede aprobar solicitudes de membresía con costo."],
    ["same profile", "El perfil solicitado debe ser distinto al actual."],
    ["upgrade requirements", "Faltan documentos requeridos para este upgrade."],
    ["error parsing the body", "No se pudo procesar la solicitud."],
    ["token invalido", "Token inválido."],
    ["email no autorizado", "El correo no está autorizado."],
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
    credentials: "include",
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.detail === "string") {
        message = parsed.detail;
      } else if (
        typeof parsed?.detail === "object" &&
        parsed.detail !== null &&
        typeof parsed.detail.message === "string"
      ) {
        message = parsed.detail.message;
      } else if (Array.isArray(parsed?.detail)) {
        message = parsed.detail
          .map((item: unknown) =>
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
              ? item.msg
              : ""
          )
          .filter(Boolean)
          .join(", ");
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
}) {
  return request<RegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        full_name: payload.fullName,
        phone_number: payload.phoneNumber ?? null,
      }),
    },
    false
  );
}

export async function authMe() {
  const response = await request<{ id: string; name: string; email: string; role: BackendRole }>(
    "/auth/me"
  );
  return { ...response, role: normalizeRole(response.role) };
}

export async function authLogout() {
  return request<{ ok: boolean }>("/auth/logout", { method: "POST" }, false);
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

export async function listMyEvents(): Promise<MemberEventRegistration[]> {
  return request<MemberEventRegistration[]>("/members/me/events");
}

export async function createEvent(payload: EventUpsertPayload): Promise<Event> {
  return request<Event>("/admin/events", {
    method: "POST",
    body: JSON.stringify(normalizeEventPayload(payload)),
  });
}

export async function updateEvent(id: string, payload: EventUpsertPayload): Promise<Event | null> {
  return request<Event>(`/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(normalizeEventPayload(payload)),
  });
}

export async function deleteEvent(id: string) {
  return request<{ ok: boolean }>(`/admin/events/${id}`, { method: "DELETE" });
}

export async function listMembers(): Promise<Member[]> {
  return request<Member[]>("/members");
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>("/admin/users");
}

export async function createAdminUser(payload: AdminUserCreatePayload) {
  return request<AdminUserCreateResult>(
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

export async function updateAdminUser(
  id: string,
  payload: AdminUserUpdatePayload
): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      role: payload.role,
    }),
  });
}

export async function resetAdminUserPassword(id: string) {
  return request<{ ok: boolean; tempPassword?: string }>(`/admin/users/${id}/reset-password`, {
    method: "POST",
  });
}

export async function deleteAdminUser(id: string) {
  return request<{ ok: boolean }>(`/admin/users/${id}`, { method: "DELETE" });
}

export async function getMemberMe(): Promise<Member> {
  return request<Member>("/members/me");
}

export async function updateMemberMe(payload: MemberUpdatePayload): Promise<Member> {
  return request<Member>("/members/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateMember(id: string, payload: MemberUpdatePayload): Promise<Member | null> {
  return request<Member>(`/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMember(id: string) {
  return request<{ ok: boolean }>(`/members/${id}`, { method: "DELETE" });
}

export async function listMemberRequests(
  query = "",
  page = 1,
  pageSize = 20,
  costType: CostType = "all",
  status: RequestStatusFilter = "pending"
): Promise<PaginatedResponse<MembershipRequest>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("costType", costType);
  params.set("status", status);
  if (query.trim()) {
    params.set("query", query.trim());
  }
  return request<PaginatedResponse<MembershipRequest>>(
    `/admin/membership-requests?${params.toString()}`
  );
}

export async function getMemberRequest(id: string): Promise<MembershipRequest> {
  return request<MembershipRequest>(`/admin/membership-requests/${id}`);
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
  status?: "pending" | "approved" | "rejected",
  query = "",
  page = 1,
  pageSize = 20,
  costType: CostType = "all"
): Promise<PaginatedResponse<EventRequest>> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query.trim()) params.set("query", query.trim());
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("costType", costType);
  return request<PaginatedResponse<EventRequest>>(
    `/admin/events/${eventId}/requests?${params.toString()}`
  );
}

export async function listAdminEventRequests(
  status?: "pending" | "approved" | "rejected",
  query = "",
  page = 1,
  pageSize = 20,
  costType: CostType = "all"
): Promise<PaginatedResponse<EventRequest>> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query.trim()) params.set("query", query.trim());
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("costType", costType);
  return request<PaginatedResponse<EventRequest>>(`/admin/event-requests?${params.toString()}`);
}

export async function listEventMembers(
  eventId: string,
  query = "",
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<EventMemberRegistration>> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return request<PaginatedResponse<EventMemberRegistration>>(
    `/admin/events/${eventId}/members?${params.toString()}`
  );
}

export async function getEventRequest(id: string): Promise<EventRequest> {
  return request<EventRequest>(`/admin/event-requests/${id}`);
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
    isSpeaker?: boolean;
  }
) {
  if (!payload.eventId) {
    throw new Error("eventId required");
  }
  const form = new FormData();
  if (payload.sectionId) {
    form.append("section_id", payload.sectionId);
  }
  if (payload.isSpeaker) {
    form.append("is_speaker", "true");
  }
  if (payload.paymentProofFile) {
    form.append("payment_proof", payload.paymentProofFile);
  }
  return request<EventRequest>(`/events/${payload.eventId}/requests`, {
    method: "POST",
    body: form,
  });
}

export async function createSectionRequest(payload: {
  eventId: string;
  name: string;
}) {
  return request<SectionRequest>("/section-requests", {
    method: "POST",
    body: JSON.stringify({
      event_id: payload.eventId,
      name: payload.name,
    }),
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

export async function getSection(sectionId: string): Promise<SectionDetail> {
  return request<SectionDetail>(`/sections/${sectionId}`);
}

export async function updateSection(id: string, payload: Partial<Section>) {
  return request<Section>(`/admin/sections/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: payload.status }),
  });
}

export async function deleteSection(id: string) {
  return request<{ ok: boolean }>(`/sections/${id}`, {
    method: "DELETE",
  });
}

export async function removeSectionMember(sectionId: string, memberId: string): Promise<Section> {
  return request<Section>(`/sections/${sectionId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export async function listSectionInvites(sectionId: string): Promise<SectionInvite[]> {
  return request<SectionInvite[]>(`/sections/${sectionId}/invites`);
}

export async function createSectionInvite(sectionId: string, memberId: string): Promise<SectionInvite> {
  return request<SectionInvite>(`/sections/${sectionId}/invites`, {
    method: "POST",
    body: JSON.stringify({ invitedMemberId: memberId }),
  });
}

export async function listMySectionInvites(): Promise<SectionInvite[]> {
  return request<SectionInvite[]>("/members/me/section-invites");
}

export async function acceptSectionInvite(inviteId: string): Promise<SectionInvite> {
  return request<SectionInvite>(`/section-invites/${inviteId}/accept`, { method: "POST" });
}

export async function declineSectionInvite(inviteId: string): Promise<SectionInvite> {
  return request<SectionInvite>(`/section-invites/${inviteId}/decline`, { method: "POST" });
}

export async function cancelSectionInvite(inviteId: string): Promise<SectionInvite> {
  return request<SectionInvite>(`/section-invites/${inviteId}/cancel`, { method: "POST" });
}

export async function transferSectionRepresentative(sectionId: string, memberId: string) {
  return request<Section>(`/sections/${sectionId}/representative`, {
    method: "PATCH",
    body: JSON.stringify({ newRepresentativeMemberId: memberId }),
  });
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
  void memberId;
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
  const response = await request<{
    attendedMemberIds?: string[];
    attendedDaysByMember?: Record<string, number>;
    totalAttendees: number;
  }>(`/admin/events/${eventId}/attendance-summary`);
  if (response.attendedDaysByMember) {
    return response as { attendedDaysByMember: Record<string, number>; totalAttendees: number };
  }
  const attendedDaysByMember = Object.fromEntries(
    (response.attendedMemberIds ?? []).map((memberId) => [memberId, 1])
  );
  return { attendedDaysByMember, totalAttendees: response.totalAttendees };
}

export async function generateDiplomas(eventId: string, _minRequiredDays?: number) {
  void _minRequiredDays;
  return request<DiplomaRecord[]>(`/admin/events/${eventId}/diplomas/generate`, {
    method: "POST",
  });
}

export async function recordAttendanceScan(eventId: string, token: string) {
  return request<AttendanceRecord>("/staff/attendance/scan", {
    method: "POST",
    body: JSON.stringify({ event_id: eventId, qr_token: token }),
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
