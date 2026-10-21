import { lazy, Suspense, useMemo } from 'react'
import { useStore } from './store'
import { Intro, HUD, Joystick, Viewer } from './UI'
const MuseumCanvas = lazy(() => import('./Museum'))

export function App() {
  const { phase, curtain, fade, open, setOpen } = useStore()
  const webgl = useMemo(() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }, [])
  const touch = useMemo(() => matchMedia('(pointer:coarse)').matches, [])
  if (!webgl) return <div className="intro"><h1>This browser can’t display the 3D museum.</h1><p className="small">WebGL isn’t available. You can still read the letter.</p><button className="btn" onClick={() => setOpen('f2')}>Read the letter</button><Viewer /></div>
  return <>
    <Suspense fallback={<div className="intro"><p className="small" role="status">Preparing the museum…</p></div>}><MuseumCanvas /></Suspense>
    {phase === 'museum' && <><HUD />{touch && !open && <Joystick />}</>}
    {curtain && <div className="curtain" />}
    <div className={'veil' + (fade ? ' on' : '')} />
    {phase === 'intro' && <Intro />}
    <Viewer />
  </>
}
