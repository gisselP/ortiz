<script setup lang="ts">
// Íconos de línea, mismo trazo en todo el sitio. Decorativos: el texto de al lado dice lo mismo.
const props = defineProps<{ name: string; size?: number }>()

const paths: Record<string, string> = {
  play: 'M8 5v14l11-7z',
  user: 'M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  trending: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  pen: 'M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4zM14 7l3 3',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.5 7.5L20 18M8.5 16.5L20 6',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  briefcase: 'M3 8h18v12H3zM9 8V5h6v3M3 13h18',
  image: 'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  arrow: 'M7 17L17 7M8 7h9v9',
  mail: 'M3 5h18v14H3zM3 7l9 7 9-7',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  check: 'M5 12l5 5 9-10'
}
const d = computed(() => paths[props.name] || '')
</script>

<template>
  <svg
    class="icon"
    :width="size || 22"
    :height="size || 22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d" :fill="name === 'play' ? 'currentColor' : 'none'" />
  </svg>
</template>
