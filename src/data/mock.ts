export type CharacterId = 'robot' | 'alien' | 'frog' | 'ghost' | 'cat' | 'rooster';

export type Character = {
  id: CharacterId;
  name: string;
  emoji: string;
  color: string;
  line: string;
};

export const CHARACTERS: Character[] = [
  { id: 'robot', name: 'Robot', emoji: '🤖', color: '#8FD0FF', line: 'Beep boop. Morning protocol complete.' },
  { id: 'alien', name: 'Alien', emoji: '👽', color: '#C8F53C', line: 'Take me to your coffee.' },
  { id: 'frog', name: 'Frog', emoji: '🐸', color: '#6FDB9B', line: 'Ribbit. You leapt out of bed!' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', color: '#DCD8FF', line: "Boo! Didn't think you'd find me." },
  { id: 'cat', name: 'Cat', emoji: '🐱', color: '#FFC86B', line: 'I was here first. Obviously.' },
  { id: 'rooster', name: 'Rooster', emoji: '🐓', color: '#FF9670', line: "Cock-a-doodle-you're-up!" },
];

export type RoomId = 'bedroom' | 'hall' | 'living' | 'kitchen' | 'bathroom';

export type Room = {
  id: RoomId;
  name: string;
  // Floor-plan coordinates (viewBox 0 0 350 290)
  rect: { x: number; y: number; w: number; h: number };
  spots: string[];
};

export const ROOMS: Room[] = [
  {
    id: 'bedroom',
    name: 'Bedroom',
    rect: { x: 10, y: 20, w: 110, h: 96 },
    spots: ['under the bed', 'behind the curtains', 'on top of the wardrobe'],
  },
  {
    id: 'hall',
    name: 'Hall',
    rect: { x: 130, y: 44, w: 84, h: 48 },
    spots: ['next to the shoe rack', 'behind the front door'],
  },
  {
    id: 'living',
    name: 'Living Room',
    rect: { x: 224, y: 20, w: 116, h: 96 },
    spots: ['behind the sofa', 'under the coffee table', 'next to the TV'],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    rect: { x: 124, y: 126, w: 96, h: 78 },
    spots: ['behind the kettle', 'on top of the fridge', 'inside the fruit bowl'],
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    rect: { x: 136, y: 214, w: 72, h: 62 },
    spots: ['in the bathtub', 'behind the door', 'next to the mirror'],
  },
];

// Doorways between rooms (floor-plan coordinates)
export const DOORS: [number, number, number, number][] = [
  [120, 68, 130, 68], // Bedroom — Hall
  [214, 68, 224, 68], // Hall — Living Room
  [172, 92, 172, 126], // Hall — Kitchen
  [172, 204, 172, 214], // Kitchen — Bathroom
];

export type Hunt = {
  character: Character;
  room: Room;
  spot: string;
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// The alarm always starts in the bedroom, so never hide the character there.
export function rollHunt(previous?: Hunt | null): Hunt {
  let character = pick(CHARACTERS);
  if (previous && CHARACTERS.length > 1) {
    while (character.id === previous.character.id) character = pick(CHARACTERS);
  }
  const room = pick(ROOMS.filter((r) => r.id !== 'bedroom'));
  return { character, room, spot: pick(room.spots) };
}

export type Place = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
};

export const PLACES: Place[] = [
  { id: 'mysore-palace', name: 'Mysore Palace', area: 'Mysuru, Karnataka', lat: 12.3052, lng: 76.6551 },
  { id: 'mysuru-jn', name: 'Mysuru Junction', area: 'Railway station · Mysuru', lat: 12.3164, lng: 76.6457 },
  { id: 'chamundi', name: 'Chamundi Hills', area: 'Mysuru, Karnataka', lat: 12.2724, lng: 76.6702 },
  { id: 'blr-palace', name: 'Bangalore Palace', area: 'Vasanth Nagar, Bengaluru', lat: 12.9987, lng: 77.592 },
  { id: 'majestic', name: 'Majestic Bus Stand', area: 'Gandhi Nagar, Bengaluru', lat: 12.9767, lng: 77.5713 },
];

export const RADII = [
  { label: '100m', meters: 100 },
  { label: '300m', meters: 300 },
  { label: '500m', meters: 500 },
  { label: '1km', meters: 1000 },
];

export const formatTime = (hour: number, minute: number) => {
  const total = (((hour * 60 + minute) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hh}:${String(m).padStart(2, '0')}`, period: h < 12 ? 'AM' : 'PM' };
};

export const formatTimePadded = (h: number, m: number) => {
  const { time, period } = formatTime(h, m);
  return `${time.padStart(5, '0')} ${period}`;
};
