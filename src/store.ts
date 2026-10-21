import { create } from 'zustand'
import { exhibits, pose } from './data/museum'
export const input = { mx: 0, mz: 0 } // virtual joystick, written by UI, read by the render loop
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
interface Tp { x: number; z: number; yaw: number }
interface S {
  phase: 'intro' | 'museum'; dolly: boolean; curtain: boolean; open: string | null; near: string | null; room: string
  fade: boolean; tour: number | null; help: boolean; tp: Tp | null
  enter: (skip: boolean) => void; setOpen: (id: string | null) => void; setNear: (id: string | null) => void; setRoom: (r: string) => void
  setHelp: (b: boolean) => void; endDolly: () => void; clearTp: () => void; goTour: (i: number | null) => void; restart: () => void
}
export const useStore = create<S>((set, get) => ({
  phase: 'intro', dolly: false, curtain: false, open: null, near: null, room: 'hall', fade: false, tour: null, help: false, tp: null,
  enter: skip => { const s = skip || reduced(); set({ phase: 'museum', dolly: !s, curtain: !s, help: true, tp: s ? { x: 0, z: 3.6, yaw: 0 } : null }); setTimeout(() => set({ help: false }), 9000) },
  setOpen: id => set({ open: id }), setNear: id => set({ near: id }), setRoom: r => set({ room: r }), setHelp: b => set({ help: b }),
  endDolly: () => set({ dolly: false }), clearTp: () => set({ tp: null }),
  goTour: i => {
    if (i === null) return set({ tour: null })
    const n = exhibits.length; const k = ((i % n) + n) % n
    set({ fade: true })
    setTimeout(() => { const p = pose(exhibits[k]); set({ tp: { x: p.x + p.nx * 2.4, z: p.z + p.nz * 2.4, yaw: p.rot }, tour: k, open: null }) }, 350)
    setTimeout(() => set({ fade: false }), 700)
  },
  restart: () => { set({ fade: true, open: null, tour: null }); setTimeout(() => set({ tp: { x: 0, z: 3.6, yaw: 0 }, room: 'hall' }), 350); setTimeout(() => set({ fade: false }), 700) },
}))
export const interact = () => { const { near, setOpen } = useStore.getState(); if (near) setOpen(near) }
