import type {
  BulkLink,
  Event,
  EventRequest,
  Member,
  MemberProfile,
  RegistrationStatus,
  Section,
  SectionRequest,
  User,
} from "./types";

export const mockAdminUser: User = {
  id: "admin-001",
  name: "Ariana Torres",
  email: "admin@ameca.org",
  role: "admin",
};

export const mockMemberUser: User = {
  id: "member-014",
  name: "Jordan Lee",
  email: "jordan.lee@uni.edu",
  role: "member",
};

export const mockEvents: Event[] = [
  {
    id: "event-2026",
    name: "Cumbre Anual AMECA 2026",
    startDate: "2026-04-12",
    duration: 3,
    open: true,
  },
  {
    id: "event-2025",
    name: "Simposio Regional de Investigación",
    startDate: "2025-10-03",
    duration: 1,
    open: false,
  },
];

export const mockEventRequests: EventRequest[] = [
  {
    id: "req-1001",
    eventId: "event-2026",
    memberName: "Eli Novak",
    memberEmail: "eli.novak@uni.edu",
    sectionName: "Interfaces Neuronales",
    status: "pending",
    paymentProofUrl: "#",
  },
  {
    id: "req-1002",
    eventId: "event-2026",
    memberName: "Priya Rao",
    memberEmail: "priya.rao@med.org",
    sectionName: "Traducción Clínica",
    status: "pending",
    paymentProofUrl: "#",
  },
  {
    id: "req-1003",
    eventId: "event-2025",
    memberName: "Morgan Chen",
    memberEmail: "m.chen@lab.edu",
    sectionName: "Materiales",
    status: "approved",
    paymentProofUrl: "#",
  },
];

export const mockSectionRequests: SectionRequest[] = [
  {
    id: "sec-900",
    eventId: "event-2026",
    eventName: "Cumbre Anual AMECA 2026",
    representativeName: "Dr. Riley Shaw",
    pCount: 18,
    status: "pending",
  },
  {
    id: "sec-901",
    eventId: "event-2026",
    eventName: "Cumbre Anual AMECA 2026",
    representativeName: "Prof. Ana Malik",
    pCount: 12,
    status: "pending",
  },
];

export const mockBulkLinks: BulkLink[] = [
  {
    id: "bulk-401",
    eventId: "event-2026",
    orgName: "Northview University",
    token: "BULK-NVU-7F8A",
    maxUses: 40,
    usedCount: 11,
    expiresAt: "2026-04-05",
    createdByAdmin: "Ariana Torres",
  },
];

export const mockMemberProfile: MemberProfile = {
  id: "member-014",
  fullName: "Jordan Lee",
  email: "jordan.lee@uni.edu",
  profileType: "Estudiante",
  verified: true,
  expirationDate: "2026-12-31",
};

export const mockRegistrationStatus: RegistrationStatus = {
  status: "pending",
  comments: "En espera de verificación de pago.",
};

export const mockMembers: Member[] = [
  {
    id: "member-014",
    fullName: "Jordan Lee",
    email: "jordan.lee@uni.edu",
    profileType: "Estudiante",
    verified: true,
    expirationDate: "2026-12-31",
    role: "member",
  },
  {
    id: "member-021",
    fullName: "Eli Novak",
    email: "eli.novak@uni.edu",
    profileType: "Estudiante",
    verified: false,
    expirationDate: "2025-09-30",
    role: "member",
  },
  {
    id: "member-032",
    fullName: "Dr. Riley Shaw",
    email: "riley.shaw@lab.org",
    profileType: "Representante",
    verified: true,
    expirationDate: "2026-06-15",
    role: "representative",
  },
];

export const mockSections: Section[] = [
  {
    id: "section-101",
    eventId: "event-2026",
    name: "Interfaces Neuronales",
    representativeName: "Dr. Riley Shaw",
    pCount: 18,
    status: "approved",
  },
  {
    id: "section-102",
    eventId: "event-2026",
    name: "Traducción Clínica",
    representativeName: "Prof. Ana Malik",
    pCount: 12,
    status: "pending",
  },
  {
    id: "section-103",
    eventId: "event-2025",
    name: "Materiales",
    representativeName: "Morgan Chen",
    pCount: 10,
    status: "approved",
  },
];
