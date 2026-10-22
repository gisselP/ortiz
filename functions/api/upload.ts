// Cloudflare Pages Function. Recibe un archivo del panel y lo guarda en el bucket de R2.
// POST /api/upload?kind=video|preview|poster|photo&name=archivo.mp4
// Archivos grandes (más de 90 MB) se suben en partes de 50 MB, porque Cloudflare solo deja pasar
// unos 100 MB por petición:
//   POST ?action=mpu-create&kind=&name=&size=   -> { key, uploadId, partSize }
//   POST ?action=mpu-part&key=&uploadId=&part=N  (cuerpo = la parte) -> { partNumber, etag }
//   POST ?action=mpu-done&key=&uploadId=         (cuerpo JSON { parts }) -> { url, key, size }
// Solo deja pasar a administradores de Supabase (tabla public.admins).
//
// Configuración en Cloudflare Pages (Settings > Bindings):
//   VIDEOS  -> bucket R2 "sofia-videos"
// Variables opcionales: R2_PUBLIC_URL, SUPABASE_URL, SUPABASE_KEY.

type R2Meta = { httpMetadata?: { contentType?: string; cacheControl?: string } }
type R2Part = { partNumber: number; etag: string }
type R2Multipart = {
  uploadPart(partNumber: number, value: ReadableStream | ArrayBuffer): Promise<R2Part>
  complete(parts: R2Part[]): Promise<{ size?: number }>
}
type R2Bucket = {
  put(key: string, value: ReadableStream | ArrayBuffer | null, options?: R2Meta): Promise<unknown>
  createMultipartUpload(key: string, options?: R2Meta): Promise<{ uploadId: string }>
  resumeMultipartUpload(key: string, uploadId: string): R2Multipart
}
type Env = { VIDEOS?: R2Bucket; R2_PUBLIC_URL?: string; SUPABASE_URL?: string; SUPABASE_KEY?: string }
type Ctx = { request: Request; env: Env }

const DEFAULT_PUBLIC_URL = 'https://pub-4615b47e3731474b9b5611dcf7a0546f.r2.dev'
const DEFAULT_SUPABASE_URL = 'https://klsqycktkhnihuprprzu.supabase.co'
// clave publishable de Supabase: es pública por diseño
const DEFAULT_SUPABASE_KEY = 'sb_publishable_tiNAnt3wrwHY65bV--ecsw_yCTbGzgK'
const MAX_BYTES = 95 * 1024 * 1024 // una sola petición: Pages permite hasta 100 MB
const PART_BYTES = 50 * 1024 * 1024 // tamaño de cada parte en las subidas grandes
const MAX_TOTAL_BYTES = 500 * 1024 * 1024 // tope de un video subido en partes
const CACHE = 'public, max-age=31536000, immutable'
const KEY_RE = /^(videos|posters|photos)\/\d{4}-\d{2}\/[a-z0-9-]+-[0-9a-f]{8}\.(mp4|mov|webm|jpg|png|webp)$/

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

  const url = new URL(request.url)
  const action = url.searchParams.get('action') || ''
  const base = (env.R2_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/$/, '')

  // subida grande, paso 2 y 3: partes y cierre
  if (action === 'mpu-part' || action === 'mpu-done') {
    const key = url.searchParams.get('key') || ''
    const uploadId = url.searchParams.get('uploadId') || ''
    if (!KEY_RE.test(key) || !uploadId) return json({ error: 'Datos de subida no válidos.' }, 400)
    const upload = env.VIDEOS.resumeMultipartUpload(key, uploadId)
    try {
      if (action === 'mpu-part') {
        const n = Number(url.searchParams.get('part'))
        const len = Number(request.headers.get('content-length') || 0)
        if (!Number.isInteger(n) || n < 1 || n > 10000 || !len || !request.body) return json({ error: 'La parte llegó vacía.' }, 400)
        if (len > MAX_BYTES) return json({ error: 'La parte es demasiado grande.' }, 413)
        return json(await upload.uploadPart(n, request.body))
      }
      const body = (await request.json().catch(() => null)) as { parts?: R2Part[] } | null
      const parts = (body?.parts || []).filter((p) => Number.isInteger(p?.partNumber) && typeof p?.etag === 'string')
      if (!parts.length) return json({ error: 'Faltan las partes del archivo.' }, 400)
      parts.sort((a, b) => a.partNumber - b.partNumber)
      const done = await upload.complete(parts)
      return json({ url: `${base}/${key}`, key, size: done?.size ?? 0 })
    } catch {
      return json({ error: 'No pude guardar el archivo. Intenta otra vez.' }, 500)
    }
  }

  // 3. qué archivo es
  const kind = url.searchParams.get('kind') || ''
  if (!['video', 'preview', 'poster', 'photo'].includes(kind)) return json({ error: 'Tipo de archivo no válido.' }, 400)
  const type = (request.headers.get('content-type') || '').split(';')[0]!.trim().toLowerCase()
  const isImage = kind === 'poster' || kind === 'photo'
  const ext = (isImage ? IMAGE_TYPES : VIDEO_TYPES)[type]
  if (!ext) {
    return json({ error: isImage ? 'La imagen debe ser JPG, PNG o WebP.' : 'El video debe ser MP4, MOV o WebM.' }, 415)
  }
  const size = Number(request.headers.get('content-length') || 0)

  // 4. nombre único
  const d = new Date()
  const folder = kind === 'photo' ? 'photos' : kind === 'poster' ? 'posters' : 'videos'
  const rand = crypto.randomUUID().slice(0, 8)
  const key = `${folder}/${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}/${slug(url.searchParams.get('name') || 'archivo')}-${rand}.${ext}`

  // subida grande, paso 1: abrir
  if (action === 'mpu-create') {
    if (isImage) return json({ error: 'Las imágenes se suben de una sola vez.' }, 400)
    const total = Number(url.searchParams.get('size') || 0)
    if (!total) return json({ error: 'El archivo llegó vacío.' }, 400)
    if (total > MAX_TOTAL_BYTES) return json({ error: 'El archivo pesa más de 500 MB. Comprímelo y vuelve a intentar.' }, 413)
    try {
      const { uploadId } = await env.VIDEOS.createMultipartUpload(key, { httpMetadata: { contentType: type, cacheControl: CACHE } })
      return json({ key, uploadId, partSize: PART_BYTES })
    } catch {
      return json({ error: 'No pude empezar la subida. Intenta otra vez.' }, 500)
    }
  }

  // subida normal, de una sola petición
  if (!size || !request.body) return json({ error: 'El archivo llegó vacío.' }, 400)
  if (size > MAX_BYTES) return json({ error: 'El archivo pesa más de 95 MB. Comprímelo y vuelve a intentar.' }, 413)
  try {
    await env.VIDEOS.put(key, request.body, { httpMetadata: { contentType: type, cacheControl: CACHE } })
  } catch {
    return json({ error: 'No pude guardar el archivo. Intenta otra vez.' }, 500)
  }
  return json({ url: `${base}/${key}`, key, size })
}

// cualquier otro método
export const onRequest = async (): Promise<Response> => json({ error: 'Método no permitido.' }, 405)
