<script setup lang="ts">
const route = useRoute()
const { all, refresh } = useWorks()

const idx = computed(() => all.value.findIndex((w) => w.id === route.params.id))
const work = computed(() => all.value[idx.value])
// un video recién subido puede no estar en la lista con la que salió el sitio; se pide una vez antes de dar error
if (!work.value && import.meta.client) await refresh()
if (!work.value) {
  throw createError({ statusCode: 404, statusMessage: 'No encontré ese video', fatal: true })
}
const more = computed(() => all.value.filter((w) => w.id !== work.value!.id && w.section !== 'horizontal').slice(0, 6))
const prev = computed(() => all.value[(idx.value - 1 + all.value.length) % all.value.length]!)
const next = computed(() => all.value[(idx.value + 1) % all.value.length]!)

useSeoMeta({
  title: `${work.value!.client} | ${site.name}`,
  description: `Video de ${work.value!.client}, ${work.value!.rubro}. ${site.name}, ${site.role.toLowerCase()}.`,
  ogTitle: `${work.value!.client} | ${site.name}`,
  ogType: 'video.other'
})

const video = ref<HTMLVideoElement | null>(null)
const paused = ref(false)
const muted = ref(false)
const progress = ref(0)

function toggle() {
  const v = video.value
  if (!v) return
  if (v.paused) v.play().catch(() => {})
  else v.pause()
}
function toggleMute() {
  const v = video.value
  if (!v) return
  v.muted = !v.muted
  muted.value = v.muted
}
function onTime() {
  const v = video.value
  if (v && v.duration) progress.value = v.currentTime / v.duration
}
function seek(e: Event) {
  const v = video.value
  if (v && v.duration) v.currentTime = v.duration * (Number((e.target as HTMLInputElement).value) / 1000)
}

onMounted(() => {
  const v = video.value
  if (!v) return
  v.muted = false
  v.play().catch(() => {
    // el navegador no deja iniciar con sonido sin un toque previo
    v.muted = true
    muted.value = true
    v.play().catch(() => {})
  })
})
</script>

<template>
  <div v-if="work" class="vp wrap">
    <div class="vtop">
      <NuxtLink class="brand" to="/">{{ site.name }}</NuxtLink>
      <NuxtLink class="btn ghost sm" to="/">Cerrar ✕</NuxtLink>
    </div>

    <div class="row">
      <div class="player">
        <div class="pv" :class="{ paused }">
          <video
            ref="video"
            :src="work.full"
            :poster="work.poster"
            playsinline
            loop
            preload="auto"
            @play="paused = false"
            @pause="paused = true"
            @timeupdate="onTime"
          />
          <button type="button" class="tap" aria-label="Pausar o reproducir" @click="toggle">
            <span class="ico" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
          <button
            type="button"
            class="snd"
            :class="{ muted }"
            :aria-label="muted ? 'Activar sonido' : 'Silenciar'"
            @click="toggleMute"
          >
            <svg class="on" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
            <svg class="off" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
          </button>
          <div class="scrub">
            <div class="t"><i :style="{ width: progress * 100 + '%' }" /></div>
            <input type="range" min="0" max="1000" :value="Math.round(progress * 1000)" aria-label="Avance del video" @input="seek" />
          </div>
        </div>
        <p class="hint">Toca el video para pausar. Arrastra la barra de abajo para avanzar.</p>
      </div>

      <div class="vinfo">
        <span class="chip">{{ work.rubro }}</span>
        <h1>{{ work.client }}</h1>

        <div v-if="work.problem" class="blk"><span class="i"><Icon name="flag" /></span><div><b>El problema</b><span class="t">{{ work.problem }}</span></div></div>
        <div v-if="work.did" class="blk"><span class="i"><Icon name="camera" /></span><div><b>Lo que hice</b><span class="t">{{ work.did }}</span></div></div>
        <div v-if="work.result" class="blk"><span class="i"><Icon name="trending" /></span><div><b>El resultado</b><span class="t">{{ work.result }}</span></div></div>

        <div v-if="work.metrics" class="vmets">
          <div v-for="m in work.metrics" :key="m.label" class="met"><b>{{ m.value }}</b><span>{{ m.label }}</span></div>
        </div>

        <NuxtLink class="btn" to="/#contacto"><Icon name="chat" />Escríbeme para algo así</NuxtLink>

        <div class="pn">
          <NuxtLink class="btn ghost sm" :to="`/trabajo/${prev.id}`">← Anterior</NuxtLink>
          <NuxtLink class="btn ghost sm" :to="`/trabajo/${next.id}`">Siguiente →</NuxtLink>
        </div>
      </div>
    </div>

    <div class="morew">
      <div class="mlabel">Más trabajos</div>
      <div class="mgrid">
        <NuxtLink v-for="m in more" :key="m.id" class="mitem" :to="`/trabajo/${m.id}`" :aria-label="`Ver ${m.client}, ${m.rubro}`">
          <span :style="{ background: m.tone }">{{ m.rubro }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
