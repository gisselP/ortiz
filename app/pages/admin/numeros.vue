<script setup lang="ts">
import { site } from '~/composables/useSite'

useHead({ title: 'Números | Panel de Sofía Ortiz', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

type Item = { value: string; suffix: string; label: string; src: string; href: string }
const { isAdmin, ready, loading, saving, saved, error, start, save } = useSettingsPage<{ items: Item[] }>('numbers')

const items = ref<Item[]>([])
const blank = (): Item => ({ value: '', suffix: '', label: '', src: '', href: '' })

onMounted(async () => {
  const v = await start()
  items.value = v?.items?.length
    ? v.items.map((s) => ({ value: String(s.value ?? ''), suffix: s.suffix || '', label: s.label || '', src: s.src || '', href: s.href || '' }))
    : site.stats.map((s) => ({ value: String(s.value), suffix: s.suffix, label: s.label, src: '', href: '' }))
})

function move(i: number, d: number) {
  const j = i + d
  if (j < 0 || j >= items.value.length) return
  const a = items.value
  ;[a[i], a[j]] = [a[j]!, a[i]!]
}

async function submit() {
  for (const [i, s] of items.value.entries()) {
    if (s.value.trim() === '' && !s.label.trim()) continue
    if (s.value.trim() === '' || Number.isNaN(Number(s.value))) return void (error.value = `El número ${i + 1} debe ser solo cifras, por ejemplo 3.`)
    if (!s.label.trim()) return void (error.value = `Al número ${i + 1} le falta el texto de abajo, por ejemplo «Años de experiencia».`)
  }
  await save({
    items: items.value
      .filter((s) => s.value.trim() !== '' && s.label.trim())
      .map((s) => ({ value: Number(s.value), suffix: s.suffix.trim(), label: s.label.trim(), src: s.src.trim(), href: s.href.trim() }))
  })
}
</script>

<template>
  <p v-if="!ready || !isAdmin" class="adm" style="padding: 40px">Cargando…</p>
  <AdminShell v-else active="numeros">
    <h1>Números</h1>
    <p class="sub">Las cifras grandes de la franja verde, debajo del inicio.</p>
    <p v-if="loading" class="sub">Cargando…</p>
    <form v-else class="fm" style="max-width: 760px; margin-top: 32px" @submit.prevent="submit">
      <p class="note">Si no pones ninguno, esa franja no se muestra en tu web.</p>
      <fieldset v-for="(s, i) in items" :key="i" class="rep">
        <legend>Número {{ i + 1 }}</legend>
        <div class="two">
          <div class="fg">
            <label class="fl" :for="`v${i}`">Cifra</label>
            <input :id="`v${i}`" v-model="s.value" class="field" type="text" inputmode="numeric" placeholder="15">
          </div>
          <div class="fg">
            <label class="fl" :for="`s${i}`">Después de la cifra</label>
            <input :id="`s${i}`" v-model="s.suffix" class="field" type="text" placeholder="+  o  M+">
          </div>
        </div>
        <div class="fg">
          <label class="fl" :for="`l${i}`">Qué significa</label>
          <input :id="`l${i}`" v-model="s.label" class="field" type="text" placeholder="Clientes">
        </div>
        <div class="fg">
          <label class="fl" :for="`n${i}`">Nota chiquita (opcional)</label>
          <input :id="`n${i}`" v-model="s.src" class="field" type="text" placeholder="Ver algunos nombres">
          <p class="fh">Sale debajo del texto. Solo es un enlace si pones también la dirección.</p>
        </div>
        <div class="fg">
          <label class="fl" :for="`h${i}`">A dónde lleva la nota (opcional)</label>
          <input :id="`h${i}`" v-model="s.href" class="field" type="text" placeholder="#redes">
        </div>
        <div class="act">
          <button type="button" class="abtn ghost sm" :disabled="i === 0" @click="move(i, -1)">↑ Subir</button>
          <button type="button" class="abtn ghost sm" :disabled="i === items.length - 1" @click="move(i, 1)">↓ Bajar</button>
          <button type="button" class="abtn danger sm" @click="items.splice(i, 1)">Quitar</button>
        </div>
      </fieldset>
      <button v-if="items.length < 4" type="button" class="abtn ghost" style="margin-bottom: 32px" @click="items.push(blank())">+ Agregar número</button>
      <p v-if="error" class="note err" role="alert">{{ error }}</p>
      <p v-if="saved" class="note" role="status">Guardado. Ya se ve en tu web, puede tardar unos segundos.</p>
      <div><button class="abtn" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button></div>
    </form>
  </AdminShell>
</template>
