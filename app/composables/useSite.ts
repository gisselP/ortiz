// Textos y cifras de ejemplo (luego salen del panel admin). Los videos salen de Supabase; si la base está vacía se muestran los de ejemplo.
// Todo lo que va entre [corchetes] es contenido que Sofía debe dar.

export type Work = {
  id: string
  client: string
  rubro: string
  tone: string
  preview: string
  full: string
  poster?: string
  section: 'reel' | 'best' | 'redes' | 'horizontal' | 'contenido'
  problem?: string
  did?: string
  result?: string
  metrics?: { value: string; label: string; icon: string }[]
}

const tones = ['#1A1A14', '#34311F', '#46422E', '#5C6B3A']
const rubros = ['Veterinaria', 'Inmobiliaria', 'Pastelería', 'Colegio', 'Joyería', 'Gastronomía']

function video(n: number) {
  const k = ((n - 1) % 3) + 1
  return { preview: `/videos/preview-${k}.mp4`, full: `/videos/video-${k}.mp4`, poster: `/videos/poster-${k}.jpg` }
}

function make(section: Work['section'], prefix: string, count: number, offset = 0): Work[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    client: '[Cliente]',
    rubro: rubros[(i + offset) % rubros.length]!,
    tone: tones[(i * 3 + offset) % tones.length]!,
    ...video(i + offset + 1),
    section
  }))
}

const metrics = [
  { value: '[000]', label: 'Interacciones', icon: 'heart' },
  { value: '[000]', label: 'Crecimiento', icon: 'trending' },
  { value: '[000]', label: 'Tiempo', icon: 'clock' }
]

export const site = {
  name: 'Sofía Ortiz',
  role: 'Comunicadora audiovisual en Lima',
  city: 'Lima, Perú',
  description:
    'Sofía Ortiz, comunicadora audiovisual en Lima. Videos verticales para redes, manejo de contenido y piezas para negocios.',
  availability: '[Disponible para nuevos proyectos]',
  lead: '[Una frase tuya, con tu voz. Qué haces y para quién, sin palabras de empresa.]',
  whatsapp: '#contacto', // luego: https://wa.me/51XXXXXXXXX?text=Hola%20Sof%C3%ADa...
  bio: '[Una frase tuya, con tu voz. Cómo te presentarías a un cliente en persona.]',
  bioMore: 'Empecé en agencias aprendiendo el oficio y hoy trabajo por cuenta propia, eligiendo mis proyectos.',
  tools: 'Premiere, After Effects, Photoshop, Illustrator, Audition, InDesign y Lightroom.',
  stats: [
    { value: 3, suffix: '+', label: 'Años de experiencia', src: '[Desde cuándo, con enlace]', href: '#sobre-mi' },
    { value: 15, suffix: '+', label: 'Clientes', src: '[Ver algunos nombres]', href: '#casos' },
    { value: 1, suffix: 'M+', label: 'Reproducciones', src: '[De dónde sale la cifra]', href: '#redes' }
  ],
  services: [
    { name: 'Edición de video', text: '[Una línea sobre qué incluye]', eta: '[Entrega en X días]' },
    { name: 'Guiones', text: '[Una línea sobre qué incluye]', eta: '[Entrega en X días]' },
    { name: 'Grabación', text: '[Una línea sobre qué incluye]', eta: '[Entrega en X días]' },
    { name: 'Manejo de redes', text: '[Una línea sobre qué incluye]', eta: '[Entrega en X días]' }
  ],
  steps: [
    { n: 1, title: 'Me escribes', text: '[Me cuentas qué necesitas y en qué red lo vas a publicar.]' },
    { n: 2, title: 'Grabamos o recibo tu material', text: '[Cómo lo coordinamos, en una línea.]' },
    { n: 3, title: 'Recibes tu video editado', text: '[Entrega en X días, con una ronda de cambios.]' }
  ],
  quotes: [
    { text: '[Frase real del cliente, tal como la dijo.]', who: '[Nombre y apellido]', rubro: 'Gastronomía' },
    { text: '[Frase real del cliente, tal como la dijo.]', who: '[Nombre y apellido]', rubro: 'Educación' }
  ],
  contacts: [
    { label: 'Celular', icon: 'phone', text: '[+51 000 000 000]' },
    { label: 'Correo', icon: 'mail', text: '[correo@dominio.com]' },
    { label: 'Instagram', icon: 'camera', text: '[@usuario]' },
    { label: 'TikTok', icon: 'play', text: '[@usuario]' },
    { label: 'LinkedIn', icon: 'briefcase', text: '[linkedin.com/in/usuario]' },
    { label: 'Behance', icon: 'image', text: '[behance.net/usuario]' }
  ]
}

function demoWorks() {
  const reel: Work = {
    id: 'reel', client: 'Mi reel', rubro: 'Reel 2026', tone: '#34311F', ...video(1), section: 'reel',
    problem: '[Qué reúne este reel, en una frase.]', did: '[Guion, grabación y edición.]', result: '[Qué lograste con estos videos.]'
  }
  const hero = make('best', 'destacado', 2, 1)
  const redes = make('redes', 'red', 8, 2)
  const horizontal: Work[] = [
    { ...make('horizontal', 'horizontal', 1)[0]!, client: '[Nombre del proyecto]', rubro: 'Universidad', tone: '#34311F' },
    { ...make('horizontal', 'horizontal', 1, 1)[0]!, id: 'horizontal-2', client: '[Nombre del proyecto]', rubro: 'Universidad', tone: '#46422E' }
  ]
  const contenido: Work[] = [
    {
      ...make('contenido', 'contenido', 1)[0]!, id: 'contenido-1', client: 'Heladería', rubro: 'Gastronomía', tone: '#46422E',
      problem: '[Qué necesitaba el cliente al llegar, en una frase.]',
      did: 'Grabación, guiones, manejo de redes y edición. [Detalle breve]',
      result: '[Qué cambió para el cliente, en una frase.]', metrics
    },
    {
      ...make('contenido', 'contenido', 1, 1)[0]!, id: 'contenido-2', client: 'Colegio', rubro: 'Educación', tone: '#34311F',
      problem: '[Qué necesitaba el cliente al llegar, en una frase.]',
      did: 'Grabación, guiones, manejo de redes y edición. [Detalle breve]',
      result: '[Qué cambió para el cliente, en una frase.]', metrics
    }
  ]
  const all = [reel, ...hero, ...redes, ...contenido, ...horizontal]
  return { reel, hero, redes, horizontal, contenido, all }
}

// ---------- Videos desde Supabase ----------
export type DbWork = {
  id: string
  slug: string
  client: string
  rubro: string
  section: Work['section']
  tone: string
  preview_url: string | null
  video_url: string | null
  poster_url: string | null
  problem: string | null
  did: string | null
  result: string | null
  metrics: { value: string; label: string; icon?: string }[] | null
  position: number
  published: boolean
  created_at: string
}

const metricIcons = ['heart', 'trending', 'clock']

export function toWork(r: DbWork): Work {
  const full = r.video_url || r.preview_url || ''
  const metrics = (r.metrics || []).filter((m) => m.value || m.label)
  return {
    id: r.slug,
    client: r.client,
    rubro: r.rubro,
    tone: r.tone,
    preview: r.preview_url || full,
    full,
    poster: r.poster_url || undefined,
    section: r.section,
    problem: r.problem || undefined,
    did: r.did || undefined,
    result: r.result || undefined,
    metrics: metrics.length ? metrics.map((m, i) => ({ value: m.value, label: m.label, icon: m.icon || metricIcons[i % 3]! })) : undefined
  }
}

async function fetchWorks(sb: ReturnType<typeof useSupabase>): Promise<Work[] | null> {
  try {
    const { data, error } = await sb
      .from('works')
      .select('*')
      .eq('published', true)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (error || !data?.length) return null
    return (data as DbWork[]).map(toWork)
  } catch (e) {
    console.warn('No pude leer los videos de la base, uso los de ejemplo.', e)
    return null
  }
}

// Si hay videos en la base se usan solo esos. Si no hay ninguno, se muestran los de ejemplo.
export function useWorks() {
  // el cliente se crea aquí, dentro del contexto de Nuxt, y no dentro del callback asíncrono
  const sb = useSupabase()
  const { data, refresh } = useAsyncData<Work[] | null>('works', () => fetchWorks(sb), { default: () => null })
  // el sitio sale ya armado y en el navegador se pide la lista fresca, así lo nuevo aparece sin esperar
  onNuxtReady(() => { refresh() })

  const demo = demoWorks()
  const isDemo = computed(() => !data.value?.length)
  const all = computed<Work[]>(() => (isDemo.value ? demo.all : data.value!))
  const by = (s: Work['section']) => computed(() => all.value.filter((w) => w.section === s))
  const reels = by('reel')
  const reel = computed<Work | null>(() => reels.value[0] ?? null)
  return { reel, hero: by('best'), redes: by('redes'), horizontal: by('horizontal'), contenido: by('contenido'), all, isDemo, refresh }
}
