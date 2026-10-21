// Datos de ejemplo. Más adelante vienen de Supabase (videos) y del panel admin (textos y cifras).

export type Work = {
  id: string
  client: string
  rubro: string
  tone: string
  preview: string
  full: string
  poster: string
  section: 'best' | 'redes' | 'horizontal' | 'contenido'
}

const tones = ['#1A1A14', '#34311F', '#46422E', '#5C6B3A']
const rubros = ['Veterinaria', 'Inmobiliaria', 'Pastelería', 'Colegio', 'Joyería', 'Gastronomía']

function make(section: Work['section'], prefix: string, count: number, offset = 0): Work[] {
  return Array.from({ length: count }, (_, i) => {
    const n = ((i + offset) % 3) + 1
    return {
      id: `${prefix}-${i + 1}`,
      client: '[Cliente]',
      rubro: rubros[(i + offset) % rubros.length]!,
      tone: tones[(i * 3 + offset) % tones.length]!,
      preview: `/videos/preview-${n}.mp4`,
      full: `/videos/video-${n}.mp4`,
      poster: `/videos/poster-${n}.jpg`,
      section
    }
  })
}

export const site = {
  name: 'Sofía Ortiz',
  role: 'Comunicadora audiovisual',
  city: 'Lima, Perú',
  description:
    'Sofía Ortiz, comunicadora audiovisual en Lima. Videos para redes, piezas institucionales y manejo de contenido para negocios.',
  bio: [
    'Soy Sofía, comunicadora audiovisual en Lima. Grabo, edito y escribo guiones para negocios que quieren contar mejor lo que hacen.',
    'Empecé en agencias aprendiendo el oficio y hoy trabajo por cuenta propia, eligiendo mis proyectos.'
  ],
  tools: 'Premiere, After Effects, Photoshop, Illustrator, Audition, InDesign y Lightroom.',
  stats: [
    { value: 3, suffix: '+', label: 'Años de experiencia' },
    { value: 15, suffix: '+', label: 'Clientes' },
    { value: 1, suffix: 'M+', label: 'Reproducciones' }
  ],
  contacts: [
    { label: 'Celular', icon: 'phone', text: '[+51 000 000 000]' },
    { label: 'LinkedIn', icon: 'briefcase', text: '[linkedin.com/in/usuario]' },
    { label: 'Behance', icon: 'image', text: '[behance.net/usuario]' }
  ]
}

export function useWorks() {
  const best = make('best', 'destacado', 11)
  const redes = make('redes', 'red', 8, 2)
  const horizontal: Work[] = [
    { ...make('horizontal', 'horizontal', 1)[0]!, id: 'horizontal-1', client: 'Institucional', rubro: 'Colegio', tone: '#34311F' },
    { ...make('horizontal', 'horizontal', 1, 1)[0]!, id: 'horizontal-2', client: 'Documental', rubro: 'Universidad', tone: '#46422E' }
  ]
  const contenido: Work[] = [
    { ...make('contenido', 'contenido', 1)[0]!, id: 'contenido-1', client: 'Heladería', rubro: 'Gastronomía', tone: '#46422E' },
    { ...make('contenido', 'contenido', 1, 1)[0]!, id: 'contenido-2', client: 'Colegio', rubro: 'Educación', tone: '#34311F' }
  ]
  const all = [...best, ...redes, ...horizontal, ...contenido]
  return { best, redes, horizontal, contenido, all }
}
