<script setup lang="ts">
import '~/assets/css/admin.css'

defineProps<{ active?: 'videos' }>()
const { signOut } = useAdmin()
async function out() {
  await signOut()
  await navigateTo('/admin')
}
</script>

<template>
  <div class="adm">
    <aside class="adm-side">
      <div>
        <div class="adm-brand"><b>Sofía Ortiz</b><span>Panel de mi web</span></div>
        <nav class="adm-nav" aria-label="Secciones del panel">
          <NuxtLink to="/admin" :class="{ on: active === 'videos' }" :aria-current="active === 'videos' ? 'page' : undefined">Videos</NuxtLink>
          <button type="button" disabled>Números<small>pronto</small></button>
          <button type="button" disabled>Sobre mí<small>pronto</small></button>
          <button type="button" disabled>Contacto<small>pronto</small></button>
        </nav>
      </div>
      <div class="adm-nav">
        <NuxtLink to="/" target="_blank">Ver mi web ↗</NuxtLink>
        <button type="button" @click="out">Salir</button>
      </div>
    </aside>
    <main class="adm-main"><slot /></main>
  </div>
</template>
