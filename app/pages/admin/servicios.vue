<script setup lang="ts">
import { site } from '~/composables/useSite'

useHead({ title: 'Servicios | Panel de Sofía Ortiz', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

type Svc = { name: string; text: string; eta: string }
type Step = { title: string; text: string }
const { isAdmin, ready, loading, saving, saved, error, start, save } = useSettingsPage<{ services: Svc[]; steps: Step[] }>('services')

const services = ref<Svc[]>([])
const steps = ref<Step[]>([])

onMounted(async () => {
  const v = await start()
  services.value = Array.isArray(v?.services) ? v!.services.map((s) => ({ name: s.name || '', text: s.text || '', eta: s.eta || '' })) : site.services.map((s) => ({ name: s.name, text: '', eta: '' }))
  steps.value = Array.isArray(v?.steps) ? v!.steps.map((s) => ({ title: s.title || '', text: s.text || '' })) : site.steps.map((s) => ({ title: s.title, text: '' }))
})

function move<T>(a: T[], i: number, d: number) {
  const j = i + d
  if (j < 0 || j >= a.length) return
  ;[a[i], a[j]] = [a[j]!, a[i]!]
}

async function submit() {
  await save({
    services: services.value.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), text: s.text.trim(), eta: s.eta.trim() })),
    steps: steps.value.filter((s) => s.title.trim()).map((s) => ({ title: s.title.trim(), text: s.text.trim() }))
  })
}
</script>

<template>
  <p v-if="!ready || !isAdmin" class="adm" style="padding: 40px">Cargando…</p>
  <AdminShell v-else active="servicios">
    <h1>Servicios</h1>
    <p class="sub">Las secciones «Qué hago» y «Cómo trabajamos».</p>
    <p v-if="loading" class="sub">Cargando…</p>
    <form v-else class="fm" style="max-width: 760px; margin-top: 32px" @submit.prevent="submit">
      <section class="fsec">
        <h2>Qué hago</h2>
        <fieldset v-for="(s, i) in services" :key="`s${i}`" class="rep">
          <legend>Servicio {{ i + 1 }}</legend>
          <div class="fg">
            <label class="fl" :for="`sn${i}`">Nombre</label>
            <input :id="`sn${i}`" v-model="s.name" class="field" type="text" placeholder="Edición de video">
          </div>
          <div class="fg">
            <label class="fl" :for="`st${i}`">Qué incluye, en una línea</label>
            <input :id="`st${i}`" v-model="s.text" class="field" type="text">
          </div>
          <div class="fg">
            <label class="fl" :for="`se${i}`">Cuánto tarda</label>
            <input :id="`se${i}`" v-model="s.eta" class="field" type="text" placeholder="Entrega en 3 días">
          </div>
          <div class="act">
            <button type="button" class="abtn ghost sm" :disabled="i === 0" @click="move(services, i, -1)">↑ Subir</button>
            <button type="button" class="abtn ghost sm" :disabled="i === services.length - 1" @click="move(services, i, 1)">↓ Bajar</button>
            <button type="button" class="abtn danger sm" @click="services.splice(i, 1)">Quitar</button>
          </div>
        </fieldset>
        <button type="button" class="abtn ghost" @click="services.push({ name: '', text: '', eta: '' })">+ Agregar servicio</button>
      </section>

      <section class="fsec">
        <h2>Cómo trabajamos</h2>
        <fieldset v-for="(s, i) in steps" :key="`p${i}`" class="rep">
          <legend>Paso {{ i + 1 }}</legend>
          <div class="fg">
            <label class="fl" :for="`pt${i}`">Título</label>
            <input :id="`pt${i}`" v-model="s.title" class="field" type="text" placeholder="Me escribes">
          </div>
          <div class="fg">
            <label class="fl" :for="`px${i}`">Explicación corta</label>
            <input :id="`px${i}`" v-model="s.text" class="field" type="text">
          </div>
          <div class="act">
            <button type="button" class="abtn ghost sm" :disabled="i === 0" @click="move(steps, i, -1)">↑ Subir</button>
            <button type="button" class="abtn ghost sm" :disabled="i === steps.length - 1" @click="move(steps, i, 1)">↓ Bajar</button>
            <button type="button" class="abtn danger sm" @click="steps.splice(i, 1)">Quitar</button>
          </div>
        </fieldset>
        <button v-if="steps.length < 4" type="button" class="abtn ghost" @click="steps.push({ title: '', text: '' })">+ Agregar paso</button>
      </section>

      <p v-if="error" class="note err" role="alert">{{ error }}</p>
      <p v-if="saved" class="note" role="status">Guardado. Ya se ve en tu web, puede tardar unos segundos.</p>
      <div><button class="abtn" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button></div>
    </form>
  </AdminShell>
</template>
