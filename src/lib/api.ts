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
  EventRegistrationPreview,
  EventMemberRegistration,
  EventUpsertPayload,
  EventRequest,
  Member,
  MemberImportResult,
  MemberEventRegistration,
  MemberUpdatePayload,
  MembershipPrices,
  MembershipRequest,
  PaginatedResponse,
  PaymentProof,
  Presentation,
  PresentationImportResult,
  PublicEventSpeaker,
  RequestStatusFilter,
  Section,
  SectionDiscountSettings,
  SectionDetail,
  SectionInvite,
  MySection,
  SectionRequest,
  SpeakerType,
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
type RegisterResponse = { ok: boolean; emailError?: string | null };
type MemberResponse = Partial<Member> & {
  full_name?: string;
  phone_number?: string;
  profile_type?: string;
  academic_degree?: string;
  expiration_date?: number | string | null;
};
type ListMembersResponse =
  | MemberResponse[]
  | (Partial<PaginatedResponse<MemberResponse>> & {
      members?: MemberResponse[];
      data?: MemberResponse[];
      results?: MemberResponse[];
    });
type SendDiplomasResponse =
  | DiplomaRecord[]
  | {
      items?: DiplomaRecord[];
      emailErrors?: unknown[];
      emailErrorCount?: number;
    };

const normalizeRole = (role: BackendRole): Role =>
  role === "superuser" ? "superadmin" : (role as Role);

const normalizeAuthResponse = (response: AuthResponse) => ({
  ...response,
  user: { ...response.user, role: normalizeRole(response.user.role) },
});

const normalizeMember = (member: MemberResponse): Member => ({
  ...member,
  id: member.id ?? "",
  fullName: member.fullName ?? member.full_name ?? "",
  email: member.email ?? "",
  phoneNumber: member.phoneNumber ?? member.phone_number ?? "",
  profileType: member.profileType ?? member.profile_type ?? "professional",
  academicDegree: member.academicDegree ?? member.academic_degree,
  state: member.state,
  institution: member.institution,
  title: member.title ?? null,
  verified: Boolean(member.verified),
  expirationDate: member.expirationDate ?? member.expiration_date ?? null,
  role: member.role ?? "member",
});

const normalizeMembersResponse = (response: ListMembersResponse): Member[] => {
  const items = Array.isArray(response)
    ? response
    : response.items ?? response.members ?? response.data ?? response.results ?? [];
  return items.map(normalizeMember);
};

const toEpochDay = (value: Event["startDate"] | undefined) => {
  if (typeof value === "number") return value;
  if (!value) return value;
  const parsed = new Date(`${value}T00:00:00Z`).getTime();
  return Number.isNaN(parsed) ? value : Math.floor(parsed / 1000);
};

const normalizeEventPayload = (payload: EventUpsertPayload) => ({
  ...payload,
  abstractPdfFile: undefined,
  startDate: toEpochDay(payload.startDate),
});

const humanizeError = (message: string, status: number, code?: string) => {
  const codeMappings: Record<string, string> = {
    email_already_registered: "El correo ya está registrado.",
    email_not_verified: "Debes verificar tu correo antes de iniciar sesión.",
    verification_token_expired: "El enlace de verificación ha expirado.",
    invalid_verification_token: "El enlace de verificación no es válido.",
    invalid_credentials: "Correo o contraseña inválidos.",
    invalid_password_reset_token: "El enlace para restablecer contraseña no es válido o ya expiró.",
    password_too_short: "La contraseña debe tener al menos 8 caracteres.",
    invalid_profile_type: "El tipo de membresía solicitado no es válido.",
    membership_request_already_pending: "Ya tienes una solicitud de membresía pendiente.",
    payment_proof_required: "Debes subir tu comprobante de pago.",
    professional_revert_required:
      "Para cambiar tu membresía actual, primero solicita a administración que revierta tu cuenta a profesional.",
    same_profile_type: "El perfil solicitado debe ser distinto al actual.",
    upgrade_requirements_not_met: "Faltan documentos requeridos para este upgrade.",
  };

  if (code && codeMappings[code]) {
    return codeMappings[code];
  }

  const normalized = message.toLowerCase();
  const mappings: Array<[string, string]> = [
    ["invalid credentials", "Correo o contraseña inválidos."],
    ["email not verified", "Debes verificar tu correo antes de iniciar sesión."],
    ["email is already registered", "El correo ya está registrado."],
    ["email already registered", "El correo ya está registrado."],
    ["event not found", "Evento no encontrado."],
    ["request not found", "Solicitud no encontrada."],
    ["member not found", "Socio no encontrado."],
    ["section not found", "Sección estudiantil no encontrada."],
    ["invalid token", "El enlace no es válido."],
    ["token expired", "El enlace ha expirado."],
    ["password must be at least 8 characters", "La contraseña debe tener al menos 8 caracteres."],
    ["missing fields", "Faltan datos obligatorios."],
    ["duplicate scan", "Escaneo duplicado."],
    ["ticket not found", "El boleto no es válido para este evento."],
    ["payment proof is required", "Debes subir tu comprobante de pago."],
    ["student upgrade requires school identification", "Debes subir tu identificación escolar."],
    ["associated student upgrade requires school identification", "Debes subir tu identificación escolar."],
    ["associated professional upgrade requires cv", "Debes subir tu CV."],
    ["upgrade into an associated profile requires payment proof", "Debes subir tu comprobante de pago."],
    ["event registration is closed", "El registro del evento está cerrado."],
    ["already registered", "Ya estás registrado en este evento."],
    ["resolve registered event members before deleting this event", "No puedes eliminar un evento con socios registrados."],
    ["email verification cannot be revoked by admins", "La verificación por correo no puede retirarse desde administración."],
    ["profile type must be changed", "El tipo de membresía se cambia desde una solicitud de upgrade."],
    ["member must accept the section invite", "El socio debe aceptar la invitación antes de usar esta sección estudiantil."],
    ["member already belongs to another section", "El socio ya pertenece a otra sección estudiantil de este evento."],
    ["remove all section members before deleting this section", "Retira primero a todos los socios de la sección estudiantil. Debe quedar solo el representante."],
    ["transfer the section representative before removing this member", "Transfiere la representación antes de retirar a este socio."],
    ["only a treasurer or superuser can approve a membership request with an associated cost", "Solo tesorería o superadmin puede aprobar solicitudes de membresía con costo."],
    ["same profile", "El perfil solicitado debe ser distinto al actual."],
    ["upgrade requirements", "Faltan documentos requeridos para este upgrade."],
    ["error parsing the body", "No se pudo procesar la solicitud."],
    ["token invalido", "Token inválido."],
    ["email no autorizado", "El correo no está autorizado."],
    ["already a member", "Ya eres socio de esa organización."],
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
    let code: string | undefined;
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
        if (typeof parsed.detail.code === "string") {
          code = parsed.detail.code;
        }
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
      if (!code && typeof parsed?.code === "string") {
        code = parsed.code;
      }
    } catch {
      // raw text response
    }
    throw new Error(humanizeError(message || response.statusText, response.status, code));
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
  academicDegree: string;
  state: string;
  institution: string;
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
        academic_degree: payload.academicDegree,
        state: payload.state,
        institution: payload.institution,
        title: null,
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

export async function requestPasswordReset(email: string) {
  return request<{ ok: boolean }>(
    "/auth/forgot-password",
    { method: "POST", body: JSON.stringify({ email }) },
    false
  );
}

export async function resetPassword(token: string, password: string) {
  return request<{ ok: boolean }>(
    "/auth/reset-password",
    { method: "POST", body: JSON.stringify({ token, password }) },
    false
  );
}

export async function resendVerification(payload: { email?: string; token?: string }) {
  return request<{ ok: boolean; sent: boolean; message: string }>(
    "/auth/resend-verification",
    { method: "POST", body: JSON.stringify(payload) },
    false
  );
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

export async function listPublicEventSpeakers(eventId: string): Promise<PublicEventSpeaker[]> {
  return request<PublicEventSpeaker[]>(`/events/${eventId}/speakers`, {}, false);
}

export async function getMyTicket(eventId: string) {
  return request<{ token: string; event_id: string }>(`/events/${eventId}/ticket/me`);
}

export async function listMyEvents(): Promise<MemberEventRegistration[]> {
  return request<MemberEventRegistration[]>("/members/me/events");
}

export async function getMyEventRegistration(eventId: string): Promise<MemberEventRegistration> {
  return request<MemberEventRegistration>(`/events/${eventId}/registration/me`);
}

export async function getMyEventRegistrationPreview(eventId: string): Promise<EventRegistrationPreview> {
  return request<EventRegistrationPreview>(`/events/${eventId}/request-preview/me`);
}

export async function createEvent(payload: EventUpsertPayload): Promise<Event> {
  const created = await request<Event>("/admin/events", {
    method: "POST",
    body: JSON.stringify(normalizeEventPayload(payload)),
  });
  return payload.abstractPdfFile ? uploadEventAbstract(created.id, payload.abstractPdfFile) : created;
}

export async function updateEvent(id: string, payload: EventUpsertPayload): Promise<Event | null> {
  const updated = await request<Event>(`/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(normalizeEventPayload(payload)),
  });
  return payload.abstractPdfFile ? uploadEventAbstract(id, payload.abstractPdfFile) : updated;
}

export async function uploadEventAbstract(id: string, file: File): Promise<Event> {
  const form = new FormData();
  form.append("abstractPdf", file);
  return request<Event>(`/admin/events/${id}/abstract`, {
    method: "POST",
    body: form,
  });
}

export async function deleteEvent(id: string) {
  return request<{ ok: boolean }>(`/admin/events/${id}`, { method: "DELETE" });
}

export async function getMembershipPrices(): Promise<MembershipPrices> {
  return request<MembershipPrices>("/membership-prices");
}

export async function getAdminMembershipPrices(): Promise<MembershipPrices> {
  return request<MembershipPrices>("/admin/membership-prices");
}

export async function updateAdminMembershipPrices(
  payload: Partial<Event["profilePrices"]>
): Promise<MembershipPrices> {
  return request<MembershipPrices>("/admin/membership-prices", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminSectionDiscounts(): Promise<SectionDiscountSettings> {
  return request<SectionDiscountSettings>("/admin/section-discounts");
}

export async function updateAdminSectionDiscounts(
  payload: Pick<
    SectionDiscountSettings,
    "thresholdCount" | "belowThresholdPercent" | "atOrAboveThresholdPercent"
  >
): Promise<SectionDiscountSettings> {
  return request<SectionDiscountSettings>("/admin/section-discounts", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listMembers(): Promise<Member[]> {
  const pageSize = 100;
  const members: Member[] = [];
  let page = 1;
  let total: number | undefined;

  do {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    const response = await request<ListMembersResponse>(`/members?${params.toString()}`);
    const pageMembers = normalizeMembersResponse(response);
    members.push(...pageMembers);

    total = Array.isArray(response) ? members.length : response.total;
    if (Array.isArray(response) || pageMembers.length < pageSize) break;
    page += 1;
  } while (total === undefined || members.length < total);

  return members;
}

export async function importMembers(file: File, dryRun: boolean): Promise<MemberImportResult> {
  const form = new FormData();
  form.append("file", file);
  const params = new URLSearchParams({ dryRun: String(dryRun) });
  return request<MemberImportResult>(`/members/admin/import?${params.toString()}`, {
    method: "POST",
    body: form,
  });
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
  const response = await request<MemberResponse>("/members/me");
  return normalizeMember(response);
}

export async function getMember(id: string): Promise<Member> {
  const response = await request<MemberResponse>(`/members/${id}`);
  return normalizeMember(response);
}

export async function updateMemberMe(payload: MemberUpdatePayload): Promise<Member> {
  const response = await request<MemberResponse>("/members/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeMember(response);
}

export async function updateMember(id: string, payload: MemberUpdatePayload): Promise<Member | null> {
  const response = await request<MemberResponse>(`/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeMember(response);
}

export async function resetMemberPassword(id: string) {
  return request<{ ok: boolean; temporaryPassword: string }>(`/members/${id}/reset-password`, {
    method: "POST",
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

export async function getEventMember(id: string): Promise<EventMemberRegistration> {
  return request<EventMemberRegistration>(`/admin/event-members/${id}`);
}

export async function deleteEventMember(id: string, comments: string) {
  return request<{
    ok: boolean;
    eventMemberId: string;
    eventId: string;
    memberId: string;
    detachedPaymentProofs: number;
    unclaimedPresentations: number;
    emailError?: string;
  }>(`/admin/event-members/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ comments }),
  });
}

export async function getEventRequest(id: string): Promise<EventRequest> {
  return request<EventRequest>(`/admin/event-requests/${id}`);
}

export async function listMyEventRequests(
  eventId?: string,
  query = "",
  page?: number,
  pageSize?: number,
  status: RequestStatusFilter = "all"
): Promise<EventRequest[] | PaginatedResponse<EventRequest>> {
  const params = new URLSearchParams();
  if (eventId) params.set("event_id", eventId);
  if (query.trim()) params.set("query", query.trim());
  if (page !== undefined) params.set("page", String(page));
  if (pageSize !== undefined) params.set("pageSize", String(pageSize));
  if (status !== "all") params.set("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<EventRequest[] | PaginatedResponse<EventRequest>>(
    `/members/me/event-requests${suffix}`
  );
}

export async function getMyEventRequest(id: string): Promise<EventRequest> {
  return request<EventRequest>(`/members/me/event-requests/${id}`);
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
  }
) {
  if (!payload.eventId) {
    throw new Error("eventId required");
  }
  const form = new FormData();
  if (payload.sectionId) {
    form.append("section_id", payload.sectionId);
  }
  if (payload.paymentProofFile) {
    form.append("payment_proof", payload.paymentProofFile);
  }
  return request<EventRequest>(`/events/${payload.eventId}/requests`, {
    method: "POST",
    body: form,
  });
}

export async function addEventRequestPaymentProof(requestId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<PaymentProof>(`/event-requests/${requestId}/payment-proofs`, {
    method: "POST",
    body: form,
  });
}

export async function addMembershipRequestPaymentProof(requestId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<PaymentProof>(`/membership-requests/${requestId}/payment-proofs`, {
    method: "POST",
    body: form,
  });
}

export async function deletePaymentProof(proofId: string) {
  return request<PaymentProof>(`/payment-proofs/${proofId}`, { method: "DELETE" });
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

export async function listSectionRequests(
  query = "",
  page?: number,
  pageSize?: number,
  status: "pending" | "rejected" | "approved" | "all" = "all"
): Promise<SectionRequest[] | PaginatedResponse<SectionRequest>> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());
  if (page !== undefined) params.set("page", String(page));
  if (pageSize !== undefined) params.set("pageSize", String(pageSize));
  if (status !== "all") params.set("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<SectionRequest[] | PaginatedResponse<SectionRequest>>(
    `/admin/section-requests${suffix}`
  );
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

export async function searchUsersForSection(
  sectionId: string,
  query: string,
  limit = 8
): Promise<Member[]> {
  const params = new URLSearchParams({
    sectionId,
    query,
    limit: String(limit),
  });
  return request<Member[]>(`/users/search?${params.toString()}`);
}

export async function listMySections(eventId?: string): Promise<MySection[]> {
  const query = eventId ? `?event_id=${eventId}` : "";
  return request<MySection[]>(`/members/me/sections${query}`);
}

export async function listAdminSections(
  query = "",
  page = 1,
  pageSize = 20,
  status: "approved" | "pending" | "rejected" | "all" = "approved"
): Promise<PaginatedResponse<Section>> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (status !== "all") params.set("status", status);
  return request<PaginatedResponse<Section>>(`/admin/sections?${params.toString()}`);
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
  const response = await request<SendDiplomasResponse>(`/admin/events/${eventId}/diplomas/send`, {
    method: "POST",
  });
  return Array.isArray(response) ? response : response.items ?? [];
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
  schoolIdentification?: File | null,
  cv?: File | null
) {
  const form = new FormData();
  form.append("profile_type", profileType);
  if (paymentProof) {
    form.append("payment_proof", paymentProof);
  }
  if (schoolIdentification) {
    form.append("school_identification", schoolIdentification);
  }
  if (cv) {
    form.append("cv", cv);
  }
  return request<MembershipRequest>("/members/me/upgrade-requests", {
    method: "POST",
    body: form,
  });
}

export async function listMembershipUpgradeRequests(
  query = "",
  page?: number,
  pageSize?: number,
  status: RequestStatusFilter = "all"
) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("query", query.trim());
  if (page !== undefined) params.set("page", String(page));
  if (pageSize !== undefined) params.set("pageSize", String(pageSize));
  if (status !== "all") params.set("status", status);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return request<MembershipRequest[] | PaginatedResponse<MembershipRequest>>(
    `/members/me/upgrade-requests${suffix}`
  );
}

export async function getMyMembershipRequest(id: string): Promise<MembershipRequest> {
  return request<MembershipRequest>(`/members/me/upgrade-requests/${id}`);
}

export async function listMyPresentations(eventId: string) {
  return request<Presentation[]>(`/events/${eventId}/presentations/me`);
}

export async function uploadPresentation(
  eventId: string,
  file: File,
  payload?: { name?: string; description?: string; presentationType?: "POSTER" | "ORAL" }
) {
  const form = new FormData();
  form.append("file", file);
  if (payload?.name) form.append("name", payload.name);
  if (payload?.description) form.append("description", payload.description);
  if (payload?.presentationType) form.append("presentationType", payload.presentationType);
  return request<Presentation>(`/events/${eventId}/presentations`, {
    method: "POST",
    body: form,
  });
}

export async function confirmPresentationCode(eventId: string, code: string) {
  return request<Presentation>(`/events/${eventId}/presentations/confirm`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function deletePresentation(id: string) {
  return request<{ ok: boolean }>(`/presentations/${id}`, { method: "DELETE" });
}

export async function adminDeletePresentation(id: string) {
  return request<{ ok: boolean }>(`/admin/presentations/${id}`, { method: "DELETE" });
}

export async function listEventSpeakers(
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
    `/admin/events/${eventId}/speakers?${params.toString()}`
  );
}

export async function listEventPresentations(
  eventId: string,
  query = "",
  page = 1,
  pageSize = 20,
  presentationType?: "poster" | "oral" | "POSTER" | "ORAL" | "",
  confirmed?: boolean | ""
): Promise<PaginatedResponse<Presentation>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (query.trim()) params.set("query", query.trim());
  if (presentationType) params.set("presentationType", presentationType);
  if (confirmed !== "" && typeof confirmed === "boolean") {
    params.set("confirmed", String(confirmed));
  }
  return request<PaginatedResponse<Presentation>>(
    `/admin/events/${eventId}/presentations?${params.toString()}`
  );
}

export async function importEventPresentations(eventId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<PresentationImportResult>(`/admin/events/${eventId}/presentations/import`, {
    method: "POST",
    body: form,
  });
}

export async function updateEventMemberSpeaker(
  eventMemberId: string,
  speakerType: Exclude<SpeakerType, "none">
) {
  const form = new FormData();
  form.append("speakerType", speakerType);
  return request<EventMemberRegistration>(`/admin/event-members/${eventMemberId}/speaker`, {
    method: "PATCH",
    body: form,
  });
}

export async function revokeEventMemberSpeaker(eventMemberId: string) {
  return request<EventMemberRegistration>(`/admin/event-members/${eventMemberId}/speaker`, {
    method: "DELETE",
  });
}

export async function updateMySpeakerProfile(
  eventId: string,
  payload: { title?: string | null; speakerDescription?: string; speakerPhoto?: File | null }
) {
  const form = new FormData();
  if ("title" in payload) {
    form.append("title", payload.title ?? "");
  }
  if (typeof payload.speakerDescription === "string") {
    form.append("speaker_description", payload.speakerDescription);
  }
  if (payload.speakerPhoto) {
    form.append("speaker_photo", payload.speakerPhoto);
  }
  return request<MemberEventRegistration>(`/events/${eventId}/speaker-profile/me`, {
    method: "PATCH",
    body: form,
  });
}

export async function downloadPresentation(presentationId: string) {
  return request<{ url: string }>(`/admin/presentations/${presentationId}/download`);
}
