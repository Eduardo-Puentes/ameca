import * as api from "@/lib/api";
import * as mock from "@/lib/mock/api";
import { tokenStorage } from "@/lib/authStorage";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

type AnyFn = (...args: never[]) => unknown;

const pick = <F extends AnyFn>(apiFn: F, mockFn?: AnyFn): F =>
  ((...args: Parameters<F>): ReturnType<F> => {
    if (useMock && mockFn) {
      return mockFn(...args) as ReturnType<F>;
    }
    return apiFn(...args) as ReturnType<F>;
  }) as F;

export const authLogin = pick(api.authLogin, mock.authLogin);
export const authLoginWithCredentials = pick(
  api.authLoginWithCredentials,
  mock.authLoginWithCredentials
);
export const authRegister = pick(api.authRegister, mock.authRegister);
export const authLogout = pick(api.authLogout);
export const verifyEmail = pick(api.verifyEmail);
export const authMe: typeof api.authMe = () => {
  if (!useMock) return api.authMe();
  const token = tokenStorage.get();
  const matchedRole = token?.match(/^mock\.jwt\.([^.]+)\.\d+$/)?.[1];
  const fallbackRole = matchedRole === "superadmin" ||
    matchedRole === "admin" ||
    matchedRole === "treasurer" ||
    matchedRole === "staff" ||
    matchedRole === "member" ||
    matchedRole === "representative"
      ? matchedRole
      : "member";
  return mock.authLogin(fallbackRole).then(
    (response) => response.user as Awaited<ReturnType<typeof api.authMe>>
  );
};
export const listEvents = pick(api.listEvents, mock.listEvents);
export const getEvent = pick(api.getEvent, mock.getEvent);
export const getMyTicket = pick(api.getMyTicket, mock.getMyTicket);
export const listMyEvents = pick(api.listMyEvents, mock.listMyEvents);
export const createEvent = pick(api.createEvent, mock.createEvent);
export const updateEvent = pick(api.updateEvent, mock.updateEvent);
export const deleteEvent = pick(api.deleteEvent, mock.deleteEvent);
export const listMembers = pick(api.listMembers, mock.listMembers);
export const listAdminUsers = pick(api.listAdminUsers);
export const createAdminUser = pick(api.createAdminUser, mock.createAdminUser);
export const updateAdminUser = pick(api.updateAdminUser);
export const resetAdminUserPassword = pick(api.resetAdminUserPassword);
export const deleteAdminUser = pick(api.deleteAdminUser);
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
export const updateMemberMe: typeof api.updateMemberMe = async (payload) => {
  if (!useMock) return api.updateMemberMe(payload);
  const [first] = await mock.listMembers();
  if (!first) {
    throw new Error("Member not found");
  }
  const updated = await mock.updateMember(first.id, payload);
  if (!updated) {
    throw new Error("Member not found");
  }
  return updated;
};
export const updateMember = pick(api.updateMember, mock.updateMember);
export const deleteMember = pick(api.deleteMember, mock.deleteMember);
export const listMemberRequests = pick(api.listMemberRequests, mock.listMemberRequests);
export const getMemberRequest = pick(api.getMemberRequest, mock.getMemberRequest);
export const approveMemberRequest = pick(api.approveMemberRequest, mock.approveMemberRequest);
export const denyMemberRequest = pick(api.denyMemberRequest, mock.denyMemberRequest);
export const listEventRequests = pick(api.listEventRequests, mock.listEventRequests);
export const listAdminEventRequests = pick(api.listAdminEventRequests, mock.listAdminEventRequests);
export const listEventMembers = pick(api.listEventMembers, mock.listEventMembers);
export const getEventRequest = pick(api.getEventRequest, mock.getEventRequest);
export const listMyEventRequests = pick(api.listMyEventRequests, mock.listMyEventRequests);
export const approveEventRequest = pick(api.approveEventRequest, mock.approveEventRequest);
export const denyEventRequest = pick(api.denyEventRequest, mock.denyEventRequest);
export const createEventRequest = pick(api.createEventRequest, mock.createEventRequest);
export const createSectionRequest = pick(api.createSectionRequest, mock.createSectionRequest);
export const listSectionRequests = pick(api.listSectionRequests, mock.listSectionRequests);
export const approveSectionRequest = pick(
  api.approveSectionRequest,
  mock.approveSectionRequest
);
export const denySectionRequest = pick(api.denySectionRequest, mock.denySectionRequest);
export const listSections = pick(api.listSections, mock.listSections);
export const getSection = pick(api.getSection, mock.getSection);
export const updateSection = pick(api.updateSection, mock.updateSection);
export const deleteSection = pick(api.deleteSection, mock.deleteSection);
export const removeSectionMember = pick(api.removeSectionMember, mock.removeSectionMember);
export const listSectionInvites = pick(api.listSectionInvites);
export const createSectionInvite = pick(api.createSectionInvite);
export const listMySectionInvites = pick(api.listMySectionInvites);
export const acceptSectionInvite = pick(api.acceptSectionInvite);
export const declineSectionInvite = pick(api.declineSectionInvite);
export const cancelSectionInvite = pick(api.cancelSectionInvite);
export const transferSectionRepresentative = pick(api.transferSectionRepresentative);
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
export const createMembershipUpgradeRequest = pick(
  api.createMembershipUpgradeRequest,
  mock.createMembershipUpgradeRequest
);
export const listMembershipUpgradeRequests = pick(
  api.listMembershipUpgradeRequests,
  mock.listMembershipUpgradeRequests
);
