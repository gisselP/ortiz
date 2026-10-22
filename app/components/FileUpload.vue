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

async function uploadFile(file: File) {
  error.value = ''
  const limit = (props.maxMb ?? 95) * 1024 * 1024
  if (file.size > limit) {
    error.value = `Este archivo pesa ${Math.round(file.size / 1024 / 1024)} MB y el máximo es ${props.maxMb ?? 95} MB. Comprímelo y vuelve a intentar.`
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
  await new Promise<void>((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/upload?kind=${props.kind}&name=${encodeURIComponent(file.name)}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) progress.value = Math.round((e.loaded / e.total) * 100)
    }
    xhr.onerror = () => {
      error.value = 'Se cortó la conexión. Intenta otra vez.'
      fileName.value = ''
      resolve()
    }
    xhr.onload = () => {
      let body: { url?: string; error?: string } = {}
      try { body = JSON.parse(xhr.responseText) } catch { /* respuesta que no es JSON */ }
      if (xhr.status === 200 && body.url) {
        emit('update:modelValue', body.url)
      } else {
        fileName.value = ''
        error.value =
          xhr.status === 404 || xhr.status === 405
            ? 'La subida solo funciona en la web publicada, no en tu computadora. Aquí puedes pegar un link.'
            : body.error || 'No pude subir el archivo. Intenta otra vez.'
      }
      resolve()
    }
    xhr.send(file)
  })
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
