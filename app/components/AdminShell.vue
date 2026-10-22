<script setup lang="ts">
import '~/assets/css/admin.css'

defineProps<{ active?: 'videos' | 'numeros' | 'sobre-mi' | 'servicios' | 'contacto' }>()
const { signOut } = useAdmin()
const links = [
  { key: 'videos', to: '/admin', label: 'Videos' },
  { key: 'numeros', to: '/admin/numeros', label: 'Números' },
  { key: 'sobre-mi', to: '/admin/sobre-mi', label: 'Sobre mí' },
  { key: 'servicios', to: '/admin/servicios', label: 'Servicios' },
  { key: 'contacto', to: '/admin/contacto', label: 'Contacto' }
]
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
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            :class="{ on: active === l.key }"
            :aria-current="active === l.key ? 'page' : undefined"
          >{{ l.label }}</NuxtLink>
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
