import type { StateCreator } from "zustand";
import type { Event } from "@/lib/types";
import { createEvent, deleteEvent, listEvents, updateEvent } from "@/lib/mock/api";

export type EventsSlice = {
  events: Event[];
  selectedEventId: string | null;
  eventsLoading: boolean;
  loadEvents: () => Promise<void>;
  selectEvent: (id: string) => void;
  addEvent: (payload: Partial<Event>) => Promise<Event>;
  editEvent: (id: string, payload: Partial<Event>) => Promise<Event | null>;
  removeEvent: (id: string) => Promise<void>;
};

export const createEventsSlice: StateCreator<EventsSlice, [], [], EventsSlice> = (set, get) => ({
  events: [],
  selectedEventId: null,
  eventsLoading: false,
  loadEvents: async () => {
    set({ eventsLoading: true });
    const data = await listEvents();
    set({
      events: data,
      selectedEventId: data[0]?.id ?? null,
      eventsLoading: false,
    });
  },
  selectEvent: (id) => set({ selectedEventId: id }),
  addEvent: async (payload) => {
    const created = await createEvent(payload);
    set({ events: [created, ...get().events] });
    return created;
  },
  editEvent: async (id, payload) => {
    const updated = await updateEvent(id, payload);
    if (updated) {
      set({ events: get().events.map((item) => (item.id === id ? updated : item)) });
    }
    return updated;
  },
  removeEvent: async (id) => {
    await deleteEvent(id);
    set({ events: get().events.filter((item) => item.id !== id) });
  },
});
