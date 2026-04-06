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
  RequestStatus,
  Section,
  SectionRequest,
} from "@/lib/types";
import {
  mockAttendanceRecords,
  mockBulkLinks,
  mockBulkTiers,
  mockDiplomaRecords,
  mockDiplomaTemplates,
  mockEventRequests,
  mockEvents,
  mockMembers,
  mockMembershipRequests,
  mockSectionRequests,
  mockSections,
} from "./data";

let events = [...mockEvents];
let members = [...mockMembers];
let membershipRequests = [...mockMembershipRequests];
let eventRequests = [...mockEventRequests];
let sectionRequests = [...mockSectionRequests];
let sections = [...mockSections];
let bulkLinks = [...mockBulkLinks];
let diplomaTemplates = [...mockDiplomaTemplates];
let diplomaRecords = [...mockDiplomaRecords];
let attendanceRecords = [...mockAttendanceRecords];
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
let organizations: Organization[] = [
  {
    id: generateId("org"),
    name: "Universidad Central",
    status: "approved",
    representativeName: "Dra. Riley Shaw",
    createdAt: "2026-02-01",
  },
  {
    id: generateId("org"),
    name: "Instituto Biomédico",
    status: "approved",
    representativeName: "Ariana Torres",
    createdAt: "2026-02-05",
  },
];
let organizationRequests: OrganizationRequest[] = [];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const roleFromEmail = (email: string) => {
  if (email.includes("superuser")) return "superadmin";
  if (email.includes("admin")) return "admin";
  if (email.includes("staff")) return "staff";
  if (email.includes("representative")) return "representative";
  return "member";
};

export async function authLogin(role: string) {
  await wait(300);
  const roleLabel = role;
  return {
    token: `mock.jwt.${role}.${Date.now()}`,
    user: {
      id: `user-${role}`,
      name:
        roleLabel === "superadmin"
          ? "Directora General"
          : roleLabel === "admin"
          ? "Ariana Torres"
          : roleLabel === "staff"
          ? "Equipo Check-in"
          : roleLabel === "representative"
          ? "Dra. Riley Shaw"
          : "Jordan Lee",
      email:
        roleLabel === "member"
          ? "jordan.lee@uni.edu"
          : roleLabel === "representative"
          ? "riley.shaw@lab.org"
          : roleLabel === "staff"
          ? "staff@ameca.org"
          : "admin@ameca.org",
      role: roleLabel,
    },
  };
}

export async function authLoginWithCredentials(email: string) {
  const role = roleFromEmail(email);
  return authLogin(role);
}

export async function authRegister(payload: { fullName: string; email: string }) {
  await wait(350);
  const role = roleFromEmail(payload.email);
  members = [
    {
      id: generateId("member"),
      fullName: payload.fullName,
      email: payload.email,
      profileType: "standard",
      verified: false,
      expirationDate: "",
      role,
      organization: "",
    },
    ...members,
  ];
  return authLogin(role);
}

export async function authRegisterRepresentative(payload: {
  fullName: string;
  email: string;
  organizationName: string;
}) {
  await wait(350);
  organizations = [
    {
      id: generateId("org"),
      name: payload.organizationName,
      status: "pending",
      representativeName: payload.fullName,
      createdAt: "2026-02-10",
    },
    ...organizations,
  ];
  return authLogin("representative");
}

export async function listEvents() {
  await wait(250);
  return [...events];
}

export async function getEvent(id: string) {
  await wait(200);
  return events.find((event) => event.id === id) ?? null;
}

export async function getMyTicket(eventId: string) {
  await wait(150);
  return { token: `TCK-${eventId}-member`, event_id: eventId };
}

export async function createEvent(payload: Partial<Event>) {
  await wait(300);
  const newEvent: Event = {
    id: generateId("event"),
    name: payload.name ?? "Nuevo evento",
    startDate: payload.startDate ?? "2026-06-10",
    duration: payload.duration ?? 1,
    open: true,
    location: payload.location ?? "Por definir",
    description: payload.description ?? "Descripción pendiente.",
    capacity: payload.capacity ?? 100,
    status: "open",
  };
  events = [newEvent, ...events];
  return newEvent;
}

export async function uploadEventBanner(eventId: string, banner: File) {
  await wait(200);
  const bannerUrl = typeof URL !== "undefined" ? URL.createObjectURL(banner) : "";
  events = events.map((event) =>
    event.id === eventId
      ? { ...event, bannerUrl, bannerName: banner.name, bannerType: banner.type }
      : event
  );
  return events.find((event) => event.id === eventId) ?? null;
}

export async function updateEvent(id: string, payload: Partial<Event>) {
  await wait(250);
  events = events.map((event) => (event.id === id ? { ...event, ...payload } : event));
  return events.find((event) => event.id === id) ?? null;
}

export async function deleteEvent(id: string) {
  await wait(200);
  events = events.filter((event) => event.id !== id);
  return { ok: true };
}

export async function listMembers() {
  await wait(200);
  return [...members];
}

export async function createAdminUser(payload: {
  fullName: string;
  email: string;
  role: "admin" | "staff";
}) {
  await wait(300);
  return {
    id: generateId("admin"),
    email: payload.email,
    role: payload.role,
    tempPassword: "ChangeMe123!",
  };
}

export async function updateMember(id: string, payload: Partial<Member>) {
  await wait(200);
  members = members.map((member) => (member.id === id ? { ...member, ...payload } : member));
  return members.find((member) => member.id === id) ?? null;
}

export async function listOrganizations() {
  await wait(200);
  return organizations.filter((org) => org.status === "approved");
}

export async function listMyOrganizationRequests() {
  await wait(200);
  return organizationRequests;
}

export async function createOrganizationJoinRequest(orgId: string) {
  await wait(250);
  const org = organizations.find((item) => item.id === orgId);
  if (!org) {
    throw new Error("Organization not found");
  }
  const req: OrganizationRequest = {
    id: generateId("org-req"),
    organizationId: org.id,
    organizationName: org.name,
    memberId: "member-1",
    memberName: "Jordan Lee",
    memberEmail: "jordan.lee@uni.edu",
    status: "pending",
    createdAt: "2026-02-20",
  };
  organizationRequests = [req, ...organizationRequests];
  return req;
}

export async function listOrganizationJoinRequests(orgId: string) {
  await wait(200);
  return organizationRequests.filter((req) => req.organizationId === orgId);
}

export async function updateOrganizationJoinRequest(id: string, status: RequestStatus) {
  await wait(200);
  organizationRequests = organizationRequests.map((req) =>
    req.id === id ? { ...req, status } : req
  );
  return organizationRequests.find((req) => req.id === id)!;
}

export async function listPendingOrganizations() {
  await wait(200);
  return organizations.filter((org) => org.status === "pending");
}

export async function updateOrganizationStatus(id: string, status: "approved" | "rejected") {
  await wait(200);
  organizations = organizations.map((org) =>
    org.id === id ? { ...org, status } : org
  );
  return organizations.find((org) => org.id === id)!;
}

export async function listMemberRequests() {
  await wait(220);
  return [...membershipRequests];
}

export async function createMembershipUpgradeRequest(
  profileType: string,
  _paymentProof?: File | null
) {
  await wait(220);
  const newRequest: MembershipRequest = {
    id: generateId("mem"),
    memberId: members[0]?.id ?? "member-000",
    memberName: members[0]?.fullName ?? "Miembro",
    profileType,
    status: "pending",
    paymentProofUrl: "#",
    comments: "",
    createdAt: new Date().toISOString().split("T")[0],
  };
  membershipRequests = [newRequest, ...membershipRequests];
  return newRequest;
}

export async function listMembershipUpgradeRequests() {
  await wait(200);
  return [...membershipRequests];
}

export async function approveMemberRequest(id: string, comments?: string) {
  await wait(220);
  membershipRequests = membershipRequests.map((req) =>
    req.id === id ? { ...req, status: "approved", comments: comments ?? "Aprobado." } : req
  );
  return membershipRequests.find((req) => req.id === id) ?? null;
}

export async function denyMemberRequest(id: string, comments?: string) {
  await wait(220);
  membershipRequests = membershipRequests.map((req) =>
    req.id === id ? { ...req, status: "rejected", comments: comments ?? "Rechazado." } : req
  );
  return membershipRequests.find((req) => req.id === id) ?? null;
}

export async function listEventRequests(
  eventId: string,
  status?: "pending" | "approved" | "rejected"
) {
  await wait(200);
  const scoped = eventRequests.filter((req) => req.eventId === eventId);
  if (!status) return scoped;
  return scoped.filter((req) => req.status === status);
}

export async function approveEventRequest(id: string, comments?: string) {
  await wait(200);
  eventRequests = eventRequests.map((req) =>
    req.id === id ? { ...req, status: "approved", comments: comments ?? "Aprobado." } : req
  );
  return eventRequests.find((req) => req.id === id) ?? null;
}

export async function denyEventRequest(id: string, comments?: string) {
  await wait(200);
  eventRequests = eventRequests.map((req) =>
    req.id === id ? { ...req, status: "rejected", comments: comments ?? "Rechazado." } : req
  );
  return eventRequests.find((req) => req.id === id) ?? null;
}

export async function createEventRequest(
  payload: Partial<EventRequest> & { paymentProofFile?: File | null }
) {
  await wait(300);
  const newRequest: EventRequest = {
    id: generateId("req"),
    eventId: payload.eventId ?? "",
    eventName: payload.eventName ?? "Evento",
    memberName: payload.memberName ?? "Miembro",
    memberEmail: payload.memberEmail ?? "",
    sectionName: payload.sectionName ?? "General",
    status: "pending",
    paymentProofUrl: payload.paymentProofUrl,
    comments: "",
    createdAt: new Date().toISOString().split("T")[0],
    isSpeaker: payload.isSpeaker ?? false,
  };
  eventRequests = [newRequest, ...eventRequests];
  return newRequest;
}

export async function listSectionRequests() {
  await wait(200);
  return [...sectionRequests];
}

export async function approveSectionRequest(id: string) {
  await wait(200);
  sectionRequests = sectionRequests.map((req) =>
    req.id === id ? { ...req, status: "approved" } : req
  );
  return sectionRequests.find((req) => req.id === id) ?? null;
}

export async function denySectionRequest(id: string) {
  await wait(200);
  sectionRequests = sectionRequests.map((req) =>
    req.id === id ? { ...req, status: "rejected" } : req
  );
  return sectionRequests.find((req) => req.id === id) ?? null;
}

export async function listSections(eventId?: string) {
  await wait(200);
  if (!eventId) return [...sections];
  return sections.filter((section) => section.eventId === eventId);
}

export async function updateSection(id: string, payload: Partial<Section>) {
  await wait(200);
  sections = sections.map((section) => (section.id === id ? { ...section, ...payload } : section));
  return sections.find((section) => section.id === id) ?? null;
}

export async function listBulkLinks(eventId?: string) {
  await wait(200);
  if (!eventId) return [...bulkLinks];
  return bulkLinks.filter((link) => link.eventId === eventId);
}

export async function createBulkLink(
  eventId: string,
  payload: Partial<BulkLink> & { allowedEmails?: string[] }
) {
  await wait(260);
  const link: BulkLink = {
    id: generateId("bulk"),
    eventId,
    orgName: payload.orgName ?? "Organización",
    token: `BULK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    maxUses: payload.maxUses ?? 10,
    usedCount: 0,
    expiresAt: payload.expiresAt ?? "2026-05-01",
    createdByAdmin: payload.createdByAdmin ?? "Equipo AMECA",
    status: "active",
    tiers: payload.tiers ?? mockBulkTiers,
  };
  bulkLinks = [link, ...bulkLinks];
  return link;
}

export async function sendBulkInvites(_bulkId: string) {
  await wait(300);
  return { ok: true };
}

export async function validateBulkToken(token: string) {
  await wait(200);
  const link = bulkLinks.find((item) => item.token === token);
  if (!link) {
    return { valid: false, message: "Token inválido o expirado." } as const;
  }
  const discountPercent = link.tiers?.[0]?.discountPercent ?? 5;
  return {
    valid: true,
    message: "Token válido. Descuento aplicado.",
    orgName: link.orgName,
    discountPercent,
  } as const;
}

export async function registerViaBulk(token: string) {
  await wait(250);
  const link = bulkLinks.find((item) => item.token === token);
  if (!link || link.status !== "active") {
    return { status: "rejected" as RequestStatus, message: "Token inválido." };
  }
  if (link.usedCount >= link.maxUses) {
    return { status: "rejected" as RequestStatus, message: "Cupo agotado." };
  }
  link.usedCount += 1;
  return { status: "pending" as RequestStatus, message: "Registro enviado." };
}

export async function getDiplomaTemplate(eventId: string) {
  await wait(160);
  return diplomaTemplates.find((item) => item.eventId === eventId) ?? null;
}

export async function saveDiplomaTemplate(
  eventId: string,
  template: DiplomaTemplate,
  _assetFile?: File | null
) {
  await wait(200);
  const existing = diplomaTemplates.find((item) => item.eventId === eventId);
  if (existing) {
    diplomaTemplates = diplomaTemplates.map((item) =>
      item.eventId === eventId ? { ...template, updatedAt: new Date().toISOString().split("T")[0] } : item
    );
  } else {
    const now = new Date().toISOString().split("T")[0];
    diplomaTemplates = [
      { ...template, eventId, createdAt: now, updatedAt: now },
      ...diplomaTemplates,
    ];
  }
  return diplomaTemplates.find((item) => item.eventId === eventId) ?? null;
}

export async function computeAttendanceSummary(eventId: string) {
  await wait(180);
  const byMember: Record<string, Set<string>> = {};
  attendanceRecords
    .filter((record) => record.eventId === eventId && record.status === "ok")
    .forEach((record) => {
      const key = record.memberId;
      const dayKey = record.eventDay ?? `day-${record.day}`;
      if (!byMember[key]) {
        byMember[key] = new Set();
      }
      byMember[key].add(dayKey);
    });
  const attendedDaysByMember: Record<string, number> = {};
  Object.entries(byMember).forEach(([memberId, days]) => {
    attendedDaysByMember[memberId] = days.size;
  });
  return {
    attendedDaysByMember,
    totalAttendees: Object.keys(attendedDaysByMember).length,
  };
}

export async function generateDiplomas(eventId: string, minRequiredDays: number) {
  await wait(280);
  const event = events.find((item) => item.id === eventId);
  if (!event) return [] as DiplomaRecord[];
  const summary = await computeAttendanceSummary(eventId);
  const eligibleMemberIds = Object.entries(summary.attendedDaysByMember)
    .filter(([, days]) => days >= minRequiredDays)
    .map(([memberId]) => memberId);

  eligibleMemberIds.forEach((memberId) => {
    const member = members.find((item) => item.id === memberId);
    const attendedDays = summary.attendedDaysByMember[memberId] ?? 0;
    const existing = diplomaRecords.find(
      (record) => record.eventId === eventId && record.memberId === memberId
    );
    if (existing) {
      diplomaRecords = diplomaRecords.map((record) =>
        record.id === existing.id
          ? {
              ...record,
              attendedDays,
              minRequiredDays,
              status: record.status === "sent" ? record.status : "generated",
              issuedAt: new Date().toISOString().split("T")[0],
            }
          : record
      );
      return;
    }
    diplomaRecords = [
      {
        id: generateId("dip"),
        eventId,
        memberId,
        memberName: member?.fullName ?? "Miembro",
        memberEmail: member?.email ?? "",
        attendedDays,
        minRequiredDays,
        status: "generated",
        issuedAt: new Date().toISOString().split("T")[0],
      },
      ...diplomaRecords,
    ];
  });

  return diplomaRecords.filter((record) => record.eventId === eventId);
}

export async function listDiplomasByEvent(eventId: string) {
  await wait(180);
  return diplomaRecords.filter((record) => record.eventId === eventId);
}

export async function sendDiplomas(eventId: string) {
  await wait(250);
  const now = new Date().toISOString().split("T")[0];
  diplomaRecords = diplomaRecords.map((record) =>
    record.eventId === eventId
      ? { ...record, status: "sent", sentAt: now }
      : record
  );
  return diplomaRecords.filter((record) => record.eventId === eventId);
}

export async function sendDiplomaRecord(recordId: string) {
  await wait(200);
  const now = new Date().toISOString().split("T")[0];
  diplomaRecords = diplomaRecords.map((record) =>
    record.id === recordId ? { ...record, status: "sent", sentAt: now } : record
  );
  return diplomaRecords.find((record) => record.id === recordId) ?? null;
}

export async function listMyDiplomas(memberId: string) {
  await wait(200);
  return diplomaRecords.filter((record) => record.memberId === memberId);
}

export async function recordAttendanceScan(eventId: string, token: string, day: number) {
  await wait(200);
  const member = members.find((item) => item.id === token) ?? members[0];
  const event = events.find((item) => item.id === eventId);
  const eventDay = (() => {
    if (!event?.startDate) return undefined;
    const base = new Date(event.startDate);
    if (Number.isNaN(base.getTime())) return undefined;
    const date = new Date(base);
    date.setDate(base.getDate() + Math.max(day - 1, 0));
    return date.toISOString().split("T")[0];
  })();
  const existing = attendanceRecords.find(
    (record) => record.eventId === eventId && record.memberId === member.id && record.day === day
  );
  if (existing) {
    const duplicate: AttendanceRecord = {
      ...existing,
      id: generateId("att"),
      scannedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "duplicate",
    };
    attendanceRecords = [duplicate, ...attendanceRecords];
    return duplicate;
  }
  const record: AttendanceRecord = {
    id: generateId("att"),
    eventId,
    memberId: member.id,
    memberName: member.fullName,
    memberEmail: member.email,
    day,
    eventDay,
    scannedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    scannedBy: "staff-001",
    status: "ok",
  };
  attendanceRecords = [record, ...attendanceRecords];
  return record;
}

export async function searchAttendance(query?: string) {
  await wait(150);
  if (!query) return [...attendanceRecords];
  const normalized = query.toLowerCase();
  return attendanceRecords.filter((record) =>
    record.memberName.toLowerCase().includes(normalized)
  );
}

export async function listAttendance(eventId?: string) {
  await wait(150);
  if (!eventId) return [...attendanceRecords];
  return attendanceRecords.filter((record) => record.eventId === eventId);
}

export async function listBulkTiers(_eventId: string) {
  await wait(150);
  return [...mockBulkTiers];
}

export async function saveBulkTiers(_eventId: string, tiers: BulkTier[]) {
  await wait(200);
  return tiers;
}

export async function listOrganizationInvites() {
  await wait(200);
  return [];
}

export async function acceptOrganizationInvite(token: string) {
  await wait(200);
  return {
    id: generateId("invite"),
    organizationId: organizations[0]?.id ?? "",
    organizationName: organizations[0]?.name ?? "",
    email: "member@example.com",
    status: "accepted",
    token,
    invitedAt: "2026-02-15",
    acceptedAt: "2026-02-20",
  };
}

export async function inviteOrganizationMembers(_orgId: string, emails: string[]) {
  await wait(200);
  return emails.map((email) => ({
    id: generateId("invite"),
    organizationId: organizations[0]?.id ?? "",
    organizationName: organizations[0]?.name ?? "",
    email,
    status: "pending",
    token: generateId("token"),
    invitedAt: "2026-02-15",
  }));
}

export async function listMyPresentations(_eventId: string) {
  await wait(200);
  return [];
}

export async function uploadPresentation(_eventId: string, file: File) {
  await wait(200);
  return {
    id: generateId("pres"),
    eventId: _eventId,
    memberId: "member-1",
    fileName: file.name,
    fileUrl: "#",
    uploadedAt: new Date().toISOString(),
  };
}

export async function deletePresentation(_id: string) {
  await wait(150);
  return { ok: true };
}

export async function listEventSpeakers(_eventId: string) {
  await wait(200);
  return [];
}

export async function downloadPresentation(_presentationId: string) {
  await wait(150);
  return { url: "#" };
}

export async function downloadMyDiploma(_recordId: string) {
  await wait(150);
  return { url: "#" };
}
