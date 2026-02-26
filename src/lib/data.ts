import * as mock from "@/lib/mock/api";
import * as api from "@/lib/api";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const authLogin = (...args: Parameters<typeof mock.authLogin>) =>
  useMock ? mock.authLogin(...args) : api.authLogin(...(args as any));

export const authLoginWithCredentials = (
  ...args: Parameters<typeof api.authLoginWithCredentials>
) =>
  useMock
    ? (mock.authLoginWithCredentials as any)(...args)
    : api.authLoginWithCredentials(...(args as any));

export const authRegister = (...args: Parameters<typeof api.authRegister>) =>
  useMock ? (mock.authRegister as any)(...args) : api.authRegister(...(args as any));

export const authRegisterRepresentative = (
  ...args: Parameters<typeof api.authRegisterRepresentative>
) =>
  useMock
    ? (mock.authRegisterRepresentative as any)(...args)
    : api.authRegisterRepresentative(...(args as any));

export const authMe = (...args: Parameters<typeof api.authMe>) =>
  useMock
    ? (mock.authLogin as any)("member").then((response: any) => response.user)
    : api.authMe(...(args as any));

export const listEvents = (...args: Parameters<typeof mock.listEvents>) =>
  useMock ? mock.listEvents(...args) : api.listEvents(...(args as any));

export const getEvent = (...args: Parameters<typeof mock.getEvent>) =>
  useMock ? mock.getEvent(...args) : api.getEvent(...(args as any));

export const createEvent = (...args: Parameters<typeof mock.createEvent>) =>
  useMock ? mock.createEvent(...args) : api.createEvent(...(args as any));

export const updateEvent = (...args: Parameters<typeof mock.updateEvent>) =>
  useMock ? mock.updateEvent(...args) : api.updateEvent(...(args as any));

export const deleteEvent = (...args: Parameters<typeof mock.deleteEvent>) =>
  useMock ? mock.deleteEvent(...args) : api.deleteEvent(...(args as any));

export const listMembers = (...args: Parameters<typeof mock.listMembers>) =>
  useMock ? mock.listMembers(...args) : api.listMembers(...(args as any));

export const createAdminUser = (...args: Parameters<typeof mock.createAdminUser>) =>
  useMock ? mock.createAdminUser(...args) : api.createAdminUser(...(args as any));

export const listOrganizations = (...args: Parameters<typeof mock.listOrganizations>) =>
  useMock ? mock.listOrganizations(...args) : api.listOrganizations(...(args as any));

export const listMyOrganizationRequests = (
  ...args: Parameters<typeof mock.listMyOrganizationRequests>
) =>
  useMock
    ? mock.listMyOrganizationRequests(...args)
    : api.listMyOrganizationRequests(...(args as any));

export const createOrganizationJoinRequest = (
  ...args: Parameters<typeof mock.createOrganizationJoinRequest>
) =>
  useMock
    ? mock.createOrganizationJoinRequest(...args)
    : api.createOrganizationJoinRequest(...(args as any));

export const listOrganizationJoinRequests = (
  ...args: Parameters<typeof mock.listOrganizationJoinRequests>
) =>
  useMock
    ? mock.listOrganizationJoinRequests(...args)
    : api.listOrganizationJoinRequests(...(args as any));

export const updateOrganizationJoinRequest = (
  ...args: Parameters<typeof mock.updateOrganizationJoinRequest>
) =>
  useMock
    ? mock.updateOrganizationJoinRequest(...args)
    : api.updateOrganizationJoinRequest(...(args as any));

export const listPendingOrganizations = (
  ...args: Parameters<typeof mock.listPendingOrganizations>
) =>
  useMock
    ? mock.listPendingOrganizations(...args)
    : api.listPendingOrganizations(...(args as any));

export const updateOrganizationStatus = (
  ...args: Parameters<typeof mock.updateOrganizationStatus>
) =>
  useMock
    ? mock.updateOrganizationStatus(...args)
    : api.updateOrganizationStatus(...(args as any));

export const getMemberMe = (...args: Parameters<typeof api.getMemberMe>) =>
  useMock ? mock.listMembers().then((items) => items[0]) : api.getMemberMe(...(args as any));

export const updateMember = (...args: Parameters<typeof mock.updateMember>) =>
  useMock ? mock.updateMember(...args) : api.updateMember(...(args as any));

export const listMemberRequests = (...args: Parameters<typeof mock.listMemberRequests>) =>
  useMock ? mock.listMemberRequests(...args) : api.listMemberRequests(...(args as any));

export const approveMemberRequest = (...args: Parameters<typeof mock.approveMemberRequest>) =>
  useMock ? mock.approveMemberRequest(...args) : api.approveMemberRequest(...(args as any));

export const denyMemberRequest = (...args: Parameters<typeof mock.denyMemberRequest>) =>
  useMock ? mock.denyMemberRequest(...args) : api.denyMemberRequest(...(args as any));

export const listEventRequests = (...args: Parameters<typeof mock.listEventRequests>) =>
  useMock ? mock.listEventRequests(...args) : api.listEventRequests(...(args as any));

export const listMyEventRequests = (...args: Parameters<typeof api.listMyEventRequests>) =>
  useMock
    ? mock.listEventRequests(...(args as any))
    : api.listMyEventRequests(...(args as any));

export const approveEventRequest = (...args: Parameters<typeof mock.approveEventRequest>) =>
  useMock ? mock.approveEventRequest(...args) : api.approveEventRequest(...(args as any));

export const denyEventRequest = (...args: Parameters<typeof mock.denyEventRequest>) =>
  useMock ? mock.denyEventRequest(...args) : api.denyEventRequest(...(args as any));

export const createEventRequest = (...args: Parameters<typeof mock.createEventRequest>) =>
  useMock ? mock.createEventRequest(...args) : api.createEventRequest(...(args as any));

export const listSectionRequests = (...args: Parameters<typeof mock.listSectionRequests>) =>
  useMock ? mock.listSectionRequests(...args) : api.listSectionRequests(...(args as any));

export const approveSectionRequest = (...args: Parameters<typeof mock.approveSectionRequest>) =>
  useMock ? mock.approveSectionRequest(...args) : api.approveSectionRequest(...(args as any));

export const denySectionRequest = (...args: Parameters<typeof mock.denySectionRequest>) =>
  useMock ? mock.denySectionRequest(...args) : api.denySectionRequest(...(args as any));

export const listSections = (...args: Parameters<typeof mock.listSections>) =>
  useMock ? mock.listSections(...args) : api.listSections(...(args as any));

export const updateSection = (...args: Parameters<typeof mock.updateSection>) =>
  useMock ? mock.updateSection(...args) : api.updateSection(...(args as any));

export const listBulkLinks = (...args: Parameters<typeof mock.listBulkLinks>) =>
  useMock ? mock.listBulkLinks(...args) : api.listBulkLinks(...(args as any));

export const createBulkLink = (...args: Parameters<typeof mock.createBulkLink>) =>
  useMock ? mock.createBulkLink(...args) : api.createBulkLink(...(args as any));

export const sendBulkInvites = (...args: Parameters<typeof mock.sendBulkInvites>) =>
  useMock ? mock.sendBulkInvites(...args) : api.sendBulkInvites(...(args as any));

export const validateBulkToken = (...args: Parameters<typeof mock.validateBulkToken>) =>
  useMock ? mock.validateBulkToken(...args) : api.validateBulkToken(...(args as any));

export const registerViaBulk = (...args: Parameters<typeof mock.registerViaBulk>) =>
  useMock ? mock.registerViaBulk(...args) : api.registerViaBulk(...(args as any));

export const getDiplomaTemplate = (...args: Parameters<typeof mock.getDiplomaTemplate>) =>
  useMock ? mock.getDiplomaTemplate(...args) : api.getDiplomaTemplate(...(args as any));

export const saveDiplomaTemplate = (...args: Parameters<typeof mock.saveDiplomaTemplate>) =>
  useMock ? mock.saveDiplomaTemplate(...args) : api.saveDiplomaTemplate(...(args as any));

export const computeAttendanceSummary = (...args: Parameters<typeof mock.computeAttendanceSummary>) =>
  useMock ? mock.computeAttendanceSummary(...args) : api.computeAttendanceSummary(...(args as any));

export const generateDiplomas = (...args: Parameters<typeof mock.generateDiplomas>) =>
  useMock ? mock.generateDiplomas(...args) : api.generateDiplomas(...(args as any));

export const listDiplomasByEvent = (...args: Parameters<typeof mock.listDiplomasByEvent>) =>
  useMock ? mock.listDiplomasByEvent(...args) : api.listDiplomasByEvent(...(args as any));

export const sendDiplomas = (...args: Parameters<typeof mock.sendDiplomas>) =>
  useMock ? mock.sendDiplomas(...args) : api.sendDiplomas(...(args as any));

export const sendDiplomaRecord = (...args: Parameters<typeof mock.sendDiplomaRecord>) =>
  useMock ? mock.sendDiplomaRecord(...args) : api.sendDiplomaRecord(...(args as any));

export const listMyDiplomas = (...args: Parameters<typeof mock.listMyDiplomas>) =>
  useMock ? mock.listMyDiplomas(...args) : api.listMyDiplomas(...(args as any));

export const recordAttendanceScan = (...args: Parameters<typeof mock.recordAttendanceScan>) =>
  useMock ? mock.recordAttendanceScan(...args) : api.recordAttendanceScan(...(args as any));

export const searchAttendance = (...args: Parameters<typeof mock.searchAttendance>) =>
  useMock ? mock.searchAttendance(...args) : api.searchAttendance(...(args as any));

export const listAttendance = (...args: Parameters<typeof mock.listAttendance>) =>
  useMock ? mock.listAttendance(...args) : api.listAttendance(...(args as any));

export const listBulkTiers = (...args: Parameters<typeof mock.listBulkTiers>) =>
  useMock ? mock.listBulkTiers(...args) : api.listBulkTiers(...(args as any));

export const saveBulkTiers = (...args: Parameters<typeof mock.saveBulkTiers>) =>
  useMock ? mock.saveBulkTiers(...args) : api.saveBulkTiers(...(args as any));

export const createMembershipUpgradeRequest = (
  ...args: Parameters<typeof api.createMembershipUpgradeRequest>
) =>
  useMock
    ? (mock.createMembershipUpgradeRequest as any)(...args)
    : api.createMembershipUpgradeRequest(...(args as any));

export const listMembershipUpgradeRequests = (
  ...args: Parameters<typeof api.listMembershipUpgradeRequests>
) =>
  useMock
    ? (mock.listMembershipUpgradeRequests as any)(...args)
    : api.listMembershipUpgradeRequests(...(args as any));
