import { useEffect, useState } from 'react'

// Ring size constants — single source of truth
const R = 110
const SIZE = R * 2
const CX = R
const CY = R

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const hold = setTimeout(() => setPhase('exit'), 2400)
    const done = setTimeout(() => onDone(), 3200)
    return () => { clearTimeout(hold); clearTimeout(done) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#080E1C', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'exit' ? 0 : 1,
      transition: phase === 'exit' ? 'opacity 0.8s ease' : 'none',
    }}>
      {/* BG orb 1 */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        top: 0, right: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,200,255,0.18) 0%, transparent 70%)',
        transform: 'translate(30%,-30%)',
      }} />
      {/* BG orb 2 */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        bottom: 0, left: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,98,255,0.14) 0%, transparent 70%)',
        transform: 'translate(-20%,30%)',
      }} />

      {/* Center column */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* Ring + logo box — exact pixel dimensions */}
        <div style={{ position: 'relative', width: SIZE, height: SIZE, marginBottom: 20, flexShrink: 0 }}>

          {/* Static base ring */}
          <svg width={SIZE} height={SIZE} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <circle cx={CX} cy={CY} r={R - 1} fill="none" stroke="rgba(0,200,255,0.18)" strokeWidth="1" />
          </svg>

          {/* Outer dim ring — 28px bigger on each side */}
          <svg
            width={SIZE + 56} height={SIZE + 56}
            style={{ position: 'absolute', top: -28, left: -28, pointerEvents: 'none' }}
          >
            <circle cx={R + 28} cy={R + 28} r={R + 27} fill="none" stroke="rgba(0,200,255,0.06)" strokeWidth="1" />
          </svg>

          {/* Logo — absolutely centered inside the box */}
          <img
            src="/newlogo.png"
            alt="ASLEN"
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 120, height: 120, objectFit: 'contain',
              filter: 'drop-shadow(0 0 16px rgba(0,200,255,0.6))',
              animation: 'splash-logo-pulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* ASLEN */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
          {'ASLEN'.split('').map((ch, i) => (
            <span key={i} className="splash-letter" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>{ch}</span>
          ))}
        </div>

        {/* TECH SOLUTIONS */}
        <div style={{ display: 'flex', gap: 1, marginBottom: 24, whiteSpace: 'nowrap' }}>
          {'TECH SOLUTIONS'.split('').map((ch, i) => (
            <span key={i} className="splash-subletter" style={{ animationDelay: `${0.9 + i * 0.04}s` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ width: 200, height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg,#00C8FF,#0062FF)',
            animation: 'splash-bar 1.8s cubic-bezier(0.4,0,0.2,1) forwards',
            animationDelay: '0.3s', width: '0%',
          }} />
        </div>

      </div>
    </div>
  )
}
