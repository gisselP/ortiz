<script setup lang="ts">
// Sube un archivo a /api/upload (función de Cloudflare que lo guarda en R2) y devuelve su link.
const props = defineProps<{
  modelValue: string
  kind: 'video' | 'preview' | 'poster' | 'photo'
  inputId: string
  label: string
  hint?: string
  button: string
  accept: string
  maxMb?: number
}>()
const emit = defineEmits<{
  'update:modelValue': [url: string]
  picked: [file: File]
  busy: [busy: boolean]
}>()

const { sb } = useAdmin()
const progress = ref(0)
const busy = ref(false)
const error = ref('')
const fileName = ref('')
const dragging = ref(false)
const input = ref<HTMLInputElement | null>(null)

function setBusy(v: boolean) {
  busy.value = v
  emit('busy', v)
}

const SINGLE_MAX = 90 * 1024 * 1024 // más que esto se sube en partes
const BIG_MAX = 500 * 1024 * 1024

type Reply = { status: number; body: { url?: string; error?: string; key?: string; uploadId?: string; partSize?: number; etag?: string; partNumber?: number } }

// una petición con progreso; no lanza error, devuelve el estado (0 = se cortó la conexión)
function send(url: string, token: string, body: Blob | string, type: string, onProgress?: (loaded: number) => void): Promise<Reply> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Content-Type', type)
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded) }
    xhr.onerror = () => resolve({ status: 0, body: {} })
    xhr.onload = () => {
      let parsed: Reply['body'] = {}
      try { parsed = JSON.parse(xhr.responseText) } catch { /* respuesta que no es JSON */ }
      resolve({ status: xhr.status, body: parsed })
    }
    xhr.send(body)
  })
}

function failMessage(r: Reply) {
  if (r.status === 0) return 'Se cortó la conexión. Intenta otra vez.'
  if (r.status === 404 || r.status === 405) return 'La subida solo funciona en la web publicada, no en tu computadora. Aquí puedes pegar un link.'
  return r.body.error || 'No pude subir el archivo. Intenta otra vez.'
}

// archivos grandes: se abren, se mandan en partes de ~50 MB y se cierran
async function uploadBig(file: File, token: string): Promise<string | null> {
  const type = file.type || 'application/octet-stream'
  const q = `kind=${props.kind}&name=${encodeURIComponent(file.name)}&size=${file.size}`
  const open = await send(`/api/upload?action=mpu-create&${q}`, token, '', type)
  if (open.status !== 200 || !open.body.key || !open.body.uploadId) { error.value = failMessage(open); return null }
  const { key, uploadId } = open.body
  const partSize = open.body.partSize || 50 * 1024 * 1024
  const total = Math.ceil(file.size / partSize)
  const parts: { partNumber: number; etag: string }[] = []
  let done = 0
  for (let n = 1; n <= total; n++) {
    const chunk = file.slice((n - 1) * partSize, n * partSize)
    let reply: Reply = { status: 0, body: {} }
    for (let attempt = 0; attempt < 3; attempt++) {
      reply = await send(`/api/upload?action=mpu-part&key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&part=${n}`, token, chunk, type, (loaded) => {
        progress.value = Math.round(((done + loaded) / file.size) * 100)
      })
      if (reply.status === 200 && reply.body.etag) break
      if (reply.status !== 0 && reply.status < 500) break // un error que se repetiría igual
    }
    if (reply.status !== 200 || !reply.body.etag) { error.value = failMessage(reply); return null }
    parts.push({ partNumber: reply.body.partNumber || n, etag: reply.body.etag })
    done += chunk.size
    progress.value = Math.round((done / file.size) * 100)
  }
  const end = await send(`/api/upload?action=mpu-done&key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}`, token, JSON.stringify({ parts }), 'application/json')
  if (end.status !== 200 || !end.body.url) { error.value = failMessage(end); return null }
  return end.body.url
}

async function uploadFile(file: File) {
  error.value = ''
  const big = file.size > SINGLE_MAX && (props.kind === 'video' || props.kind === 'preview')
  const maxMb = props.maxMb ?? (props.kind === 'video' ? BIG_MAX / 1024 / 1024 : 95)
  if (file.size > maxMb * 1024 * 1024) {
    error.value = `Este archivo pesa ${Math.round(file.size / 1024 / 1024)} MB y el máximo es ${maxMb} MB. Comprímelo y vuelve a intentar.`
    return
  }
  const { data } = await sb.auth.getSession()
  const token = data.session?.access_token
  if (!token) {
    error.value = 'Tu sesión venció. Vuelve a entrar.'
    return
  }
  setBusy(true)
  progress.value = 0
  fileName.value = file.name
  emit('picked', file)
  if (big) {
    const url = await uploadBig(file, token)
    if (url) emit('update:modelValue', url)
    else fileName.value = ''
  } else {
    const r = await send(`/api/upload?kind=${props.kind}&name=${encodeURIComponent(file.name)}`, token, file, file.type || 'application/octet-stream', (loaded) => {
      progress.value = Math.round((loaded / file.size) * 100)
    })
    if (r.status === 200 && r.body.url) emit('update:modelValue', r.body.url)
    else {
      fileName.value = ''
      error.value = failMessage(r)
    }
  }
  setBusy(false)
}

function onPick(e: Event) {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0]
  el.value = ''
  if (f) uploadFile(f)
}
function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) uploadFile(f)
}

defineExpose({ uploadFile })
</script>

<template>
  <div class="up">
    <div class="fl" :id="`${inputId}-l`">{{ label }}</div>
    <div
      class="drop"
      :class="{ drag: dragging, done: !!modelValue && !busy }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <template v-if="busy">
        <div class="dt">Subiendo {{ fileName }}…</div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="progress" :aria-labelledby="`${inputId}-l`">
          <i :style="{ width: progress + '%' }" />
        </div>
        <div class="dh">{{ progress }}%. No cierres esta página.</div>
      </template>
      <template v-else-if="modelValue">
        <div class="dt">✓ {{ fileName || 'Archivo cargado' }}</div>
        <button type="button" class="abtn ghost sm" @click="input?.click()">Cambiar</button>
      </template>
      <template v-else>
        <div class="dt">Arrastra el archivo aquí</div>
        <div class="dh">o búscalo en tu computadora</div>
        <button type="button" class="abtn" @click="input?.click()">{{ button }}</button>
      </template>
      <input :id="inputId" ref="input" class="sr" type="file" :accept="accept" tabindex="-1" @change="onPick">
    </div>
    <p v-if="hint" class="fh">{{ hint }}</p>
    <p v-if="error" class="note err" role="alert" style="margin: 12px 0 0">{{ error }}</p>
    <details class="lnk">
      <summary>¿Prefieres pegar un link?</summary>
      <input
        class="field"
        type="url"
        inputmode="url"
        placeholder="https://…"
        :value="modelValue"
        :aria-label="`Link de ${label}`"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
    </details>
  </div>
</template>
