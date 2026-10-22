<script setup lang="ts">
useHead({ title: 'Contacto | Panel de Sofía Ortiz', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { isAdmin, ready, loading, saving, saved, error, start, save } = useSettingsPage<Record<string, string>>('contact')
const f = reactive({ phone: '', email: '', instagram: '', tiktok: '', linkedin: '', behance: '', replyTime: '' })

onMounted(async () => {
  const v = await start()
  if (v) for (const k of Object.keys(f) as (keyof typeof f)[]) f[k] = v[k] || ''
})

async function submit() {
  const phone = f.phone.replace(/\D/g, '')
  if (phone && !(phone.length === 9 || (phone.length === 11 && phone.startsWith('51')))) {
    return void (error.value = 'El WhatsApp debe tener 9 cifras, por ejemplo 987654321.')
  }
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return void (error.value = 'El correo no parece válido.')
  await save(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])))
}
</script>

<template>
  <p v-if="!ready || !isAdmin" class="adm" style="padding: 40px">Cargando…</p>
  <AdminShell v-else active="contacto">
    <h1>Contacto</h1>
    <p class="sub">Cómo te escriben. El WhatsApp es el de los botones «Escríbeme».</p>
    <p v-if="loading" class="sub">Cargando…</p>
    <form v-else class="fm" style="max-width: 760px; margin-top: 32px" @submit.prevent="submit">
      <p class="note">Solo salen en tu web los que llenes. Los vacíos se esconden.</p>
      <div class="fg">
        <label class="fl" for="ph">WhatsApp</label>
        <input id="ph" v-model="f.phone" class="field" type="tel" inputmode="tel" placeholder="987654321">
        <p class="fh">Solo el número de Perú, sin el +51.</p>
      </div>
      <div class="fg">
        <label class="fl" for="em">Correo</label>
        <input id="em" v-model="f.email" class="field" type="email" placeholder="correo@dominio.com">
      </div>
      <div class="fg">
        <label class="fl" for="ig">Instagram</label>
        <input id="ig" v-model="f.instagram" class="field" type="text" placeholder="@usuario">
      </div>
      <div class="fg">
        <label class="fl" for="tt">TikTok</label>
        <input id="tt" v-model="f.tiktok" class="field" type="text" placeholder="@usuario">
      </div>
      <div class="fg">
        <label class="fl" for="li">LinkedIn</label>
        <input id="li" v-model="f.linkedin" class="field" type="text" placeholder="usuario o el link de tu perfil">
      </div>
      <div class="fg">
        <label class="fl" for="be">Behance</label>
        <input id="be" v-model="f.behance" class="field" type="text" placeholder="usuario o el link de tu perfil">
      </div>
      <div class="fg">
        <label class="fl" for="rt">En cuánto tiempo respondes</label>
        <input id="rt" v-model="f.replyTime" class="field" type="text" placeholder="menos de 24 horas">
        <p class="fh">Sale como «Respondo en …».</p>
      </div>
      <p v-if="error" class="note err" role="alert">{{ error }}</p>
      <p v-if="saved" class="note" role="status">Guardado. Ya se ve en tu web, puede tardar unos segundos.</p>
      <div><button class="abtn" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button></div>
    </form>
  </AdminShell>
</template>
