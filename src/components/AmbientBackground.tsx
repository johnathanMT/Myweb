/**
 * AmbientBackground — deep navy field.
 * Silver stays on buttons. Navy is the atmosphere and the CS / AI marks.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0B1C38 0%, #081428 28%, #06101E 62%, #040814 100%)',
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgb(90 140 196 / 0.7), transparent)' }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(70% 55% at 15% 0%, rgb(16 48 102 / 0.72), transparent 72%)',
            'radial-gradient(55% 48% at 100% 85%, rgb(12 40 88 / 0.55), transparent 74%)',
            'radial-gradient(40% 32% at 50% 40%, rgb(20 56 112 / 0.28), transparent 70%)',
          ].join(', '),
        }}
      />

      <AiWatermarks />
    </div>
  )
}

/** CS neural net, quantum orbit, and code brackets, painted deep navy. */
function AiWatermarks() {
  const ink = 'rgba(74, 128, 196, 0.72)'
  return (
    <div className="absolute inset-0">
      <svg className="absolute -left-8 top-[10%] h-52 w-52 sm:h-64 sm:w-64" viewBox="0 0 220 220" fill="none" aria-hidden>
        <g stroke={ink} strokeWidth="1">
          <line x1="24" y1="40" x2="110" y2="28" /><line x1="24" y1="40" x2="110" y2="78" /><line x1="24" y1="40" x2="110" y2="128" />
          <line x1="24" y1="110" x2="110" y2="78" /><line x1="24" y1="110" x2="110" y2="128" /><line x1="24" y1="110" x2="110" y2="178" />
          <line x1="24" y1="180" x2="110" y2="128" /><line x1="24" y1="180" x2="110" y2="178" />
          <line x1="110" y1="28" x2="196" y2="70" /><line x1="110" y1="78" x2="196" y2="70" /><line x1="110" y1="78" x2="196" y2="150" />
          <line x1="110" y1="128" x2="196" y2="70" /><line x1="110" y1="128" x2="196" y2="150" /><line x1="110" y1="178" x2="196" y2="150" />
        </g>
        {[[24, 40], [24, 110], [24, 180], [110, 28], [110, 78], [110, 128], [110, 178], [196, 70], [196, 150]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={ink} />
        ))}
      </svg>

      <svg className="absolute bottom-[18%] right-[6%] hidden h-36 w-36 sm:block" viewBox="0 0 160 160" fill="none" aria-hidden>
        <circle cx="80" cy="80" r="58" stroke={ink} strokeWidth="0.8" />
        <ellipse cx="80" cy="80" rx="58" ry="22" stroke={ink} strokeWidth="0.7" />
        <ellipse cx="80" cy="80" rx="22" ry="58" stroke={ink} strokeWidth="0.7" />
      </svg>

      <svg className="absolute bottom-[28%] left-[8%] h-24 w-24" viewBox="0 0 80 80" fill="none" aria-hidden>
        <path d="M18 14 L8 40 L18 66" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M62 14 L72 40 L62 66" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M46 12 L34 68" stroke={ink} strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}
