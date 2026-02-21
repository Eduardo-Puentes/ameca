export type Role =
  | "superadmin"
  | "admin"
  | "staff"
  | "member"
  | "representative";

export type Status =
  | "pending"
  | "approved"
  | "rejected"
  | "open"
  | "closed"
  | "expired"
  | "generated"
  | "sent"
  | "failed";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Event = {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  open: boolean;
  location: string;
  description: string;
  capacity: number;
  status: "open" | "closed";
};

export type RequestStatus = "pending" | "approved" | "rejected";

export type EventRequest = {
  id: string;
  eventId: string;
  eventName: string;
  memberName: string;
  memberEmail: string;
  sectionName: string;
  status: RequestStatus;
  paymentProofUrl?: string;
  comments?: string;
  createdAt: string;
};

export type SectionRequestStatus = RequestStatus;

export type Section = {
  id: string;
  eventId: string;
  name: string;
  representativeName: string;
  pCount: number;
  status: SectionRequestStatus;
};

export type SectionRequest = {
  id: string;
  eventId: string;
  eventName: string;
  representativeName: string;
  pCount: number;
  status: SectionRequestStatus;
  createdAt: string;
};

export type MembershipRequest = {
  id: string;
  memberId: string;
  memberName: string;
  profileType: string;
  status: RequestStatus;
  paymentProofUrl?: string;
  comments?: string;
  createdAt: string;
};

export type BulkTier = {
  id: string;
  min: number;
  max: number;
  discountPercent: number;
  maxUses: number;
};

export type BulkLink = {
  id: string;
  eventId: string;
  orgName: string;
  token: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdByAdmin: string;
  status: "active" | "expired";
  tiers: BulkTier[];
};

export type MemberProfile = {
  id: string;
  fullName: string;
  email: string;
  profileType: string;
  verified: boolean;
  expirationDate: string;
};

export type Member = {
  id: string;
  fullName: string;
  email: string;
  profileType: string;
  verified: boolean;
  expirationDate: string;
  role: Role;
  organization?: string;
};

export type RegistrationStatus = {
  status: RequestStatus;
  comments?: string;
};

export type BulkValidation = {
  token: string;
  valid: boolean;
  allowed: boolean;
  message: string;
  orgName?: string;
  discountPercent?: number;
};

export type DiplomaFieldKey =
  | "participant.full_name"
  | "participant.email"
  | "event.name"
  | "event.start_date"
  | "organization"
  | "attended_days"
  | "issue_date"
  | "custom_text";

export type DiplomaFieldStyle = {
  fontSize: number;
  bold: boolean;
  align: "left" | "center" | "right";
  color: string;
};

export type DiplomaField = {
  id: string;
  key: DiplomaFieldKey;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: DiplomaFieldStyle;
  customText?: string;
};

export type DiplomaTemplate = {
  id: string;
  eventId: string;
  templateAssetUrl: string;
  templateAssetName?: string;
  templateAssetType?: "image" | "pdf";
  createdAt: string;
  updatedAt: string;
  fields: DiplomaField[];
};

export type DiplomaRecordStatus = "generated" | "sent" | "failed";

export type DiplomaRecord = {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  attendedDays: number;
  minRequiredDays: number;
  status: DiplomaRecordStatus;
  issuedAt: string;
  sentAt?: string;
  previewData?: Record<string, string>;
};

export type AttendanceRecord = {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  day: number;
  eventDay?: string;
  scannedAt: string;
  scannedBy: string;
  status: "ok" | "duplicate";
};
