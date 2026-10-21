<script setup lang="ts">
// Números que giran como un cuentakilómetros. Se renderiza el valor final y solo se anima en el navegador.
const props = defineProps<{ value: number; delay?: number }>()

const digits = computed(() => String(props.value).split('').map(Number))
const rows = Array.from({ length: 30 }, (_, i) => i % 10)

const root = ref<HTMLElement | null>(null)
const armed = ref(false)
const go = ref(false)
let io: IntersectionObserver | null = null
let fallback: ReturnType<typeof setTimeout> | undefined

function start() {
  if (go.value) return
  go.value = true
  io?.disconnect()
  clearTimeout(fallback)
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !root.value || !('IntersectionObserver' in window)) return
  armed.value = true
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) start()
    },
    { threshold: 0.4 }
  )
  io.observe(root.value)
  fallback = setTimeout(start, 6000)
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearTimeout(fallback)
})

// vuelta completa y media antes de frenar en el dígito final
const offset = (d: number) => (armed.value && !go.value ? 0 : -(20 + d))
</script>

<template>
  <span ref="root" class="odo" :class="{ go }" aria-hidden="true">
    <span v-for="(d, i) in digits" :key="i" class="col">
      <span
        class="strip"
        :style="{ transform: `translateY(${offset(d)}em)`, '--d': `${(delay || 0) + i * 140}ms` }"
      >
        <span v-for="(r, j) in rows" :key="j">{{ r }}</span>
      </span>
    </span>
  </span>
</template>
