<script setup lang="ts">
import '~/assets/css/admin.css'
import type { DbWork } from '~/composables/useSite'

useHead({ title: 'Video | Panel de Sofía Ortiz', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const { sb, isAdmin, ready, load } = useAdmin()

const sections = [
  { key: 'reel', label: 'Mi reel (solo uno)' },
  { key: 'best', label: 'Mejores videos' },
  { key: 'redes', label: 'TikTok / Reels / Shorts' },
  { key: 'contenido', label: 'Creación de Contenido' }
] as const
type SectionKey = (typeof sections)[number]['key']
const rubros = ['Veterinaria', 'Inmobiliaria', 'Pastelería', 'Colegio', 'Joyería', 'Gastronomía', 'Heladería', 'Universidad']
const tones = ['#1A1A14', '#34311F', '#46422E', '#5C6B3A']

const editId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''))
const isEdit = computed(() => !!editId.value)

const f = reactive({
  section: ((typeof route.query.seccion === 'string' && sections.some((s) => s.key === route.query.seccion) ? route.query.seccion : 'best') as SectionKey),
  client: '',
  rubroSel: rubros[0]!,
  rubroOtro: '',
  video_url: '',
  preview_url: '',
  poster_url: '',
  problem: '',
  did: '',
  result: '',
  m: [
    { value: '', label: 'Interacciones' },
    { value: '', label: 'Crecimiento' },
    { value: '', label: 'Tiempo' }
  ],
  published: true
})
const rubro = computed(() => (f.rubroSel === '__otro' ? f.rubroOtro.trim() : f.rubroSel))
const original = ref<DbWork | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploading = reactive({ v: false, po: false, p: false })
const anyUploading = computed(() => uploading.v || uploading.po || uploading.p)
const posterUp = ref<{ uploadFile: (f: File) => Promise<void> } | null>(null)
const error = ref('')

function fill(w: DbWork) {
  original.value = w
  f.section = w.section
  f.client = w.client
  if (rubros.includes(w.rubro)) f.rubroSel = w.rubro
  else {
    f.rubroSel = '__otro'
    f.rubroOtro = w.rubro
  }
  f.video_url = w.video_url || ''
  f.preview_url = w.preview_url || ''
  f.poster_url = w.poster_url || ''
  f.problem = w.problem || ''
  f.did = w.did || ''
  f.result = w.result || ''
  const ms = w.metrics || []
  f.m.forEach((m, i) => {
    if (ms[i]) {
      m.value = ms[i]!.value
      m.label = ms[i]!.label || m.label
    }
  })
  f.published = w.published
}

// Saca una imagen del video elegido y la sube como portada, si no hay una puesta.
async function makePoster(file: File) {
  if (f.poster_url || !posterUp.value) return
  const src = URL.createObjectURL(file)
  try {
    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'metadata'
    v.src = src
    await new Promise<void>((ok, fail) => {
      v.onloadedmetadata = () => ok()
      v.onerror = () => fail(new Error('video'))
    })
    v.currentTime = Math.min(1, (v.duration || 2) / 4)
    await new Promise<void>((ok) => (v.onseeked = () => ok()))
    const w = Math.min(720, v.videoWidth || 720)
    const c = document.createElement('canvas')
    c.width = w
    c.height = Math.round(w * ((v.videoHeight || 1280) / (v.videoWidth || 720)))
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
    const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/jpeg', 0.85))
    if (blob && !f.poster_url) await posterUp.value.uploadFile(new File([blob], 'portada.jpg', { type: 'image/jpeg' }))
  } catch {
    // si el navegador no puede leer el video, simplemente no hay portada automática
  } finally {
    URL.revokeObjectURL(src)
  }
}

function slugify(t: string) {
  return (
    t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'video'
  )
}
const isUrl = (u: string) => /^https?:\/\/\S+$/i.test(u)

async function save() {
  error.value = ''
  if (anyUploading.value) return (error.value = 'Espera a que termine de subirse el archivo.')
  if (!f.client.trim()) return (error.value = 'Escribe el título del video, por ejemplo el nombre del cliente.')
  if (!rubro.value) return (error.value = 'Escribe de qué rubro es.')
  if (!isUrl(f.video_url.trim())) return (error.value = 'Sube el video o pega su link. Es lo único obligatorio de este paso.')
  for (const [k, v] of [['corte corto', f.preview_url], ['póster', f.poster_url]] as const) {
    if (v.trim() && !isUrl(v.trim())) return (error.value = `El link del ${k} no es válido. Debe empezar con https://`)
  }
  saving.value = true
  try {
    const metrics = f.m.filter((m) => m.value.trim()).map((m) => ({ value: m.value.trim(), label: m.label.trim() }))
    const row: Record<string, unknown> = {
      client: f.client.trim(),
      rubro: rubro.value,
      section: f.section,
      video_url: f.video_url.trim(),
      preview_url: f.preview_url.trim() || null,
      poster_url: f.poster_url.trim() || null,
      problem: f.problem.trim() || null,
      did: f.did.trim() || null,
      result: f.result.trim() || null,
      metrics,
      published: f.published
    }
    // el reel es uno solo: si ya hay otro, el nuevo lo reemplaza y el anterior pasa a "Mejores videos"
    if (f.section === 'reel') {
      let q = sb.from('works').update({ section: 'best' }).eq('section', 'reel')
      if (original.value) q = q.neq('id', original.value.id)
      await q
    }
    if (isEdit.value && original.value) {
      if (original.value.section !== f.section) {
        const { data: last } = await sb.from('works').select('position').eq('section', f.section).order('position', { ascending: false }).limit(1)
        row.position = (last?.[0]?.position ?? -1) + 1
      }
      const { error: e } = await sb.from('works').update(row).eq('id', original.value.id)
      if (e) throw e
    } else {
      const { data: last } = await sb.from('works').select('position').eq('section', f.section).order('position', { ascending: false }).limit(1)
      row.position = (last?.[0]?.position ?? -1) + 1
      row.slug = `${slugify(f.client)}-${Math.random().toString(36).slice(2, 6)}`
      row.tone = tones[(row.position as number) % tones.length]
      const { error: e } = await sb.from('works').insert(row)
      if (e) throw e
    }
    await navigateTo('/admin')
  } catch {
    error.value = 'No pude guardar. Revisa tu conexión y vuelve a intentar.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await load()
  if (!isAdmin.value) {
    await navigateTo('/admin')
    return
  }
  if (isEdit.value) {
    const { data } = await sb.from('works').select('*').eq('id', editId.value).maybeSingle()
    if (data) fill(data as DbWork)
    else error.value = 'No encontré ese video. Puede que ya lo hayas quitado.'
  }
  loading.value = false
})
</script>

<template>
  <p v-if="!ready || !isAdmin" class="adm" style="padding: 40px">Cargando…</p>
  <AdminShell v-else active="videos">
    <NuxtLink class="back" to="/admin">← Volver a mis videos</NuxtLink>
    <h1 style="margin: 12px 0 40px">{{ isEdit ? 'Editar video' : 'Agregar video' }}</h1>

    <p v-if="loading" class="sub">Cargando…</p>
    <form v-else class="cols" @submit.prevent="save">
      <div class="fm">
        <section class="fsec">
          <div class="step-k">Paso 1</div>
          <h2>Elige tu video</h2>
          <div class="fg">
            <FileUpload
              v-model="f.video_url"
              input-id="v"
              kind="video"
              label="Video completo"
              button="Elegir video"
              accept="video/mp4,video/quicktime,video/webm"
              hint="Formato MP4 vertical, hasta 500 MB. Los videos más livianos cargan más rápido en tu web."
              @picked="makePoster"
              @busy="(b) => (uploading.v = b)"
            />
          </div>
          <div class="fg">
            <FileUpload
              ref="posterUp"
              v-model="f.poster_url"
              input-id="po"
              kind="poster"
              label="Imagen de portada (opcional)"
              button="Elegir imagen"
              accept="image/jpeg,image/png,image/webp"
              hint="Si no eliges una, se crea sola con una imagen de tu video."
              :max-mb="10"
              @busy="(b) => (uploading.po = b)"
            />
          </div>
          <div class="fg">
            <FileUpload
              v-model="f.preview_url"
              input-id="p"
              kind="preview"
              label="Corte corto para la vista previa (opcional)"
              button="Elegir corte"
              accept="video/mp4,video/quicktime,video/webm"
              hint="Unos 10 segundos. Es el que se mueve al pasar el mouse. Si no subes uno, se usa el video completo."
              @busy="(b) => (uploading.p = b)"
            />
          </div>
        </section>

        <fieldset class="fsec">
          <legend class="step-k" style="padding: 0">Paso 2</legend>
          <h2>¿Dónde lo quieres mostrar?</h2>
          <div class="opts">
            <label v-for="s in sections" :key="s.key" class="opt" :class="{ on: f.section === s.key }">
              <input v-model="f.section" type="radio" name="seccion" :value="s.key"> {{ s.label }}
            </label>
          </div>
        </fieldset>

        <section class="fsec">
          <div class="step-k">Paso 3</div>
          <h2>Cuéntanos de qué trata</h2>
          <div class="fg">
            <label class="fl" for="t">Título del video</label>
            <input id="t" v-model="f.client" class="field" type="text" placeholder="Por ejemplo, el nombre del cliente o del proyecto" required>
          </div>
          <div class="fg">
            <label class="fl" for="r">¿De qué rubro es?</label>
            <select id="r" v-model="f.rubroSel" class="field">
              <option v-for="r in rubros" :key="r" :value="r">{{ r }}</option>
              <option value="__otro">Otro</option>
            </select>
            <input v-if="f.rubroSel === '__otro'" v-model="f.rubroOtro" class="field" style="margin-top: 10px" type="text" placeholder="Escribe el rubro" aria-label="Rubro">
          </div>
        </section>

        <section class="fsec">
          <h2 style="font-size: 24px; margin: 0 0 4px">Más detalle (opcional)</h2>
          <p class="fh" style="margin: 0 0 16px">Sale en la página del video, y en Creación de Contenido se ve junto al resultado. Si no llenas algo, simplemente no aparece.</p>
          <div class="fg">
            <label class="fl" for="pr">¿Qué necesitaba el cliente?</label>
            <textarea id="pr" v-model="f.problem" class="field" placeholder="Cuéntalo con tus palabras" />
          </div>
          <div class="fg">
            <label class="fl" for="di">¿Qué hiciste en este proyecto?</label>
            <textarea id="di" v-model="f.did" class="field" placeholder="Guion, grabación, edición…" />
          </div>
          <div class="fg">
            <label class="fl" for="re">¿Qué cambió para el cliente?</label>
            <textarea id="re" v-model="f.result" class="field" placeholder="El resultado, en una frase" />
          </div>
          <div class="mrow">
            <div v-for="(m, i) in f.m" :key="i">
              <label class="fl" :for="`m${i}`">{{ m.label }}</label>
              <input :id="`m${i}`" v-model="m.value" class="field" type="text" placeholder="Por ejemplo, 12 mil">
            </div>
          </div>
        </section>

        <label class="sw" style="margin-bottom: 28px"><input v-model="f.published" type="checkbox"> Mostrar este video en mi web</label>

        <p v-if="error" class="note err" role="alert">{{ error }}</p>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 20px">
          <button class="abtn" type="submit" :disabled="saving || anyUploading">{{ saving ? 'Guardando…' : anyUploading ? 'Subiendo…' : 'Guardar' }}</button>
          <NuxtLink class="abtn ghost" to="/admin">Cancelar</NuxtLink>
        </div>
      </div>

      <aside class="apv" aria-label="Vista previa">
        <div class="k">Así se verá en tu web</div>
        <div class="card">
          <img v-if="f.poster_url" :src="f.poster_url" alt="">
          <video v-else-if="f.preview_url || f.video_url" :src="f.preview_url || f.video_url" muted playsinline preload="metadata" />
          <div>
            <b>{{ f.client || 'Título del video' }}</b>
            <span>{{ rubro || 'Rubro' }}</span>
          </div>
        </div>
      </aside>
    </form>
  </AdminShell>
</template>
