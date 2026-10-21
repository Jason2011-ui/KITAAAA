import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { rooms, exhibits, pose, HALF, type Exhibit } from './data/museum'
import { useStore, input, interact } from './store'

const H = 4.5, T = 0.3, G = 1.5 // wall height, thickness, half door width
const brass = new THREE.MeshStandardMaterial({ color: '#7a6030', metalness: 0.8, roughness: 0.35 })
const brassHi = new THREE.MeshStandardMaterial({ color: '#d4ae56', metalness: 0.8, roughness: 0.3, emissive: '#6b4a10' })
const stone = new THREE.MeshStandardMaterial({ color: '#d8d0c2', roughness: 0.7 })
const floorM = new THREE.MeshStandardMaterial({ color: '#25201f', roughness: 0.28, metalness: 0.15 })
const ceilM = new THREE.MeshStandardMaterial({ color: '#d9d2c6', roughness: 1 })

// Walkable area = union of room interiors and corridors (margin keeps the camera off the walls).
const M = 0.5
const rects: number[][] = rooms.map(r => [r.c[0] - HALF + M, r.c[1] - HALF + M, r.c[0] + HALF - M, r.c[1] + HALF - M])
for (let i = 0; i < rooms.length - 1; i++) rects.push([-G + M, rooms[i + 1].c[1] + HALF - 0.3, G - M, rooms[i].c[1] - HALF + 0.3])
const inside = (x: number, z: number) => rects.some(r => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3])

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')!)
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
}
function useTex(url: string | undefined, title: string, w: number, h: number) {
  const [t, setT] = useState<THREE.Texture>()
  useEffect(() => {
    let dead = false; let tx: THREE.Texture | undefined
    const fb = () => {
      let hue = 0; for (const ch of title) hue = (hue * 31 + ch.charCodeAt(0)) % 40
      tx = canvasTex(400, Math.round(400 * h / w), c => {
        const g = c.createLinearGradient(0, 0, 400, 400 * h / w); g.addColorStop(0, `hsl(${hue + 10},25%,32%)`); g.addColorStop(1, '#1b1416')
        c.fillStyle = g; c.fillRect(0, 0, 400, 400 * h / w); c.fillStyle = '#e8d9b5'; c.textAlign = 'center'; c.font = '26px Georgia,serif'
        c.fillText(title.slice(0, 26), 200, 200 * h / w); c.font = '15px sans-serif'; c.fillStyle = '#b9a98a'; c.fillText('placeholder photograph', 200, 200 * h / w + 28)
      }); if (!dead) setT(tx)
    }
    if (!url) fb(); else new THREE.TextureLoader().load(url, x => { tx = x; x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 4; if (!dead) setT(x) }, undefined, fb)
    return () => { dead = true; tx?.dispose() }
  }, [url, title, w, h])
  return t
}
function Plaque({ text, pos, w, h, dark }: { text: string; pos: [number, number, number]; w: number; h: number; dark?: boolean }) {
  const t = useMemo(() => canvasTex(1024, Math.round(1024 * h / w), c => {
    const hh = 1024 * h / w; c.fillStyle = dark ? '#161012' : '#efe7d8'; c.fillRect(0, 0, 1024, hh)
    c.fillStyle = dark ? '#e8d9b5' : '#2a2022'; c.font = `${Math.round(hh * 0.4)}px Georgia,serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 512, hh / 2, 980)
  }), [text, w, h, dark])
  useEffect(() => () => t.dispose(), [t])
  return <mesh position={pos}><planeGeometry args={[w, h]} /><meshBasicMaterial map={t} toneMapped={false} /></mesh>
}
const Box = ({ p, s, m }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material }) => <mesh position={p} material={m}><boxGeometry args={s} /></mesh>

function ZWall({ z, cx, door, m }: { z: number; cx: number; door: boolean; m: THREE.Material }) {
  if (!door) return <Box p={[cx, H / 2, z]} s={[2 * HALF + T, H, T]} m={m} />
  const w = HALF - G
  return <>
    <Box p={[cx - G - w / 2, H / 2, z]} s={[w, H, T]} m={m} /><Box p={[cx + G + w / 2, H / 2, z]} s={[w, H, T]} m={m} />
    <Box p={[cx, 3.75 + (H - 3.75) / 2, z]} s={[2 * G, H - 3.75, T]} m={m} />
  </>
}
function RoomShell({ i }: { i: number }) {
  const r = rooms[i]; const [cx, cz] = r.c
  const wm = useMemo(() => new THREE.MeshStandardMaterial({ color: r.wall, roughness: 0.92 }), [r.wall])
  useEffect(() => () => wm.dispose(), [wm])
  const last = i === rooms.length - 1
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cz]} material={floorM}><planeGeometry args={[2 * HALF, 2 * HALF]} /></mesh>
    {!r.open && <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H, cz]} material={ceilM}><planeGeometry args={[2 * HALF, 2 * HALF]} /></mesh>}
    <ZWall z={cz - HALF} cx={cx} door={!last} m={wm} /><ZWall z={cz + HALF} cx={cx} door={i > 0} m={wm} />
    <Box p={[cx - HALF, H / 2, cz]} s={[T, H, 2 * HALF]} m={wm} /><Box p={[cx + HALF, H / 2, cz]} s={[T, H, 2 * HALF]} m={wm} />
    <pointLight position={[cx, 3.8, cz]} color={r.light} intensity={i === 4 ? 14 : 30} distance={15} decay={2} />
    <Plaque text={r.title} pos={[cx - 4, 3.3, cz - HALF + 0.17]} w={3.6} h={0.5} dark />
    {!last && <group position={[cx, 0, cz - HALF - 1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floorM}><planeGeometry args={[2 * G, 2.2]} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.75, 0]} material={ceilM}><planeGeometry args={[2 * G, 2.2]} /></mesh>
      <Box p={[-G, 1.9, 0]} s={[0.1, 3.8, 2.2]} m={wm} /><Box p={[G, 1.9, 0]} s={[0.1, 3.8, 2.2]} m={wm} />
    </group>}
  </group>
}
function Photo({ e }: { e: Exhibit }) {
  const p = pose(e); const w = e.w ?? 1.2, h = e.h ?? 1.6
  const near = useStore(s => s.near === e.id); const tex = useTex(e.image, e.title, w, h)
  return <group position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
    <mesh position={[0, 1.75, 0.03]} material={near ? brassHi : brass}><boxGeometry args={[w + 0.14, h + 0.14, 0.06]} /></mesh>
    <mesh position={[0, 1.75, 0.065]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={near ? 0.35 : 0.14} /></mesh>
    <Plaque text={e.title.slice(0, 34)} pos={[0, 1.75 - h / 2 - 0.3, 0.02]} w={0.9} h={0.14} />
  </group>
}
function Pedestal({ e }: { e: Exhibit }) {
  const p = pose(e); const near = useStore(s => s.near === e.id)
  return <group position={[p.x, 0, p.z]}>
    <mesh position={[0, 0.5, 0]} material={stone}><boxGeometry args={[0.7, 1, 0.7]} /></mesh>
    {e.kind === 'letter'
      ? <mesh position={[0, 1.03, 0]} rotation={[0, 0.3, 0]}><boxGeometry args={[0.5, 0.04, 0.36]} /><meshStandardMaterial color="#f4ecdc" emissive="#f4ecdc" emissiveIntensity={near ? 0.7 : 0.35} /></mesh>
      : <mesh position={[0, 1.25, 0]} material={near ? brassHi : brass}><icosahedronGeometry args={[0.18, 1]} /></mesh>}
  </group>
}
function NearLight() {
  const id = useStore(s => s.near); const e = exhibits.find(x => x.id === id)
  const p = e ? pose(e) : null
  return <pointLight position={p ? [p.x + p.nx * 1.4, 2.6, p.z + p.nz * 1.4] : [0, -20, 0]} color="#ffe2b0" intensity={p ? 8 : 0} distance={6} decay={2} />
}

function Rig() {
  const { camera, gl } = useThree()
  const st = useRef({ x: 0, z: 5.3, y: 2.6, yaw: 0, pitch: 0, vx: 0, vz: 0, t: 0 })
  const keys = useRef(new Set<string>())
  useEffect(() => {
    const el = gl.domElement; const s = st.current
    const fine = () => matchMedia('(pointer:fine)').matches
    const kd = (ev: KeyboardEvent) => { if (useStore.getState().open) return; if (ev.code === 'KeyE' || ev.code === 'Enter') interact(); keys.current.add(ev.code) }
    const ku = (ev: KeyboardEvent) => { keys.current.delete(ev.code) }
    const blur = () => keys.current.clear()
    const mm = (ev: MouseEvent) => { if (document.pointerLockElement === el && !useStore.getState().open) { s.yaw -= ev.movementX * 0.0022; s.pitch = Math.max(-1.1, Math.min(1.1, s.pitch - ev.movementY * 0.0022)) } }
    const click = () => { if (useStore.getState().open) return; if (document.pointerLockElement === el) interact(); else if (fine()) el.requestPointerLock?.() }
    const last = new Map<number, [number, number]>()
    const pd = (ev: PointerEvent) => { if (ev.pointerType === 'touch') last.set(ev.pointerId, [ev.clientX, ev.clientY]) }
    const pm = (ev: PointerEvent) => { const l = last.get(ev.pointerId); if (!l || useStore.getState().open) return
      s.yaw -= (ev.clientX - l[0]) * 0.005; s.pitch = Math.max(-1.1, Math.min(1.1, s.pitch - (ev.clientY - l[1]) * 0.005)); last.set(ev.pointerId, [ev.clientX, ev.clientY]) }
    const pu = (ev: PointerEvent) => { last.delete(ev.pointerId) }
    addEventListener('keydown', kd); addEventListener('keyup', ku); addEventListener('blur', blur); document.addEventListener('mousemove', mm)
    el.addEventListener('click', click); el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu); el.addEventListener('pointercancel', pu)
    const unsub = useStore.subscribe(S => { if (S.open && document.pointerLockElement) document.exitPointerLock() })
    return () => { removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('blur', blur); document.removeEventListener('mousemove', mm)
      el.removeEventListener('click', click); el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu); el.removeEventListener('pointercancel', pu); unsub() }
  }, [gl])
  useFrame((_, dtRaw) => {
    const s = st.current, S = useStore.getState(), dt = Math.min(dtRaw, 0.05)
    if (S.tp) { s.x = S.tp.x; s.z = S.tp.z; s.yaw = S.tp.yaw; s.pitch = 0; s.vx = s.vz = 0; s.y = 1.65; S.clearTp() }
    if (S.phase === 'museum') {
      if (S.dolly) {
        s.t += dt; const k = Math.min(1, s.t / 3.2), e = 1 - Math.pow(1 - k, 3)
        s.z = 5.3 - e * 1.7; s.y = 2.6 - e * 0.95; s.pitch = 0.18 * (1 - e)
        if (k >= 1) S.endDolly()
      } else if (!S.open && !S.fade) {
        const K = keys.current; const has = (...c: string[]) => c.some(x => K.has(x))
        s.yaw += ((has('ArrowLeft') ? 1 : 0) - (has('ArrowRight') ? 1 : 0)) * 1.8 * dt
        let mx = (has('KeyD') ? 1 : 0) - (has('KeyA') ? 1 : 0) + input.mx
        let mz = (has('KeyW', 'ArrowUp') ? 1 : 0) - (has('KeyS', 'ArrowDown') ? 1 : 0) + input.mz
        const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m }
        const sn = Math.sin(s.yaw), cs = Math.cos(s.yaw)
        const tx = (-sn * mz + cs * mx) * 3.2, tz = (-cs * mz - sn * mx) * 3.2, a = Math.min(1, dt * 8)
        s.vx += (tx - s.vx) * a; s.vz += (tz - s.vz) * a
        const nx = s.x + s.vx * dt; if (inside(nx, s.z)) s.x = nx; else s.vx = 0
        const nz = s.z + s.vz * dt; if (inside(s.x, nz)) s.z = nz; else s.vz = 0
        s.y = 1.65
      }
      // nearest examinable exhibit in front of the visitor
      const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw); let best: string | null = null, bd = 9
      for (const e of exhibits) {
        const p = pose(e); const dx = p.x - s.x, dz = p.z - s.z, d = Math.hypot(dx, dz), obj = e.kind !== 'photo'
        if (d > (obj ? 2.4 : 3.8) || d >= bd) continue
        if ((fx * dx + fz * dz) / (d || 1) < (obj ? 0.3 : 0.55)) continue
        if (!obj && (s.x - p.x) * p.nx + (s.z - p.z) * p.nz <= 0) continue
        best = e.id; bd = d
      }
      if (best !== S.near && !S.open) S.setNear(best)
      const r = rooms.find(r => Math.abs(s.x - r.c[0]) < HALF && Math.abs(s.z - r.c[1]) < HALF)
      if (r && r.id !== S.room) S.setRoom(r.id)
    }
    camera.position.set(s.x, s.y, s.z); camera.rotation.set(s.pitch, s.yaw, 0, 'YXZ')
  })
  return null
}

export default function MuseumCanvas() {
  const coarse = useMemo(() => matchMedia('(pointer:coarse)').matches, [])
  return <Canvas dpr={coarse ? [1, 1.5] : [1, 2]} camera={{ fov: 70, near: 0.1, far: 90, position: [0, 2.6, 5.3] }} gl={{ antialias: !coarse, powerPreference: 'high-performance' }} style={{ touchAction: 'none' }} aria-label="3D museum">
    <color attach="background" args={['#070506']} /><fog attach="fog" args={['#0a0708', 9, 28]} />
    <ambientLight intensity={0.35} color="#ffeedd" />
    {rooms.map((_, i) => <RoomShell key={i} i={i} />)}
    {exhibits.map(e => e.kind === 'photo' ? <Photo key={e.id} e={e} /> : <Pedestal key={e.id} e={e} />)}
    <NearLight /><Stars radius={60} depth={30} count={1500} factor={3} fade />
    <Rig />
  </Canvas>
}
