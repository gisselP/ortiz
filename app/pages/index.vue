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

// Las secciones de abajo aparecen suavemente al llegar. Lo que ya se ve al cargar no se esconde.
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight
  )
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  els.forEach((el) => {
    el.classList.add('rv')
    io.observe(el)
  })
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 8000)
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
            <Icon class="ar" name="arrow" :size="28" />
            <strong>Más trabajos</strong>
          </a>
        </div>
      </section>

      <div class="marquee" aria-hidden="true">
        <div class="track">
          <span v-for="n in 2" :key="n" class="set">
            <span v-for="r in site.rubros" :key="r + n"><i /> {{ r }}</span>
          </span>
        </div>
      </div>

      <section id="sobre-mi" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="user" /></span>
          <h2>Quién soy</h2>
        </div>
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

      <section id="redes" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="phone" /></span>
          <h2>TikTok / Reels / Shorts</h2>
          <p>Videos para redes.</p>
        </div>
        <div class="body g4">
          <WorkCard v-for="w in redes" :key="w.id" :work="w" />
        </div>
      </section>

      <section id="horizontales" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="monitor" /></span>
          <h2>Videos Horizontales</h2>
          <p>Institucional y documental.</p>
        </div>
        <div class="body g2">
          <WorkCard v-for="w in horizontal" :key="w.id" :work="w" ratio="16/9" />
        </div>
      </section>

      <section id="contenido" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="trending" /></span>
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
                <div class="m"><span class="ic"><Icon name="heart" :size="18" /></span><b>[000]</b><span>Interacciones</span></div>
                <div class="m"><span class="ic"><Icon name="trending" :size="18" /></span><b>[000]</b><span>Crecimiento</span></div>
                <div class="m"><span class="ic"><Icon name="clock" :size="18" /></span><b>[000]</b><span>Tiempo</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" class="stats" aria-label="Números">
        <div v-for="(s, i) in site.stats" :key="s.label" class="stat">
          <b :aria-label="`${s.value}${s.suffix}`"><Odometer :value="s.value" :delay="i * 250" /><i aria-hidden="true">{{ s.suffix }}</i></b>
          <span>{{ s.label }}</span>
        </div>
      </section>

      <section id="contacto" class="sec wrap" data-reveal style="border-top: 0; padding-top: 88px; padding-bottom: 0">
        <div class="label">
          <span class="ic"><Icon name="chat" /></span>
          <h2>Contacto</h2>
        </div>
        <div class="body line">
          <a v-for="c in site.contacts" :key="c.label" href="#contacto">
            <span class="ic"><Icon :name="c.icon" /></span>
            <span class="tx">
              <small>{{ c.label }}</small>
              <span class="val">{{ c.text }}</span>
            </span>
            <Icon name="arrow" :size="20" />
          </a>
        </div>
        <div class="foot" style="flex: 1 1 100%">
          <span>© [Año] {{ site.name }}</span>
          <span>{{ site.city }}</span>
        </div>
      </section>
    </main>

    <a class="fab" href="#contacto"><Icon name="chat" :size="20" />Escríbeme</a>
  </div>
</template>
