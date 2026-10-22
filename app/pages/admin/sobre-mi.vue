<script setup lang="ts">
useHead({ title: 'Sobre mí | Panel de Sofía Ortiz', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { isAdmin, ready, loading, saving, saved, error, start, save } = useSettingsPage<Record<string, string>>('about')
const f = reactive({ availability: '', lead: '', bio: '', bioMore: '', tools: '', photo_url: '' })
const uploading = ref(false)

onMounted(async () => {
  const v = await start()
  if (v) for (const k of Object.keys(f) as (keyof typeof f)[]) f[k] = v[k] || ''
})

async function submit() {
  if (uploading.value) return void (error.value = 'Espera a que termine de subirse la foto.')
  if (f.photo_url.trim() && !/^https?:\/\/\S+$/i.test(f.photo_url.trim())) return void (error.value = 'El link de la foto no es válido. Debe empezar con https://')
  await save(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])))
}
</script>

<template>
  <p v-if="!ready || !isAdmin" class="adm" style="padding: 40px">Cargando…</p>
  <AdminShell v-else active="sobre-mi">
    <h1>Sobre mí</h1>
    <p class="sub">La presentación del inicio y la sección «Quién soy».</p>
    <p v-if="loading" class="sub">Cargando…</p>
    <form v-else class="fm" style="max-width: 760px; margin-top: 32px" @submit.prevent="submit">
      <p class="note">Lo que dejes vacío se queda con el texto de ejemplo en tu web.</p>

      <section class="fsec">
        <h2>Al abrir tu web</h2>
        <div class="fg">
          <label class="fl" for="av">Disponibilidad</label>
          <input id="av" v-model="f.availability" class="field" type="text" placeholder="Disponible para nuevos proyectos">
          <p class="fh">La etiqueta chiquita arriba de tu nombre.</p>
        </div>
        <div class="fg">
          <label class="fl" for="ld">Frase principal</label>
          <textarea id="ld" v-model="f.lead" class="field" placeholder="Qué haces y para quién, con tu voz." />
        </div>
      </section>

      <section class="fsec">
        <h2>Quién soy</h2>
        <div class="fg">
          <FileUpload
            v-model="f.photo_url"
            input-id="ph"
            kind="photo"
            label="Tu foto"
            button="Elegir foto"
            accept="image/jpeg,image/png,image/webp"
            hint="Mejor vertical, JPG, PNG o WebP."
            :max-mb="10"
            @busy="uploading = $event"
          />
          <img v-if="f.photo_url" :src="f.photo_url" alt="Vista previa de tu foto" class="phv">
        </div>
        <div class="fg">
          <label class="fl" for="bio">Frase de presentación</label>
          <textarea id="bio" v-model="f.bio" class="field" placeholder="Cómo te presentarías a un cliente en persona." />
        </div>
        <div class="fg">
          <label class="fl" for="bm">Un poco más de ti</label>
          <textarea id="bm" v-model="f.bioMore" class="field" />
        </div>
        <div class="fg">
          <label class="fl" for="tl">Herramientas</label>
          <input id="tl" v-model="f.tools" class="field" type="text" placeholder="Premiere, After Effects, Photoshop…">
        </div>
      </section>

      <p v-if="error" class="note err" role="alert">{{ error }}</p>
      <p v-if="saved" class="note" role="status">Guardado. Ya se ve en tu web, puede tardar unos segundos.</p>
      <div><button class="abtn" type="submit" :disabled="saving || uploading">{{ saving ? 'Guardando…' : 'Guardar' }}</button></div>
    </form>
  </AdminShell>
</template>
