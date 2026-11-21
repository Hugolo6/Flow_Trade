import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Garment } from '@/components/Garment'
import { cn } from '@/lib/utils'

// Composiciones de prendas para cada diapositiva (posición en % dentro del recuadro)
const SCENES = {
  hoodies: [
    { kind: 'hoodie', color: '#D8C3A5', style: { left: '3%', bottom: '2%', width: '54%', '--r': '-5deg' }, delay: 0 },
    { kind: 'hoodie', color: '#3b3b3e', style: { right: '2%', bottom: '0%', width: '56%', '--r': '4deg' }, delay: 120 },
    { kind: 'cap', color: '#151515', style: { left: '36%', top: '0%', width: '30%', '--r': '8deg', zIndex: 10 }, delay: 260 },
  ],
  tees: [
    { kind: 'tee', color: '#FFFFFF', style: { left: '2%', bottom: '8%', width: '45%', '--r': '-9deg' }, delay: 0 },
    { kind: 'tee', color: '#1F2A44', style: { right: '2%', bottom: '6%', width: '45%', '--r': '8deg' }, delay: 120 },
    { kind: 'tee', color: '#151515', style: { left: '27%', bottom: '0%', width: '48%', '--r': '0deg', zIndex: 10 }, delay: 240 },
  ],
  outer: [
    { kind: 'jacket', color: '#3E5C86', style: { left: '2%', bottom: '2%', width: '58%', '--r': '-4deg' }, delay: 0 },
    { kind: 'pants', color: '#3B4A3A', style: { right: '2%', bottom: '0%', width: '42%', '--r': '5deg' }, delay: 140 },
  ],
}

const EXTRA_SLIDES = [
  {
    id: 'basicos', eyebrow: 'BÁSICOS', title: 'Lo esencial, bien hecho',
    subtitle: 'Playeras de algodón que combinan con todo lo que ya tienes.',
    cta_label: 'Ver playeras', to: '/productos?cat=playeras', scene: 'tees',
  },
  {
    id: 'capas', eyebrow: 'TEMPORADA FRÍA', title: 'Capas para toda la ciudad',
    subtitle: 'Chamarras y pantalones cargo para salir sin pensar en el clima.',
    cta_label: 'Ver chamarras', to: '/productos?cat=chamarras', scene: 'outer',
  },
]

function Scene({ scene }) {
  return (
    <div className="relative h-[250px] sm:h-[320px] lg:h-full lg:min-h-[400px]" aria-hidden>
      <div className="absolute inset-x-[6%] bottom-[2%] h-[14%] rounded-[50%] bg-sand-deep/50 blur-xl" />
      {SCENES[scene].map((g, i) => (
        <div key={i} className="settle absolute" style={{ ...g.style, animationDelay: `${g.delay}ms` }}>
          <Garment kind={g.kind} color={g.color} className="h-auto w-full" />
        </div>
      ))}
    </div>
  )
}

export function Hero({ banners }) {
  const navigate = useNavigate()
  const slides = useMemo(() => {
    const first = banners[0]
    const lead = first
      ? [{ ...first, to: first.cta_url || '/productos', scene: 'hoodies' }]
      : []
    return [...lead, ...EXTRA_SLIDES].slice(0, 3)
  }, [banners])

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (paused || reduce || slides.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(id)
  }, [paused, slides.length])

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Novedades"
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sand to-[#efe6d8]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid">
        {slides.map((s, i) => {
          const active = i === index
          return (
            <div
              key={s.id}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                'col-start-1 row-start-1 grid items-center gap-2 px-6 pb-14 pt-9 transition-opacity duration-500 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-14 lg:pb-16 lg:pt-12',
                active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <div className="max-w-xl">
                <p className="text-[13px] font-semibold tracking-[0.14em] text-ink/70">{s.eyebrow}</p>
                <h1
                  className="mt-3 text-[38px] font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-[58px]"
                  style={{ fontStretch: '108%' }}
                >
                  {s.title}
                </h1>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">{s.subtitle}</p>
                <Button size="lg" className="mt-7" onClick={() => navigate(s.to)}>
                  {s.cta_label}
                </Button>
              </div>
              <Scene scene={s.scene} />
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-4 right-5 hidden gap-2 sm:flex">
        {[['Diapositiva anterior', ChevronLeft, -1], ['Diapositiva siguiente', ChevronRight, 1]].map(([label, Icon, step]) => (
          <button
            key={label}
            aria-label={label}
            onClick={() => setIndex((i) => (i + step + slides.length) % slides.length)}
            className="grid size-10 place-items-center rounded-full bg-white/80 shadow-sm hover:bg-white"
          >
            <Icon className="size-5" />
          </button>
        ))}
      </div>

      <div className="absolute bottom-5 left-6 flex gap-2 sm:left-10 lg:left-14" role="group" aria-label="Elegir diapositiva">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === index}
            className={cn(
              'h-2.5 rounded-full transition-all',
              i === index ? 'w-7 bg-ink' : 'w-2.5 bg-ink/30 hover:bg-ink/55',
            )}
          />
        ))}
      </div>
    </section>
  )
}
