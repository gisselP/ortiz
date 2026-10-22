<script setup lang="ts">
const { redes } = useWorks()

useSeoMeta({
  title: `Videos para redes | ${site.name}`,
  description: `Todos los videos de TikTok, Reels y Shorts de ${site.name}, ${site.role.toLowerCase()}.`,
})
</script>

<template>
  <div>
    <div class="vp" style="background: var(--bg); color: var(--fg)">
      <div class="wrap">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; padding: 24px 0 40px">
          <NuxtLink to="/" style="font-size:15px; color:var(--muted); display:inline-flex; align-items:center; gap:6px">
            ← Volver
          </NuxtLink>
          <span class="brand">{{ site.name }}</span>
        </div>
        <h1 style="font-family:var(--display); font-weight:700; font-size:clamp(32px,4vw,56px); letter-spacing:-.03em; margin:0 0 8px">
          TikTok / Reels / Shorts
        </h1>
        <p style="color:var(--muted); margin:0 0 48px">{{ redes.length }} videos</p>
        <p v-if="!redes.length" style="color:var(--muted)">Aún no hay videos.</p>
        <div class="g4">
          <WorkCard v-for="w in redes" :key="w.id" :work="w" />
        </div>
      </div>
    </div>
  </div>
</template>
