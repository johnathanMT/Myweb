import { useEffect, useRef, useState } from 'react'
import { PERSONAL } from '../data/content'

export default function Philosophy() {
  const sectionRef = useRef(null)
  const [typed, setTyped]   = useState('')
  const [done,  setDone]    = useState(false)
  const fullText = `print("${PERSONAL.quote}")`

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          let i = 0
          const interval = setInterval(() => {
            setTyped(fullText.slice(0, i + 1))
            i++
            if (i >= fullText.length) {
              clearInterval(interval)
              setDone(true)
            }
          }, 28)
        }
      },
      { threshold: 0.4 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [fullText])

  return (
    <section ref={sectionRef} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-space/40 via-transparent to-space/40 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Terminal window */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-muted font-mono">philosophy.py</span>
            </div>

            {/* Body */}
            <div className="bg-[#0d0d17] p-6 md:p-8 font-mono text-sm leading-relaxed">
              <p className="text-muted mb-4 text-xs">
                <span className="text-green-400">~/mtn</span>
                <span className="text-muted"> $ python3 philosophy.py</span>
              </p>

              {/* Typed line */}
              <p className="text-gray-200 mb-4 min-h-[1.5em]">
                <span className="text-[#f97316]">print</span>
                <span className="text-white">(</span>
                <span className="text-[#a5d6a7]">"</span>
                <span className="text-[#a5d6a7]">
                  {typed.replace(/^print\("/, '').replace(/"?\)$/, '')}
                </span>
                {!done && <span className="cursor-blink text-white">▋</span>}
                {done && (
                  <>
                    <span className="text-[#a5d6a7]">"</span>
                    <span className="text-white">)</span>
                  </>
                )}
              </p>

              {done && (
                <>
                  {/* Output quote */}
                  <div className="border-l-2 border-accent/60 pl-4 my-6">
                    <p className="text-lg md:text-xl font-sans font-bold text-white leading-snug">
                      "{PERSONAL.quote}"
                    </p>
                  </div>

                  {/* Author line */}
                  <p className="text-gray-500 text-xs">
                    <span className="text-[#569cd6]">const</span>{' '}
                    <span className="text-[#9cdcfe]">author</span>{' '}
                    <span className="text-white">=</span>{' '}
                    <span className="text-[#ce9178]">"{PERSONAL.handle}"</span>
                    <span className="text-white">;</span>
                  </p>
                  <p className="text-muted mt-3 text-xs">
                    <span className="text-green-400">~/mtn</span>
                    <span className="text-muted"> $ </span>
                    <span className="cursor-blink text-white">▋</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
