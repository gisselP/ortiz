<script setup lang="ts">
import '~/assets/css/admin.css'
import type { DbWork } from '~/composables/useSite'

useHead({ title: 'Panel | Sofía Ortiz', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { sb, user, isAdmin, ready, load, signIn, signOut } = useAdmin()

const sections = [
  { key: 'reel', label: 'Mi reel' },
  { key: 'best', label: 'Mejores videos' },
  { key: 'redes', label: 'TikTok / Reels / Shorts' },
  { key: 'horizontal', label: 'Videos Horizontales' },
  { key: 'contenido', label: 'Creación de Contenido' }
] as const

// ---- login ----
const email = ref('')
const password = ref('')
const loginError = ref('')
const loggingIn = ref(false)

async function submitLogin() {
  loginError.value = ''
  loggingIn.value = true
  try {
    await signIn(email.value.trim(), password.value)
    if (isAdmin.value) await fetchWorks()
  } catch {
    loginError.value = 'El correo o la contraseña no coinciden. Revisa y prueba de nuevo.'
  } finally {
    loggingIn.value = false
  }
}

// ---- lista ----
const works = ref<DbWork[]>([])
const tab = ref<(typeof sections)[number]['key']>('best')
const listError = ref('')
const busy = ref(false)
const confirmId = ref<string | null>(null)

const current = computed(() => works.value.filter((w) => w.section === tab.value).sort((a, b) => a.position - b.position))
const counts = computed(() => Object.fromEntries(sections.map((s) => [s.key, works.value.filter((w) => w.section === s.key).length])))

async function fetchWorks() {
  listError.value = ''
  const { data, error } = await sb.from('works').select('*').order('position').order('created_at')
  if (error) {
    listError.value = 'No pude cargar tus videos. Recarga la página.'
    return
  }
  works.value = data as DbWork[]
  // abre la primera pestaña que tenga videos
  if (!counts.value[tab.value]) {
    const first = sections.find((s) => counts.value[s.key])
    if (first) tab.value = first.key
  }
}

async function move(i: number, dir: -1 | 1) {
  const list = [...current.value]
  const j = i + dir
  if (j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j]!, list[i]!]
  busy.value = true
  listError.value = ''
  const results = await Promise.all(list.map((w, k) => sb.from('works').update({ position: k }).eq('id', w.id)))
  if (results.some((r) => r.error)) listError.value = 'No pude guardar el nuevo orden. Intenta otra vez.'
  await fetchWorks()
  busy.value = false
}

async function toggle(w: DbWork) {
  busy.value = true
  const { error } = await sb.from('works').update({ published: !w.published }).eq('id', w.id)
  if (error) listError.value = 'No pude cambiar eso. Intenta otra vez.'
  await fetchWorks()
  busy.value = false
}

async function remove(w: DbWork) {
  if (confirmId.value !== w.id) {
    confirmId.value = w.id
    return
  }
  busy.value = true
  const { error } = await sb.from('works').delete().eq('id', w.id)
  if (error) listError.value = 'No pude quitar el video. Intenta otra vez.'
  confirmId.value = null
  await fetchWorks()
  busy.value = false
}

async function leave() {
  await signOut()
  works.value = []
}

onMounted(async () => {
  await load()
  if (isAdmin.value) await fetchWorks()
})
</script>

<template>
  <div>
    <p v-if="!ready" class="adm" style="padding: 40px">Cargando…</p>

    <!-- sin sesión -->
    <div v-else-if="!user" class="adm">
      <div class="login">
        <form @submit.prevent="submitLogin">
          <h1>Entrar</h1>
          <div class="fg">
            <label class="fl" for="correo">Correo</label>
            <input id="correo" v-model="email" class="field" type="email" autocomplete="username" placeholder="tucorreo@ejemplo.com" required>
          </div>
          <div class="fg">
            <label class="fl" for="clave">Contraseña</label>
            <input id="clave" v-model="password" class="field" type="password" autocomplete="current-password" placeholder="Tu contraseña" required>
          </div>
          <p v-if="loginError" class="note err" role="alert">{{ loginError }}</p>
          <button class="abtn" style="width: 100%" type="submit" :disabled="loggingIn">{{ loggingIn ? 'Entrando…' : 'Entrar' }}</button>
          <p class="fh" style="margin-top: 24px">Panel privado.</p>
        </form>
      </div>
      <div class="login-side"><b>Sofía Ortiz</b><span>Panel de mi web</span></div>
    </div>

    <!-- con sesión pero sin permiso -->
    <div v-else-if="!isAdmin" class="adm">
      <div class="login">
        <div style="max-width: 420px">
          <h1 style="font-size: 36px; margin-bottom: 16px">Sin permiso</h1>
          <p>Esta cuenta no tiene acceso al panel. Entra con la cuenta de Sofía.</p>
          <button class="abtn ghost" type="button" @click="leave">Salir</button>
        </div>
      </div>
    </div>

    <!-- panel -->
    <AdminShell v-else active="videos">
      <div class="adm-head">
        <div>
          <h1>Mis videos</h1>
          <p class="sub">Lo que cambies aquí se ve en tu web.</p>
        </div>
        <NuxtLink class="abtn" :to="`/admin/video?seccion=${tab}`">+ Agregar video</NuxtLink>
      </div>

      <nav class="tabs" aria-label="Tipo de video">
        <button v-for="s in sections" :key="s.key" type="button" :class="{ on: tab === s.key }" :aria-current="tab === s.key ? 'page' : undefined" @click="tab = s.key">
          {{ s.label }}<small>{{ counts[s.key] }}</small>
        </button>
      </nav>

      <p class="note">El número 1 es el primero que sale en tu web. Usa Subir y Bajar para cambiar el orden. Si ocultas un video, deja de verse pero no se borra.</p>
      <p v-if="listError" class="note err" role="alert">{{ listError }}</p>

      <div v-if="current.length" class="lst">
        <div v-for="(w, i) in current" :key="w.id" class="rw" :class="{ off: !w.published }">
          <div class="n">{{ i + 1 }}</div>
          <div class="th" :class="{ h: w.section === 'horizontal' }" aria-hidden="true">
            <img v-if="w.poster_url" :src="w.poster_url" alt="" loading="lazy">
            <video v-else-if="w.preview_url || w.video_url" :src="w.preview_url || w.video_url || ''" muted playsinline preload="metadata" />
          </div>
          <div class="inf">
            <b>{{ w.client }}</b>
            <span>{{ w.rubro }} · {{ w.published ? 'Visible en tu web' : 'Oculto' }}</span>
          </div>
          <div class="act">
            <button type="button" class="abtn ghost sm" :disabled="busy || i === 0" @click="move(i, -1)">↑ Subir</button>
            <button type="button" class="abtn ghost sm" :disabled="busy || i === current.length - 1" @click="move(i, 1)">↓ Bajar</button>
            <button type="button" class="abtn ghost sm" :disabled="busy" @click="toggle(w)">{{ w.published ? 'Ocultar' : 'Mostrar' }}</button>
            <NuxtLink class="abtn ghost sm" :to="`/admin/video?id=${w.id}`">Editar</NuxtLink>
            <button type="button" class="abtn danger sm" :disabled="busy" @click="remove(w)">{{ confirmId === w.id ? 'Sí, quitar' : 'Quitar' }}</button>
            <button v-if="confirmId === w.id" type="button" class="abtn ghost sm" @click="confirmId = null">Cancelar</button>
          </div>
        </div>
      </div>
      <p v-else class="empty">Aún no hay videos en esta sección. Usa «Agregar video» para subir el primero.</p>
    </AdminShell>
  </div>
</template>
