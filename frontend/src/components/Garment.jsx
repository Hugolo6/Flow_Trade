import { detailTone } from '@/lib/color'

// Ilustraciones planas de prendas, teñidas con el color de la variante elegida.
// Sirven mientras los productos no tengan foto (image_url) en Supabase.
const SHAPES = {
  tee: (c, d) => (
    <>
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M62 28 22 46l14 38 26-10v118h76V74l26 10 14-38-40-18c-6 12-20 18-38 18S68 40 62 28Z" />
      <path fill="none" stroke={d} strokeWidth="4" strokeLinecap="round"
        d="M70 30c6 12 18 18 30 18s24-6 30-18" />
      <path fill="none" stroke={d} strokeWidth="1.5" opacity=".6" d="M62 184h76M62 74l-4-20M138 74l4-20" />
    </>
  ),
  hoodie: (c, d) => (
    <>
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M72 30c4-8 16-12 28-12s24 4 28 12l34 16 22 108-24 8-14-58v92H54v-92l-14 58-24-8 22-108Z" />
      <path fill={d} opacity=".55" d="M76 32c4 20 14 28 24 28s20-8 24-28c-6-8-14-11-24-11s-18 3-24 11Z" />
      <path fill="none" stroke={d} strokeWidth="2.5" strokeLinecap="round" d="M92 60v32M108 60v32" />
      <path fill="none" stroke={d} strokeWidth="2" strokeLinejoin="round" d="M70 140h60l8 36H62Z" />
      <path fill={d} opacity=".35" d="M54 184h92v12H54Z" />
    </>
  ),
  pants: (c, d) => (
    <>
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M62 20h76l12 176h-42l-8-116-8 116H50Z" />
      <path fill={d} opacity=".4" d="M62 20h76v16H62Z" />
      <path fill="none" stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M54 112h26v34H54ZM120 112h26v34h-26ZM100 36v44" />
      <path fill="none" stroke={d} strokeWidth="1.5" d="M54 120h26M120 120h26" />
    </>
  ),
  jacket: (c, d) => (
    <>
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M70 26 38 40 18 124l26 6 12-46v102h88V84l12 46 26-6-20-84-32-14-30 14Z" />
      <path fill="#f6f2e9" stroke={d} strokeWidth="1.5" strokeLinejoin="round"
        d="m70 26 30 18 30-18 8 14-38 20-38-20Z" />
      <path fill="none" stroke={d} strokeWidth="2" strokeLinecap="round" d="M100 60v126" />
      <path fill="none" stroke={d} strokeWidth="1.5" strokeLinejoin="round"
        d="M66 90h22v20H66ZM112 90h22v20h-22ZM56 84h88" />
    </>
  ),
  cap: (c, d) => (
    <>
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M44 122c0-48 34-78 68-78 34 0 56 32 56 78Z" />
      <path fill={d} opacity=".5" stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M28 128c34-14 96-16 142-8l8 12c-48 12-108 14-150 4Z" />
      <path fill="none" stroke={d} strokeWidth="1.8" d="M112 44c-14 26-14 52-8 78" />
      <circle cx="112" cy="44" r="4" fill={d} />
    </>
  ),
  shoe: (c, d) => (
    <>
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M22 140c0-12 8-18 18-20l30-8 18-22c6-6 14-4 18 2l10 16c12 4 34 6 52 16 8 6 12 14 12 20v6H22Z" />
      <path fill="#f6f2e9" stroke={d} strokeWidth="2" strokeLinejoin="round" d="M20 150h162v16H20Z" />
      <path fill="none" stroke={d} strokeWidth="2" strokeLinecap="round" d="m94 96 12 12m6-18 12 12" />
    </>
  ),
  backpack: (c, d) => (
    <>
      <path fill="none" stroke={d} strokeWidth="5" strokeLinecap="round" d="M84 34c0-18 32-18 32 0" />
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M52 72c0-26 20-42 48-42s48 16 48 42v104a14 14 0 0 1-14 14H66a14 14 0 0 1-14-14Z" />
      <path fill={d} opacity=".28" stroke={d} strokeWidth="2" strokeLinejoin="round"
        d="M66 118h68v54a8 8 0 0 1-8 8H74a8 8 0 0 1-8-8Z" />
      <path fill="none" stroke={d} strokeWidth="2" strokeLinecap="round" d="M66 118h68M84 98h32M52 98c-12 14-12 52 0 66M148 98c12 14 12 52 0 66" />
    </>
  ),
  beanie: (c, d) => (
    <>
      <circle cx="100" cy="46" r="13" fill={d} opacity=".55" stroke={d} strokeWidth="2" />
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round" d="M48 142c0-60 28-88 52-88s52 28 52 88Z" />
      <path fill={c} stroke={d} strokeWidth="2" strokeLinejoin="round" d="M44 134h112v24a6 6 0 0 1-6 6H50a6 6 0 0 1-6-6Z" />
      <path fill="none" stroke={d} strokeWidth="1.8" d="M64 136v26M84 136v26M104 136v26M124 136v26M144 136v26" />
    </>
  ),
  watch: (c, d) => (
    <>
      <path fill={d} opacity=".7" d="M82 24h36l4 40H78ZM78 136h44l-4 40H82Z" />
      <circle cx="100" cy="100" r="38" fill={c} stroke={d} strokeWidth="3" />
      <circle cx="100" cy="100" r="30" fill="#f6f2e9" opacity=".92" />
      <path fill="none" stroke={d} strokeWidth="3" strokeLinecap="round" d="M100 100V80M100 100l14 8" />
    </>
  ),
}

const KIND_BY_CATEGORY = {
  playeras: 'tee', sudaderas: 'hoodie', pantalones: 'pants', chamarras: 'jacket',
  gorras: 'cap', tenis: 'shoe', 'ropa-deportiva': 'pants', accesorios: 'watch',
}

// Algunos productos de una misma categoría se dibujan distinto (ej. mochila vs. gorro en Accesorios)
const KIND_BY_NAME = { 'Mochila Urbana': 'backpack', 'Gorro Tejido': 'beanie' }

export function kindFor({ name, categorySlug }) {
  return KIND_BY_NAME[name] ?? KIND_BY_CATEGORY[categorySlug] ?? 'tee'
}

export function Garment({ kind = 'tee', color = '#111111', className, title }) {
  const draw = SHAPES[kind] ?? SHAPES.tee
  return (
    <svg
      viewBox="0 0 200 210"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ filter: 'drop-shadow(0 8px 10px rgba(21,21,21,.14))' }}
    >
      {draw(color, detailTone(color))}
    </svg>
  )
}
