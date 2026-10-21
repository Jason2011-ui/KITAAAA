import { useEffect, useRef, useState } from 'react'
import { config, letter, rooms, exhibits } from './data/museum'
import { useStore, input, interact } from './store'

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function Intro() {
  const enter = useStore(s => s.enter)
  return <div className="intro">
    <p className="kicker">{config.title}</p>
    <h1>{config.subtitle}</h1>
    <blockquote>{config.quote.map(l => <span key={l}>{l}<br /></span>)}</blockquote>
    <button className="btn" onClick={() => enter(false)} autoFocus>[ {config.enter} ]</button>
    <button className="link" onClick={() => enter(true)}>Skip intro</button>
    <p className="small">{config.caption}</p>
  </div>
}

export function HUD() {
  const { near, room, open, help, tour, setHelp, goTour } = useStore()
  const r = rooms.find(x => x.id === room)!; const e = exhibits.find(x => x.id === near)
  return <>
    <div className="brand"><b>{config.title}</b><span>{r.sub} — {r.title}</span></div>
    <div className="tools">
      <button className="link" onClick={() => goTour(tour === null ? 0 : null)}>{tour === null ? 'Guided tour' : 'End tour'}</button>
      <button className="link" onClick={() => setHelp(!help)} aria-expanded={help}>Controls</button>
    </div>
    {help && <div className="help" role="note"><p>Click the view to look around · WASD / arrows to move · E or click to examine · Esc to close</p><p>Touch: left stick moves, drag to look, tap “Examine”.</p></div>}
    {e && !open && <button className="prompt" onClick={interact}>{e.id === 'f2' ? e.title : 'Examine'} <small>{e.id === 'f2' ? 'Press E or tap' : e.title + ' — press E'}</small></button>}
    {tour !== null && !open && <div className="tour"><button className="link" onClick={() => goTour(tour - 1)}>← Previous</button><span>Stop {tour + 1} / {exhibits.length}</span><button className="link" onClick={() => goTour(tour + 1)}>Next →</button></div>}
  </>
}

export function Joystick() {
  const [k, setK] = useState<[number, number]>([0, 0]); const base = useRef<HTMLDivElement>(null)
  const move = (ev: React.PointerEvent) => { const b = base.current!.getBoundingClientRect(); let dx = ev.clientX - (b.left + b.width / 2), dy = ev.clientY - (b.top + b.height / 2)
    const m = Math.hypot(dx, dy), R = 45; if (m > R) { dx *= R / m; dy *= R / m } ; setK([dx, dy]); input.mx = dx / R; input.mz = -dy / R }
  const end = () => { setK([0, 0]); input.mx = input.mz = 0 }
  return <div className="stick" ref={base} aria-label="Movement joystick" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); move(e) }} onPointerMove={e => e.buttons && move(e)} onPointerUp={end} onPointerCancel={end}>
    <i style={{ transform: `translate(${k[0]}px,${k[1]}px)` }} /></div>
}

function Img({ src, alt }: { src?: string; alt: string }) {
  const [bad, setBad] = useState(!src); useEffect(() => setBad(!src), [src])
  return bad ? <div className="ph" role="img" aria-label={alt}>{alt}<small>placeholder image</small></div> : <img src={src} alt={alt} onError={() => setBad(true)} />
}

export function Viewer() {
  const id = useStore(s => s.open); const setOpen = useStore(s => s.setOpen)
  const e = exhibits.find(x => x.id === id)
  const mem = e?.category === 'memory' ? exhibits.filter(x => x.category === 'memory') : []; const i = e ? mem.indexOf(e) : -1
  useEffect(() => {
    if (!id) return
    const k = (ev: KeyboardEvent) => {
      if (ev.code === 'Escape') setOpen(null)
      else if (mem.length && ev.code === 'ArrowRight') setOpen(mem[(i + 1) % mem.length].id)
      else if (mem.length && ev.code === 'ArrowLeft') setOpen(mem[(i + mem.length - 1) % mem.length].id)
    }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [id, i])
  if (!e) return null
  if (e.kind === 'letter') return <Letter />
  return <div className="overlay" role="dialog" aria-modal="true" aria-label={e.title} onClick={ev => ev.target === ev.currentTarget && setOpen(null)}>
    <article className={'panel' + (e.kind === 'photo' ? ' photo' : '')}>
      {e.kind === 'photo' && <Img src={e.image} alt={e.title} />}
      <div className="txt">
        <h2>{e.title}</h2>{e.date && <time>{e.date}</time>}
        {e.caption && <p>{e.caption}</p>}{e.story && <p>{e.story}</p>}
        <div className="row">
          {mem.length > 0 && <><button className="link" onClick={() => setOpen(mem[(i + mem.length - 1) % mem.length].id)}>← Previous</button><button className="link" onClick={() => setOpen(mem[(i + 1) % mem.length].id)}>Next →</button></>}
          <button className="btn small" onClick={() => setOpen(null)} autoFocus>Close</button>
        </div>
      </div>
    </article></div>
}

export function Letter() {
  const setOpen = useStore(s => s.setOpen); const restart = useStore(s => s.restart)
  const L = letter.lines; const [n, setN] = useState(reduced() ? L.length : 0); const [paused, setPaused] = useState(false)
  useEffect(() => { if (paused || n >= L.length) return; const t = setTimeout(() => setN(n + 1), L[n] === '' ? 700 : 1600); return () => clearTimeout(t) }, [n, paused])
  useEffect(() => { const k = (ev: KeyboardEvent) => ev.code === 'Escape' && setOpen(null); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  const done = n >= L.length
  return <div className="overlay dim" role="dialog" aria-modal="true" aria-label={letter.title}>
    <article className="letter">
      <h2>{letter.title}</h2>
      {L.map((l, i) => l === '' ? <br key={i} /> : <p key={i} className={i < n ? 'on' : ''}>{l}</p>)}
      <div className={'closing' + (done ? ' on' : '')}><br />{letter.closing.map(l => <p key={l}>{l}</p>)}</div>
      <div className="row">
        {!done && <><button className="link" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button><button className="link" onClick={() => setN(L.length)}>Show all</button></>}
        {done && <button className="link" onClick={() => { restart() }}>Revisit the museum</button>}
        <button className="btn small" onClick={() => setOpen(null)} autoFocus>Close</button>
      </div>
    </article></div>
}
