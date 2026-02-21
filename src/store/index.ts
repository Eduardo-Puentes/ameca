import { create } from "zustand";
import type { AuthSlice } from "./slices/authSlice";
import type { EventsSlice } from "./slices/eventsSlice";
import type { MembersSlice } from "./slices/membersSlice";
import type { RequestsSlice } from "./slices/requestsSlice";
import type { SectionsSlice } from "./slices/sectionsSlice";
import type { BulkSlice } from "./slices/bulkSlice";
import type { AttendanceSlice } from "./slices/attendanceSlice";
import type { DiplomasSlice } from "./slices/diplomasSlice";
import { createAuthSlice } from "./slices/authSlice";
import { createEventsSlice } from "./slices/eventsSlice";
import { createMembersSlice } from "./slices/membersSlice";
import { createRequestsSlice } from "./slices/requestsSlice";
import { createSectionsSlice } from "./slices/sectionsSlice";
import { createBulkSlice } from "./slices/bulkSlice";
import { createAttendanceSlice } from "./slices/attendanceSlice";
import { createDiplomasSlice } from "./slices/diplomasSlice";

export type AppState = AuthSlice &
  EventsSlice &
  MembersSlice &
  RequestsSlice &
  SectionsSlice &
  BulkSlice &
  AttendanceSlice &
  DiplomasSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createEventsSlice(...a),
  ...createMembersSlice(...a),
  ...createRequestsSlice(...a),
  ...createSectionsSlice(...a),
  ...createBulkSlice(...a),
  ...createAttendanceSlice(...a),
  ...createDiplomasSlice(...a),
}));
