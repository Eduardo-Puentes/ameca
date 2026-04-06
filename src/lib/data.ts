import * as api from "@/lib/api";
import * as mock from "@/lib/mock/api";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

type AnyFn = (...args: any[]) => any;

const pick = <F extends AnyFn>(apiFn: F, mockFn?: AnyFn): F =>
  ((...args: Parameters<F>): ReturnType<F> => {
    if (useMock && mockFn) {
      return mockFn(...args) as ReturnType<F>;
    }
    return apiFn(...args);
  }) as F;

export const authLogin = pick(api.authLogin, mock.authLogin);
export const authLoginWithCredentials = pick(
  api.authLoginWithCredentials,
  mock.authLoginWithCredentials
);
export const authRegister = pick(api.authRegister, mock.authRegister);
export const authRegisterRepresentative = pick(
  api.authRegisterRepresentative,
  mock.authRegisterRepresentative
);
export const verifyEmail = pick(api.verifyEmail);
export const authMe: typeof api.authMe = () => {
  if (!useMock) return api.authMe();
  return mock.authLogin("member").then(
    (response) => response.user as Awaited<ReturnType<typeof api.authMe>>
  );
};
export const listEvents = pick(api.listEvents, mock.listEvents);
export const getEvent = pick(api.getEvent, mock.getEvent);
export const getMyTicket = pick(api.getMyTicket, mock.getMyTicket);
export const createEvent = pick(api.createEvent, mock.createEvent);
export const uploadEventBanner = pick(api.uploadEventBanner, mock.uploadEventBanner);
export const updateEvent = pick(api.updateEvent, mock.updateEvent);
export const deleteEvent = pick(api.deleteEvent, mock.deleteEvent);
export const listMembers = pick(api.listMembers, mock.listMembers);
export const createAdminUser = pick(api.createAdminUser, mock.createAdminUser);
export const listOrganizations = pick(api.listOrganizations, mock.listOrganizations);
export const listMyOrganizationRequests = pick(
  api.listMyOrganizationRequests,
  mock.listMyOrganizationRequests
);
export const createOrganizationJoinRequest = pick(
  api.createOrganizationJoinRequest,
  mock.createOrganizationJoinRequest
);
export const listOrganizationJoinRequests = pick(
  api.listOrganizationJoinRequests,
  mock.listOrganizationJoinRequests
);
export const updateOrganizationJoinRequest = pick(
  api.updateOrganizationJoinRequest,
  mock.updateOrganizationJoinRequest
);
export const listPendingOrganizations = pick(
  api.listPendingOrganizations,
  mock.listPendingOrganizations
);
export const updateOrganizationStatus = pick(
  api.updateOrganizationStatus,
  mock.updateOrganizationStatus
);
export const listOrganizationInvites = pick(
  api.listOrganizationInvites,
  mock.listOrganizationInvites
);
export const acceptOrganizationInvite = pick(
  api.acceptOrganizationInvite,
  mock.acceptOrganizationInvite
);
export const inviteOrganizationMembers = pick(
  api.inviteOrganizationMembers,
  mock.inviteOrganizationMembers
);
export const listMyPresentations = pick(api.listMyPresentations, mock.listMyPresentations);
export const uploadPresentation = pick(api.uploadPresentation, mock.uploadPresentation);
export const deletePresentation = pick(api.deletePresentation, mock.deletePresentation);
export const listEventSpeakers = pick(api.listEventSpeakers, mock.listEventSpeakers);
export const downloadPresentation = pick(api.downloadPresentation, mock.downloadPresentation);
export const downloadMyDiploma = pick(api.downloadMyDiploma, mock.downloadMyDiploma);
export const getMemberMe: typeof api.getMemberMe = async () => {
  if (!useMock) return api.getMemberMe();
  const [first] = await mock.listMembers();
  if (!first) {
    throw new Error("Member not found");
  }
  return first;
};
export const updateMember = pick(api.updateMember, mock.updateMember);
export const listMemberRequests = pick(api.listMemberRequests, mock.listMemberRequests);
export const approveMemberRequest = pick(api.approveMemberRequest, mock.approveMemberRequest);
export const denyMemberRequest = pick(api.denyMemberRequest, mock.denyMemberRequest);
export const listEventRequests = pick(api.listEventRequests, mock.listEventRequests);
export const listMyEventRequests = pick(api.listMyEventRequests, mock.listEventRequests);
export const approveEventRequest = pick(api.approveEventRequest, mock.approveEventRequest);
export const denyEventRequest = pick(api.denyEventRequest, mock.denyEventRequest);
export const createEventRequest = pick(api.createEventRequest, mock.createEventRequest);
export const listSectionRequests = pick(api.listSectionRequests, mock.listSectionRequests);
export const approveSectionRequest = pick(
  api.approveSectionRequest,
  mock.approveSectionRequest
);
export const denySectionRequest = pick(api.denySectionRequest, mock.denySectionRequest);
export const listSections = pick(api.listSections, mock.listSections);
export const updateSection = pick(api.updateSection, mock.updateSection);
export const listSectionInvites = pick(api.listSectionInvites);
export const createSectionInvite = pick(api.createSectionInvite);
export const acceptSectionInvite = pick(api.acceptSectionInvite);
export const listBulkLinks = pick(api.listBulkLinks, mock.listBulkLinks);
export const createBulkLink = pick(api.createBulkLink, mock.createBulkLink);
export const sendBulkInvites = pick(api.sendBulkInvites, mock.sendBulkInvites);
export const validateBulkToken = pick(api.validateBulkToken, mock.validateBulkToken);
export const registerViaBulk = pick(api.registerViaBulk, mock.registerViaBulk);
export const getDiplomaTemplate = pick(api.getDiplomaTemplate, mock.getDiplomaTemplate);
export const saveDiplomaTemplate = pick(api.saveDiplomaTemplate, mock.saveDiplomaTemplate);
export const computeAttendanceSummary = pick(
  api.computeAttendanceSummary,
  mock.computeAttendanceSummary
);
export const generateDiplomas = pick(api.generateDiplomas, mock.generateDiplomas);
export const listDiplomasByEvent = pick(api.listDiplomasByEvent, mock.listDiplomasByEvent);
export const sendDiplomas = pick(api.sendDiplomas, mock.sendDiplomas);
export const sendDiplomaRecord = pick(api.sendDiplomaRecord, mock.sendDiplomaRecord);
export const listMyDiplomas = pick(api.listMyDiplomas, mock.listMyDiplomas);
export const recordAttendanceScan = pick(api.recordAttendanceScan, mock.recordAttendanceScan);
export const searchAttendance = pick(api.searchAttendance, mock.searchAttendance);
export const listAttendance = pick(api.listAttendance, mock.listAttendance);
export const listBulkTiers = pick(api.listBulkTiers, mock.listBulkTiers);
export const saveBulkTiers = pick(api.saveBulkTiers, mock.saveBulkTiers);
export const createMembershipUpgradeRequest = pick(
  api.createMembershipUpgradeRequest,
  mock.createMembershipUpgradeRequest
);
export const listMembershipUpgradeRequests = pick(
  api.listMembershipUpgradeRequests,
  mock.listMembershipUpgradeRequests
);
