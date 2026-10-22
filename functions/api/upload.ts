// Cloudflare Pages Function. Recibe un archivo del panel y lo guarda en el bucket de R2.
// POST /api/upload?kind=video|preview|poster&name=archivo.mp4
// Solo deja pasar a administradores de Supabase (tabla public.admins).
//
// Configuración en Cloudflare Pages (Settings > Bindings):
//   VIDEOS  -> bucket R2 "sofia-videos"
// Variables opcionales: R2_PUBLIC_URL, SUPABASE_URL, SUPABASE_KEY.

type R2Bucket = {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | null,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ): Promise<unknown>
}
type Env = { VIDEOS?: R2Bucket; R2_PUBLIC_URL?: string; SUPABASE_URL?: string; SUPABASE_KEY?: string }
type Ctx = { request: Request; env: Env }

const DEFAULT_PUBLIC_URL = 'https://pub-4615b47e3731474b9b5611dcf7a0546f.r2.dev'
const DEFAULT_SUPABASE_URL = 'https://klsqycktkhnihuprprzu.supabase.co'
// clave publishable de Supabase: es pública por diseño
const DEFAULT_SUPABASE_KEY = 'sb_publishable_tiNAnt3wrwHY65bV--ecsw_yCTbGzgK'
const MAX_BYTES = 95 * 1024 * 1024 // Pages permite hasta 100 MB por petición

const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' }
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

function slug(name: string) {
  const base = name.replace(/\.[^.]+$/, '')
  return (
    base.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'archivo'
  )
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!env.VIDEOS) return json({ error: 'El bucket de videos no está conectado a este sitio.' }, 500)

  // 1. quién es
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Inicia sesión para subir archivos.' }, 401)
  const supaUrl = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '')
  const headers = { apikey: env.SUPABASE_KEY || DEFAULT_SUPABASE_KEY, authorization: `Bearer ${token}` }
  const who = await fetch(`${supaUrl}/auth/v1/user`, { headers }).catch(() => null)
  if (!who || !who.ok) return json({ error: 'Tu sesión venció. Vuelve a entrar.' }, 401)

  // 2. si es administradora (la regla de la base solo le muestra su propia fila)
  const adm = await fetch(`${supaUrl}/rest/v1/admins?select=user_id`, { headers }).catch(() => null)
  const rows = adm && adm.ok ? ((await adm.json().catch(() => [])) as unknown[]) : []
  if (!Array.isArray(rows) || rows.length === 0) return json({ error: 'Esta cuenta no puede subir archivos.' }, 403)

  // 3. qué archivo es
  const url = new URL(request.url)
  const kind = url.searchParams.get('kind') || ''
  if (!['video', 'preview', 'poster'].includes(kind)) return json({ error: 'Tipo de archivo no válido.' }, 400)
  const type = (request.headers.get('content-type') || '').split(';')[0]!.trim().toLowerCase()
  const ext = (kind === 'poster' ? IMAGE_TYPES : VIDEO_TYPES)[type]
  if (!ext) {
    return json({ error: kind === 'poster' ? 'La portada debe ser una imagen JPG, PNG o WebP.' : 'El video debe ser MP4, MOV o WebM.' }, 415)
  }
  const size = Number(request.headers.get('content-length') || 0)
  if (!size || !request.body) return json({ error: 'El archivo llegó vacío.' }, 400)
  if (size > MAX_BYTES) return json({ error: 'El archivo pesa más de 95 MB. Comprímelo y vuelve a intentar.' }, 413)

  // 4. guardar con un nombre único
  const d = new Date()
  const folder = kind === 'poster' ? 'posters' : 'videos'
  const rand = crypto.randomUUID().slice(0, 8)
  const key = `${folder}/${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}/${slug(url.searchParams.get('name') || 'archivo')}-${rand}.${ext}`
  try {
    await env.VIDEOS.put(key, request.body, { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } })
  } catch {
    return json({ error: 'No pude guardar el archivo. Intenta otra vez.' }, 500)
  }
  const base = (env.R2_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/$/, '')
  return json({ url: `${base}/${key}`, key, size })
}

// cualquier otro método
export const onRequest = async (): Promise<Response> => json({ error: 'Método no permitido.' }, 405)
