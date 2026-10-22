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
  photo: '',
  replyTime: '[tiempo, por ejemplo menos de 24 horas]',
  contacts: [
    { label: 'Correo', icon: 'mail', text: '[correo@dominio.com]', href: 'mailto:[correo@dominio.com]' },
    { label: 'LinkedIn', icon: 'briefcase', text: '[linkedin.com/in/usuario]', href: 'https://[linkedin.com/in/usuario]' },
    { label: 'Behance', icon: 'image', text: '[behance.net/usuario]', href: 'https://[behance.net/usuario]' }
  ]
}

// ---------- Textos desde Supabase (panel: Números, Sobre mí, Servicios, Contacto) ----------
export type SettingRow = { key: string; value: Record<string, any> }
export type SiteContent = Omit<typeof site, 'stats' | 'steps'> & {
  stats: { value: number; suffix: string; label: string; src: string; href: string }[]
  steps: { n: number; title: string; text: string }[]
}

const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const pick = (v: unknown, fallback: string) => clean(v) || fallback

// acepta @usuario, usuario o un link completo
function socialLink(base: string, v: string) {
  if (/^https?:\/\//i.test(v)) return v
  return base + v.replace(/^@/, '').replace(/^\/+/, '')
}
const shown = (v: string) => v.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')

export function whatsappLink(phone: string) {
  let n = phone.replace(/\D/g, '')
  if (!n) return '#contacto'
  if (n.length === 9) n = '51' + n
  return `https://wa.me/${n}?text=${encodeURIComponent('Hola Sofía, vi tu portafolio y quiero hablar de un video.')}`
}

export function buildContacts(c: Record<string, any>) {
  const out: { label: string; icon: string; text: string; href: string }[] = []
  const phone = clean(c.phone), email = clean(c.email), ig = clean(c.instagram), tt = clean(c.tiktok), li = clean(c.linkedin), be = clean(c.behance)
  if (phone) out.push({ label: 'WhatsApp', icon: 'chat', text: phone, href: whatsappLink(phone) })
  if (email) out.push({ label: 'Correo', icon: 'mail', text: email, href: `mailto:${email}` })
  if (ig) out.push({ label: 'Instagram', icon: 'image', text: shown(ig), href: socialLink('https://instagram.com/', ig) })
  if (tt) out.push({ label: 'TikTok', icon: 'phone', text: shown(tt), href: socialLink('https://tiktok.com/@', tt) })
  if (li) out.push({ label: 'LinkedIn', icon: 'briefcase', text: shown(li), href: socialLink('https://linkedin.com/in/', li) })
  if (be) out.push({ label: 'Behance', icon: 'image', text: shown(be), href: socialLink('https://behance.net/', be) })
  return out
}

// lo que se guardó en el panel pisa a los textos de ejemplo
export function mergeSite(rows: SettingRow[] | null): SiteContent {
  const by = Object.fromEntries((rows || []).map((r) => [r.key, r.value || {}])) as Record<string, Record<string, any>>
  const a = by.about || {}, n = by.numbers || {}, sv = by.services || {}, c = by.contact || {}
  const out: SiteContent = { ...site, stats: site.stats.map((s) => ({ ...s })), steps: site.steps.map((s) => ({ ...s })) }
  out.availability = pick(a.availability, site.availability)
  out.lead = pick(a.lead, site.lead)
  out.bio = pick(a.bio, site.bio)
  out.bioMore = pick(a.bioMore, site.bioMore)
  out.tools = pick(a.tools, site.tools)
  out.photo = clean(a.photo_url)
  if (Array.isArray(n.items)) {
    out.stats = n.items
      .filter((s: any) => clean(s.label) && s.value !== '' && s.value != null && !Number.isNaN(Number(s.value)))
      .map((s: any) => ({ value: Number(s.value), suffix: clean(s.suffix), label: clean(s.label), src: clean(s.src), href: clean(s.href) }))
  }
  if (Array.isArray(sv.services)) out.services = sv.services.filter((s: any) => clean(s.name)).map((s: any) => ({ name: clean(s.name), text: clean(s.text), eta: clean(s.eta) }))
  if (Array.isArray(sv.steps)) out.steps = sv.steps.filter((s: any) => clean(s.title)).map((s: any, i: number) => ({ n: i + 1, title: clean(s.title), text: clean(s.text) }))
  if (by.contact) {
    out.contacts = buildContacts(c)
    out.whatsapp = whatsappLink(clean(c.phone))
    out.replyTime = pick(c.replyTime, '')
  }
  return out
}

export function useSiteContent() {
  const sb = useSupabase()
  const { data, refresh } = useAsyncData<SettingRow[] | null>(
    'site-settings',
    async () => {
      try {
        const { data: rows, error } = await sb.from('site_settings').select('key,value')
        return error ? null : (rows as SettingRow[])
      } catch (e) {
        console.warn('No pude leer los textos de la base, uso los de ejemplo.', e)
        return null
      }
    },
    { default: () => null }
  )
  onNuxtReady(() => { refresh() })
  return computed(() => mergeSite(data.value))
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
