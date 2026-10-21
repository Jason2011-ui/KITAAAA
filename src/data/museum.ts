// ALL PERSONAL CONTENT LIVES HERE. Everything marked [PLACEHOLDER] should be replaced.
// Put photos in public/images and reference them as '/images/name.jpg'. Missing images fall back to a generated placeholder.
export type Kind = 'photo' | 'object' | 'letter'
export type Side = 'N' | 'S' | 'E' | 'W' | 'C' // wall side of the room, or C = free-standing in the room
export interface Room { id: string; title: string; sub: string; c: [number, number]; wall: string; light: string; open?: boolean }
export interface Exhibit {
  id: string; room: string; category: 'start' | 'little' | 'memory' | 'words' | 'final'; kind: Kind
  title: string; side: Side; off: number; dz?: number; w?: number; h?: number
  image?: string; caption: string; date?: string; story?: string
}
export const config = {
  recipient: '[Her name]', creator: '[Your name]', title: 'THE MUSEUM OF YOU',
  subtitle: 'A little world, created for someone extraordinary.',
  quote: ['Some people leave a mark on your life.', 'You became a part of mine.'],
  caption: 'A personal collection of moments, feelings, and everything I love about you.', enter: 'ENTER THE MUSEUM',
}
export const letter = {
  title: 'If There Is One Thing I Want You to Know',
  lines: [ // [PLACEHOLDER] replace with your own letter. '' = blank line.
    '[PLACEHOLDER — write your own letter here.]', '',
    'Replace each line of this array with your words.', 'Keep lines short: they appear one at a time.', '',
    'Of all the places I could build,', 'this is the one I wanted to make for you.',
  ],
  closing: ['Not because a museum could ever contain everything you are,', 'but because I wanted to create a little place', 'where you could see what you mean to me.'],
}
// Rooms form a chain along -Z, 12x12 each, 2-unit corridors between. HALF in pose() must match.
export const rooms: Room[] = [
  { id: 'hall', title: 'Entrance Hall', sub: 'Welcome', c: [0, 0], wall: '#e8e0d0', light: '#ffd9a0' },
  { id: 'begin', title: 'Where It All Began', sub: 'Room One', c: [0, -14], wall: '#e8dccb', light: '#ffc980' },
  { id: 'little', title: 'The Little Things I Notice', sub: 'Room Two', c: [0, -28], wall: '#e6dfd2', light: '#ffd9a0' },
  { id: 'memories', title: 'Moments I Would Keep Forever', sub: 'Room Three', c: [0, -42], wall: '#ece6da', light: '#fff0d0' },
  { id: 'words', title: "Words I Couldn't Always Find", sub: 'Room Four', c: [0, -56], wall: '#4a1b26', light: '#ff9a6a' },
  { id: 'final', title: 'If There Is One Thing I Want You to Know', sub: 'The Private Gallery', c: [0, -70], wall: '#2a2326', light: '#ffcf8a', open: true },
]
const P = '[PLACEHOLDER] Replace with your own words.'
export const exhibits: Exhibit[] = [
  { id: 'b1', room: 'begin', category: 'start', kind: 'photo', title: 'The Person This Is About', side: 'N', off: 3.5, w: 1.3, h: 1.7, caption: P, story: 'A short introduction to her. ' + P },
  { id: 'b2', room: 'begin', category: 'start', kind: 'photo', title: 'First Photograph', side: 'W', off: -1.5, w: 1.6, h: 1.1, date: '[Date]', caption: P },
  { id: 'b3', room: 'begin', category: 'start', kind: 'object', title: 'The Date That Matters', side: 'C', off: 2, caption: 'A plaque for the date or event that matters to you both.', date: '[Date]' },
  { id: 'l1', room: 'little', category: 'little', kind: 'photo', title: 'Your Smile', side: 'E', off: -2, w: 1.1, h: 1.4, caption: P },
  { id: 'l2', room: 'little', category: 'little', kind: 'object', title: 'A Favourite Thing', side: 'C', off: -2, caption: P },
  { id: 'l3', room: 'little', category: 'little', kind: 'photo', title: 'A Habit I Love', side: 'W', off: 2, w: 1.4, h: 1.0, caption: P },
  { id: 'l4', room: 'little', category: 'little', kind: 'photo', title: 'A Place With a Memory', side: 'N', off: -3.5, w: 1.6, h: 1.1, caption: P },
  { id: 'm1', room: 'memories', category: 'memory', kind: 'photo', title: 'Memory One', side: 'W', off: -2.5, w: 1.8, h: 1.2, date: '[Date]', caption: P },
  { id: 'm2', room: 'memories', category: 'memory', kind: 'photo', title: 'Memory Two', side: 'W', off: 2.2, w: 1.0, h: 1.4, date: '[Date]', caption: P },
  { id: 'm3', room: 'memories', category: 'memory', kind: 'photo', title: 'Memory Three', side: 'E', off: -2, w: 1.2, h: 1.6, date: '[Date]', caption: P },
  { id: 'm4', room: 'memories', category: 'memory', kind: 'photo', title: 'Memory Four', side: 'E', off: 2.4, w: 1.7, h: 1.1, date: '[Date]', caption: P },
  { id: 'm5', room: 'memories', category: 'memory', kind: 'photo', title: 'Memory Five', side: 'N', off: 3.6, w: 1.4, h: 1.4, date: '[Date]', caption: P },
  { id: 'w1', room: 'words', category: 'words', kind: 'object', title: 'Something I Admire About You', side: 'C', off: -2.4, dz: 1.6, caption: P },
  { id: 'w2', room: 'words', category: 'words', kind: 'object', title: 'Something I Hope You Always Remember', side: 'C', off: 2.4, dz: 1.6, caption: P },
  { id: 'w3', room: 'words', category: 'words', kind: 'object', title: 'Something You Changed in My Life', side: 'C', off: -2.4, dz: -1.8, caption: P },
  { id: 'w4', room: 'words', category: 'words', kind: 'object', title: 'Something I Am Grateful For', side: 'C', off: 2.4, dz: -1.8, caption: P },
  { id: 'f1', room: 'final', category: 'final', kind: 'photo', title: 'The One That Means Everything', side: 'W', off: 0, w: 1.3, h: 1.7, caption: P },
  { id: 'f2', room: 'final', category: 'final', kind: 'letter', title: 'There is one last thing I made for you.', side: 'C', off: 0, dz: 0, caption: 'A letter, just for you.' },
]
export const HALF = 6
export function pose(e: Exhibit) {
  const r = rooms.find(r => r.id === e.room)!; const [cx, cz] = r.c; const w = 0.04
  const o = e.side === 'N' ? { x: cx + e.off, z: cz - HALF + w, rot: 0 }
    : e.side === 'S' ? { x: cx + e.off, z: cz + HALF - w, rot: Math.PI }
    : e.side === 'W' ? { x: cx - HALF + w, z: cz + e.off, rot: Math.PI / 2 }
    : e.side === 'E' ? { x: cx + HALF - w, z: cz + e.off, rot: -Math.PI / 2 }
    : { x: cx + e.off, z: cz + (e.dz ?? 0), rot: 0 }
  return { ...o, nx: Math.sin(o.rot), nz: Math.cos(o.rot) } // (nx,nz) = outward normal; a viewer standing in front faces it with yaw = rot
}
