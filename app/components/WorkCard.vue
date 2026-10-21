<script setup lang="ts">
import type { Work } from '~/composables/useSite'

const props = defineProps<{ work: Work; ratio?: string; caption?: boolean }>()

const video = ref<HTMLVideoElement | null>(null)
const root = ref<any>(null)
const progress = ref(0)
const reduce = ref(false)
const touch = ref(false)
let io: IntersectionObserver | null = null
let raf = 0
// el corte de hover dura 12 s, pero con 6 s alcanza para entender el video y la barra se siente más ágil
const PREVIEW = 6

function play() {
  const v = video.value
  if (!v || reduce.value) return
  v.preload = 'auto'
  v.play().catch(() => {})
  cancelAnimationFrame(raf)
  tick()
}
// la barra se dibuja cuadro a cuadro, así avanza fluida y no a saltos como el evento timeupdate
function tick() {
  const v = video.value
  if (!v) return
  if (v.currentTime >= PREVIEW) v.currentTime = 0
  progress.value = Math.min(100, (v.currentTime / PREVIEW) * 100)
  raf = requestAnimationFrame(tick)
}
function stop() {
  const v = video.value
  if (!v) return
  cancelAnimationFrame(raf)
  v.pause()
  try { v.currentTime = 0 } catch {}
  progress.value = 0
}

onMounted(() => {
  reduce.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  touch.value = window.matchMedia('(hover: none)').matches
  const el = ((root.value as any)?.$el ?? root.value) as HTMLElement | null
  if (touch.value && 'IntersectionObserver' in window && el) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting && e.intersectionRatio >= 0.7 ? play() : stop()))
      },
      { threshold: [0, 0.7] }
    )
    io.observe(el)
  }
})
onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <NuxtLink
    ref="root"
    class="card"
    :to="`/trabajo/${work.id}`"
    :aria-label="`Ver video de ${work.client}, ${work.rubro}`"
    @pointerenter="!touch && play()"
    @pointerleave="!touch && stop()"
    @focus="!touch && play()"
    @blur="!touch && stop()"
  >
    <span class="tile" :style="{ aspectRatio: ratio || '9/16', background: work.tone }">
      <video
        ref="video"
        muted
        loop
        playsinline
        preload="metadata"
        :poster="work.poster"
        :src="work.preview"
      />
      <span class="play"><Icon name="play" :size="14" />Reproducir</span>
      <span class="bar" aria-hidden="true" :style="{ width: progress + '%' }" />
    </span>
    <span v-if="caption !== false" class="cap">
      <span class="cn">{{ work.client }}</span>
      <span class="cr">{{ work.rubro }}</span>
    </span>
  </NuxtLink>
</template>
