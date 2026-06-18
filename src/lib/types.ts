export type BackendRole = "superuser" | "admin" | "treasurer" | "staff" | "member";

export type Role =
  | "superadmin"
  | "admin"
  | "treasurer"
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

export type RequestStatusCounts = {
  pending: number;
  approved: number;
  rejected: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts?: RequestStatusCounts;
  unfilteredTotal?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AdminRole = Extract<BackendRole, "admin" | "treasurer" | "staff">;

export type Event = {
  id: string;
  name: string;
  startDate: number | string;
  duration: number;
  open: boolean;
  location: string;
  description: string;
  abstractPdfKey?: string;
  abstractPdfUrl?: string;
  capacity: number;
  profilePrices: EventProfilePrices;
  status: "open" | "closed";
};

export type PublicEventSpeaker = {
  id: string;
  name: string;
  title?: MemberTitle | string | null;
  speakerType: SpeakerType;
  photoUrl: string;
};

export type EventProfilePrices = {
  professional: number;
  student: number;
  associatedProfessional: number;
  associatedStudent: number;
};

export type RequestStatus = "pending" | "approved" | "rejected";
export type CostType = "all" | "paid" | "free";
export type RequestStatusFilter = "all" | RequestStatus;
export type ProfileType =
  | "professional"
  | "student"
  | "associated_professional"
  | "associated_student";

export type AcademicDegree =
  | "doctorado"
  | "maestria"
  | "licenciatura"
  | "bachiller"
  | "other";

export type MemberState =
  | "aguascalientes"
  | "baja_california"
  | "baja_california_sur"
  | "campeche"
  | "chiapas"
  | "chihuahua"
  | "ciudad_de_mexico"
  | "coahuila"
  | "colima"
  | "durango"
  | "estado_de_mexico"
  | "guanajuato"
  | "guerrero"
  | "hidalgo"
  | "jalisco"
  | "michoacan"
  | "morelos"
  | "nayarit"
  | "nuevo_leon"
  | "oaxaca"
  | "puebla"
  | "queretaro"
  | "quintana_roo"
  | "san_luis_potosi"
  | "sinaloa"
  | "sonora"
  | "tabasco"
  | "tamaulipas"
  | "tlaxcala"
  | "veracruz"
  | "yucatan"
  | "zacatecas"
  | "other";

export type MemberTitle =
  | "dr"
  | "dra"
  | "mtro"
  | "mtra"
  | "ing"
  | "lic"
  | "sr"
  | "sra"
  | "srta"
  | "other";

export type EventRequest = {
  id: string;
  eventId: string;
  eventName: string;
  memberId?: string;
  memberName: string;
  memberEmail: string;
  memberPhoneNumber?: string;
  sectionId?: string | null;
  sectionName: string;
  status: RequestStatus;
  calculatedCost?: number;
  paymentProofUrl?: string;
  comments?: string;
  createdAt: number | string;
  isSpeaker?: boolean;
  decidedAt?: number | string | null;
  decidedById?: string | null;
  decidedByName?: string;
  paymentApprovedAt?: number | string | null;
  paymentApprovedById?: string | null;
  paymentApprovedByName?: string;
  requestApprovedAt?: number | string | null;
  requestApprovedById?: string | null;
  requestApprovedByName?: string;
  paymentProofs?: PaymentProof[];
};

export type EventMemberRegistration = {
  id: string;
  eventId: string;
  event: Event | null;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhoneNumber: string;
  profileType: ProfileType | string;
  organization: string;
  sectionId: string | null;
  sectionName: string;
  ticketToken: string;
  cost: number;
  isSpeaker: boolean;
  speakerType?: SpeakerType;
  title?: MemberTitle | string | null;
  speakerPhotoUrl?: string;
  speakerDescription?: string;
  attended: boolean;
  approvedAt: number | string | null;
  approvedById: string | null;
  approvedByName: string;
  paymentProofs?: PaymentProof[];
  presentations?: Presentation[];
};

export type MemberEventRegistration = {
  id: string;
  eventId: string;
  event: Event;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhoneNumber?: string;
  profileType?: ProfileType | string;
  organization?: string;
  sectionId: string | null;
  sectionName: string;
  ticketToken: string;
  cost: number;
  isSpeaker: boolean;
  speakerType?: SpeakerType;
  title?: MemberTitle | string | null;
  speakerPhotoUrl?: string;
  speakerDescription?: string;
  attended: boolean;
  approvedAt: number | string | null;
  approvedById: string | null;
  approvedByName: string;
  paymentProofs?: PaymentProof[];
  presentations?: Presentation[];
};

export type EventRegistrationPreview = {
  eventId: string;
  profileType: ProfileType | string;
  baseCost: number;
  calculatedCost: number;
  paymentProofRequired: boolean;
  sectionId: string | null;
  sectionName: string;
  sectionMemberCount: number | null;
  sectionDiscountPercent: number;
};

export type SectionRequestStatus = RequestStatus;

export type Section = {
  id: string;
  eventId: string;
  eventName?: string;
  name: string;
  representativeName: string;
  pCount: number;
  status: SectionRequestStatus;
};

export type MySection = Section & {
  membershipId: string;
  joinedAt: number | string;
  isRepresentative: boolean;
};

export type SectionRepresentative = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileType: ProfileType | string;
  organization: string;
};

export type SectionMember = {
  id: string;
  sectionId: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhoneNumber: string;
  profileType: ProfileType | string;
  organization: string;
  isRepresentative: boolean;
  createdAt: number | string;
};

export type SectionDetail = Section & {
  event: Event | null;
  representative: SectionRepresentative | null;
  memberCount: number;
  members: SectionMember[];
};

export type SectionRequest = {
  id: string;
  eventId: string;
  eventName: string;
  name: string;
  representativeName: string;
  status: SectionRequestStatus;
  comments?: string;
  createdAt: number | string;
};

export type MembershipRequest = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  memberPhoneNumber?: string;
  currentProfileType?: ProfileType | string;
  profileType: string;
  status: RequestStatus;
  schoolIdentificationUrl?: string;
  cvUrl?: string;
  upgradeCost?: number;
  paymentProofUrl?: string;
  comments?: string;
  createdAt: number | string;
  decidedAt?: number | string | null;
  decidedById?: string | null;
  decidedByName?: string;
  paymentApprovedAt?: number | string | null;
  paymentApprovedById?: string | null;
  paymentApprovedByName?: string;
  requestApprovedAt?: number | string | null;
  requestApprovedById?: string | null;
  requestApprovedByName?: string;
  paymentProofs?: PaymentProof[];
};

export type PaymentProof = {
  id: string;
  memberId: string;
  eventMemberRequestId?: string;
  membershipRequestId?: string;
  eventMemberId?: string;
  fileKey: string;
  fileName: string;
  contentType?: string;
  fileUrl: string;
  uploadedAt: number | string;
  deletedAt?: number | string | null;
  deleted?: boolean;
};

export type MembershipPrices = {
  profilePrices: EventProfilePrices;
  items: Array<{ profileType: ProfileType; cost: number }>;
};

export type SectionDiscountSettings = {
  thresholdCount: number;
  higherThresholdCount: number;
  belowThresholdPercent: number;
  atOrAboveThresholdPercent: number;
  allowedDiscountPercents: number[];
};

export type SpeakerType = "none" | "keynote" | "plenary";

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
  profileType: ProfileType | string;
  verified: boolean;
  phoneNumber: string;
  expirationDate?: number | string | null;
};

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileType: ProfileType | string;
  academicDegree?: AcademicDegree | string;
  state?: MemberState | string;
  institution?: string;
  title?: MemberTitle | string | null;
  verified: boolean;
  expirationDate?: number | string | null;
  role: Role;
  organization?: string;
  organizationId?: string;
  paymentProofKey?: string;
  paymentProofUrl?: string;
  schoolIdentificationKey?: string;
  schoolIdentificationUrl?: string;
  cvKey?: string;
  cvUrl?: string;
};

export type MemberUpdatePayload = Partial<
  Pick<
    Member,
    | "fullName"
    | "phoneNumber"
    | "profileType"
    | "academicDegree"
    | "state"
    | "institution"
    | "title"
    | "expirationDate"
    | "verified"
  >
>;

export type MemberImportIssue = {
  row: number;
  email?: string;
  errors: string[];
};

export type MemberImportRowSummary = {
  row: number;
  email: string;
  name?: string;
  reason?: string;
};

export type MemberImportEmailFailure = {
  row: number;
  email: string;
  error: string;
};

export type MemberImportResult = {
  dryRun: boolean;
  totalRows: number;
  validRows: number;
  created: number;
  emailSent: number;
  emailFailed: number;
  skippedExisting: number;
  invalidRows: number;
  createdRows: MemberImportRowSummary[];
  skippedRows: MemberImportRowSummary[];
  emailFailedRows: MemberImportEmailFailure[];
  issues: MemberImportIssue[];
  maxRows: number;
};

export type AdminUser = {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: AdminRole;
  profileType: ProfileType | string;
  expirationDate?: number | string | null;
  verified: boolean;
};

export type AdminUserCreatePayload = {
  fullName: string;
  email: string;
  role: AdminRole;
};

export type AdminUserCreateResult = {
  id: string;
  email: string;
  role: AdminRole;
  tempPassword?: string;
};

export type AdminUserUpdatePayload = Partial<AdminUserCreatePayload>;

export type EventUpsertPayload = Partial<
  Pick<
    Event,
    | "name"
    | "startDate"
    | "duration"
    | "open"
    | "location"
    | "description"
    | "capacity"
    | "profilePrices"
    | "status"
  >
> & {
  abstractPdfFile?: File | null;
};

export type OrganizationStatus = "pending" | "approved" | "rejected";

export type Organization = {
  id: string;
  name: string;
  status: OrganizationStatus;
  representativeName?: string;
  createdAt: string;
};

export type OrganizationRequest = {
  id: string;
  organizationId: string;
  organizationName: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  status: RequestStatus;
  comments?: string;
  createdAt: string;
};

export type OrganizationInvitation = {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  token: string;
  invitedAt: string;
  acceptedAt?: string;
};

export type SectionInvite = {
  id: string;
  sectionId: string;
  eventId: string;
  eventName?: string;
  sectionName?: string;
  invitedMemberId: string;
  invitedMemberName?: string;
  invitedMemberEmail?: string;
  createdByMemberId?: string;
  createdByMemberName?: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: number | string;
  acceptedAt?: number | string | null;
  respondedAt?: number | string | null;
};

export type Presentation = {
  id: string;
  eventMemberId?: string;
  eventId: string;
  memberId: string;
  name?: string;
  description?: string;
  presenterName?: string;
  presenterEmail?: string;
  presentationType?: "poster" | "oral" | "POSTER" | "ORAL";
  confirmationCode?: string;
  confirmed?: boolean;
  confirmedAt?: number | string | null;
  fileName?: string;
  fileUrl: string;
  uploadedAt: number | string;
  updatedAt?: number | string;
  memberName?: string;
  memberEmail?: string;
};

export type PresentationImportResult = {
  items: Presentation[];
  errors: Array<{ row: number; error: string }>;
  emailErrors: Array<{ email: string; error: string }>;
  count: number;
  errorCount: number;
  emailErrorCount: number;
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
  issuedAt?: number | string | null;
  sentAt?: number | string | null;
  previewData?: Record<string, string>;
};

export type AttendanceRecord = {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  attended?: boolean;
  status?: "ok" | "duplicate";
  day?: number;
  eventDay?: string;
  scannedAt?: string;
  scannedBy?: string;
};
