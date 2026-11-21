export type RoomBooking = {
  readonly start: number;
  readonly end: number;
};

export type Room = {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly string[];
  readonly blocked: boolean;
  readonly bookings: readonly RoomBooking[];
};

const rooms: readonly Room[] = Object.freeze([
  Object.freeze({
    id: 'A101',
    name: 'Seminar Room A101',
    capacity: 20,
    equipment: Object.freeze(['projector', 'whiteboard']),
    blocked: false,
    bookings: Object.freeze([
      Object.freeze({ start: 600, end: 660 }),
    ]),
  }),
  Object.freeze({
    id: 'A102',
    name: 'Computer Lab A102',
    capacity: 30,
    equipment: Object.freeze(['projector', 'computers', 'whiteboard']),
    blocked: false,
    bookings: Object.freeze([
      Object.freeze({ start: 720, end: 780 }),
      Object.freeze({ start: 900, end: 960 }),
    ]),
  }),
  Object.freeze({
    id: 'B201',
    name: 'Meeting Room B201',
    capacity: 6,
    equipment: Object.freeze(['whiteboard', 'display']),
    blocked: false,
    bookings: Object.freeze([
      Object.freeze({ start: 630, end: 690 }),
    ]),
  }),
  Object.freeze({
    id: 'B202',
    name: 'Lecture Hall B202',
    capacity: 80,
    equipment: Object.freeze(['projector', 'microphone', 'whiteboard']),
    blocked: true,
    bookings: Object.freeze([]),
  }),
  Object.freeze({
    id: 'C301',
    name: 'Video Studio C301',
    capacity: 10,
    equipment: Object.freeze(['camera', 'microphone', 'display']),
    blocked: false,
    bookings: Object.freeze([
      Object.freeze({ start: 660, end: 780 }),
    ]),
  }),
]);

export const ROOMS: readonly Room[] = rooms;
