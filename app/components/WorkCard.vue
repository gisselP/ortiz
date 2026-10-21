<script setup lang="ts">
import type { Work } from '~/composables/useSite'

const props = defineProps<{ work: Work; ratio?: string; caption?: boolean }>()

const video = ref<HTMLVideoElement | null>(null)
const root = ref<any>(null)
const progress = ref(0)
const reduce = ref(false)
const touch = ref(false)
let io: IntersectionObserver | null = null

function play() {
  const v = video.value
  if (!v || reduce.value) return
  v.preload = 'auto'
  v.play().catch(() => {})
}
function stop() {
  const v = video.value
  if (!v) return
  v.pause()
  try { v.currentTime = 0 } catch {}
  progress.value = 0
}
function onTime() {
  const v = video.value
  if (v && v.duration) progress.value = (v.currentTime / v.duration) * 100
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
onBeforeUnmount(() => io?.disconnect())
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
        preload="none"
        :poster="work.poster"
        :src="work.preview"
        @timeupdate="onTime"
      />
      <span class="play">▶ Reproducir</span>
      <span class="bar" aria-hidden="true" :style="{ width: progress + '%' }" />
    </span>
    <span v-if="caption !== false" class="cap">
      <span class="cn">{{ work.client }}</span>
      <span class="cr">{{ work.rubro }}</span>
    </span>
  </NuxtLink>
</template>
