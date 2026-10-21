<script setup lang="ts">
const { best, redes, horizontal, contenido } = useWorks()

useSeoMeta({
  title: `${site.name} | ${site.role}`,
  description: site.description,
  ogTitle: `${site.name} | ${site.role}`,
  ogDescription: site.description,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// Números con conteo al llegar a la sección. Se renderizan completos y solo se animan en el navegador.
const shown = ref(site.stats.map((s) => s.value))
const statsEl = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
let timer: ReturnType<typeof setInterval> | undefined
let fallback: ReturnType<typeof setTimeout> | undefined

function run() {
  if (timer) return
  const start = Date.now()
  timer = setInterval(() => {
    const t = Math.min(1, (Date.now() - start) / 1600)
    const e = 1 - Math.pow(1 - t, 3)
    shown.value = site.stats.map((s) => (t >= 1 ? s.value : Math.round(s.value * e)))
    if (t >= 1) clearInterval(timer)
  }, 40)
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !statsEl.value || !('IntersectionObserver' in window)) return
  shown.value = site.stats.map(() => 0)
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        run()
        io?.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  io.observe(statsEl.value)
  fallback = setTimeout(run, 6000)
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearInterval(timer)
  clearTimeout(fallback)
})
</script>

<template>
  <div>
    <header class="top wrap">
      <div>
        <h1>{{ site.name }}</h1>
        <div class="role">{{ site.role }}</div>
      </div>
      <nav class="nav" aria-label="Secciones">
        <a href="#sobre-mi">Quién soy</a>
        <a href="#redes">TikTok / Reels / Shorts</a>
        <a href="#horizontales">Videos Horizontales</a>
        <a href="#contenido">Creación de Contenido</a>
        <a href="#contacto">Contacto</a>
      </nav>
    </header>

    <main>
      <section class="wrap" style="padding-top: 8px; padding-bottom: 88px" aria-label="Mejores videos">
        <div class="g4">
          <WorkCard v-for="w in best" :key="w.id" :work="w" />
          <a class="more" href="#contacto" aria-label="Más trabajos en Behance">
            <small>Behance</small>
            <strong>Más trabajos ↗</strong>
          </a>
        </div>
      </section>

      <section id="sobre-mi" class="sec wrap">
        <div class="label"><h2>Quién soy</h2></div>
        <div class="body about">
          <div class="photo">[Foto de Sofía]</div>
          <div class="txt">
            <p class="lead">{{ site.bio[0] }}</p>
            <p class="more-txt">{{ site.bio[1] }}</p>
            <div class="tools">
              <small>Herramientas</small>
              {{ site.tools }}
            </div>
          </div>
        </div>
      </section>

      <section id="redes" class="sec wrap">
        <div class="label">
          <h2>TikTok / Reels / Shorts</h2>
          <p>Videos para redes.</p>
        </div>
        <div class="body g4">
          <WorkCard v-for="w in redes" :key="w.id" :work="w" />
        </div>
      </section>

      <section id="horizontales" class="sec wrap">
        <div class="label">
          <h2>Videos Horizontales</h2>
          <p>Institucional y documental.</p>
        </div>
        <div class="body g2">
          <WorkCard v-for="w in horizontal" :key="w.id" :work="w" ratio="16/9" />
        </div>
      </section>

      <section id="contenido" class="sec wrap">
        <div class="label">
          <h2>Creación de Contenido</h2>
          <p>Gestión completa de redes, desde cero.</p>
        </div>
        <div class="body">
          <div v-for="w in contenido" :key="w.id" class="proj">
            <div class="thumb"><WorkCard :work="w" :caption="false" /></div>
            <div class="info">
              <h3>{{ w.client }}</h3>
              <p>Redes manejadas desde cero. Grabación, guiones, manejo de redes y edición. [Qué se logró, en una frase]</p>
              <div class="metrics">
                <div><b>[000]</b><span>Interacciones</span></div>
                <div><b>[000]</b><span>Crecimiento</span></div>
                <div><b>[000]</b><span>Tiempo</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" ref="statsEl" class="stats" aria-label="Números">
        <div v-for="(s, i) in site.stats" :key="s.label" class="stat">
          <b>{{ shown[i] }}<i>{{ s.suffix }}</i></b>
          <span>{{ s.label }}</span>
        </div>
      </section>

      <section id="contacto" class="sec wrap" style="border-top: 0; padding-top: 88px; padding-bottom: 0">
        <div class="label"><h2>Contacto</h2></div>
        <div class="body line">
          <a v-for="c in site.contacts" :key="c.label" href="#contacto">
            <small>{{ c.label }}</small>
            <span>{{ c.text }} ↗</span>
          </a>
        </div>
        <div class="foot" style="flex: 1 1 100%">
          <span>© [Año] {{ site.name }}</span>
          <span>{{ site.city }}</span>
        </div>
      </section>
    </main>

    <a class="fab" href="#contacto">Escríbeme</a>
  </div>
</template>
