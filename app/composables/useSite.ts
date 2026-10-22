// Textos y cifras de ejemplo (luego salen del panel admin). Los videos salen de Supabase.
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
    { label: 'Correo', icon: 'mail', text: '[correo@dominio.com]', href: 'mailto:[correo@dominio.com]' },
    { label: 'LinkedIn', icon: 'briefcase', text: '[linkedin.com/in/usuario]', href: 'https://[linkedin.com/in/usuario]' },
    { label: 'Behance', icon: 'image', text: '[behance.net/usuario]', href: 'https://[behance.net/usuario]' }
  ]
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

// Los videos salen solo de la base. Si no hay ninguno, el sitio no muestra esas secciones.
export function useWorks() {
  // el cliente se crea aquí, dentro del contexto de Nuxt, y no dentro del callback asíncrono
  const sb = useSupabase()
  const { data, refresh } = useAsyncData<Work[] | null>('works', () => fetchWorks(sb), { default: () => null })
  // el sitio sale ya armado y en el navegador se pide la lista fresca, así lo nuevo aparece sin esperar
  onNuxtReady(() => { refresh() })

  const all = computed<Work[]>(() => data.value ?? [])
  const by = (s: Work['section']) => computed(() => all.value.filter((w) => w.section === s))
  const reels = by('reel')
  const reel = computed<Work | null>(() => reels.value[0] ?? null)
  return { reel, hero: by('best'), redes: by('redes'), horizontal: by('horizontal'), contenido: by('contenido'), all, refresh }
}
