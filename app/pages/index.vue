<script setup lang="ts">
const { reel, hero, redes, horizontal, contenido } = useWorks()

useSeoMeta({
  title: `${site.name} | Comunicadora audiovisual`,
  description: site.description,
  ogTitle: `${site.name} | Comunicadora audiovisual`,
  ogDescription: site.description,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

const showFab = ref(false)
const scrolled = ref(false)
const mobileNavOpen = ref(false)
const activeSection = ref('')

function onScroll() {
  showFab.value = window.scrollY > 520
  scrolled.value = window.scrollY > 10
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Las secciones de abajo aparecen suavemente al llegar. Lo que ya se ve al cargar no se esconde.
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight
  )
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      })
    },
    { threshold: 0.12 }
  )
  els.forEach((el) => { el.classList.add('rv'); io.observe(el) })
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 8000)
})

// Resaltar la sección activa en el nav al hacer scroll
onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  const io = new IntersectionObserver(
    (entries) => { entries.forEach((e) => { if (e.isIntersecting) activeSection.value = e.target.id }) },
    { rootMargin: '-20% 0px -60% 0px' }
  )
  document.querySelectorAll('section[id]').forEach((s) => io.observe(s))
})

function closeNav() { mobileNavOpen.value = false }
</script>

<template>
  <div>
    <div class="site-header" :class="{ scrolled, 'nav-open': mobileNavOpen }">
      <header class="topbar wrap">
        <span class="brand">{{ site.name }}</span>
        <nav class="nav" aria-label="Secciones">
          <a href="#redes" :class="{ active: activeSection === 'redes' }">Reels</a>
          <a href="#casos" :class="{ active: activeSection === 'casos' }">Contenido</a>
          <a href="#servicios" :class="{ active: activeSection === 'servicios' }">Qué hago</a>
          <a href="#sobre-mi" :class="{ active: activeSection === 'sobre-mi' }">Quién soy</a>
          <a href="#contacto" :class="{ active: activeSection === 'contacto' }">Contacto</a>
        </nav>
        <button class="burger" :class="{ open: mobileNavOpen }" :aria-expanded="mobileNavOpen" aria-label="Menú" @click="mobileNavOpen = !mobileNavOpen">
          <span /><span /><span />
        </button>
      </header>
      <div class="mob-nav wrap" :aria-hidden="!mobileNavOpen" :inert="!mobileNavOpen">
        <nav aria-label="Menú móvil">
          <a href="#redes" @click="closeNav">Reels</a>
          <a href="#casos" @click="closeNav">Contenido</a>
          <a href="#servicios" @click="closeNav">Qué hago</a>
          <a href="#sobre-mi" @click="closeNav">Quién soy</a>
          <a href="#contacto" @click="closeNav">Contacto</a>
          <a class="btn" style="margin-top:20px" :href="site.whatsapp" @click="closeNav"><Icon name="chat" />Escríbeme por WhatsApp</a>
        </nav>
      </div>
    </div>

    <main>
      <section class="hero wrap">
        <div class="hero-txt">
          <span class="avail"><i />{{ site.availability }}</span>
          <h1>{{ site.name }}</h1>
          <div class="role">{{ site.role }}</div>
          <p class="lead">{{ site.lead }}</p>
          <div class="cta">
            <a class="btn" :href="site.whatsapp"><Icon name="chat" />Escríbeme por WhatsApp</a>
            <NuxtLink class="btn ghost" to="/trabajo/reel">Ver mi reel</NuxtLink>
          </div>
        </div>
        <div class="stair">
          <WorkCard :work="reel" featured :caption="false" />
          <WorkCard v-for="w in hero" :key="w.id" :work="w" />
        </div>
        <div class="scroll-hint" aria-hidden="true">↓</div>
      </section>

      <section id="stats" class="stats" aria-label="Números">
        <div v-for="(s, i) in site.stats" :key="s.label" class="stat">
          <b :aria-label="`${s.value}${s.suffix}`"><Odometer :value="s.value" :delay="i * 250" /><i aria-hidden="true">{{ s.suffix }}</i></b>
          <span class="l">{{ s.label }}</span>
          <a class="src" :href="s.href">{{ s.src }}</a>
        </div>
      </section>

      <section id="redes" class="sec first wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="phone" /></span>
          <h2>TikTok / Reels / Shorts</h2>
          <p>Videos para redes.</p>
        </div>
        <div class="body">
          <div class="g4">
            <WorkCard v-for="w in redes" :key="w.id" :work="w" />
          </div>
          <div class="ver-mas">
            <NuxtLink class="btn ghost" to="/videos">Ver más videos</NuxtLink>
          </div>
        </div>
      </section>

      <section id="casos" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="trending" /></span>
          <h2>Creación de Contenido</h2>
          <p>Redes manejadas desde cero, con el resultado a la vista.</p>
        </div>
        <div class="body">
          <div v-for="w in contenido" :key="w.id" class="case">
            <div class="thumb"><WorkCard :work="w" :caption="false" /></div>
            <div class="main">
              <span class="cr">{{ w.rubro }}</span>
              <h3>{{ w.client }}</h3>
              <div class="step"><span class="ic sm"><Icon name="flag" :size="18" /></span><div><b>El problema</b><span class="t">{{ w.problem }}</span></div></div>
              <div class="step"><span class="ic sm"><Icon name="camera" :size="18" /></span><div><b>Lo que hice</b><span class="t">{{ w.did }}</span></div></div>
              <div class="step"><span class="ic sm"><Icon name="trending" :size="18" /></span><div><b>El resultado</b><span class="t">{{ w.result }}</span></div></div>
              <div class="mets">
                <div v-for="m in w.metrics" :key="m.label"><b>{{ m.value }}</b><span>{{ m.label }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="scissors" /></span>
          <h2>Qué hago</h2>
          <p>Para que sepas qué pedirme y cuánto tarda.</p>
        </div>
        <div class="body">
          <div v-for="s in site.services" :key="s.name" class="svc">
            <span class="n">{{ s.name }}</span>
            <span class="d">{{ s.text }}</span>
            <span class="p">{{ s.eta }}</span>
          </div>
        </div>
      </section>

      <section id="proceso" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="flag" /></span>
          <h2>Cómo trabajamos</h2>
          <p>Tres pasos, sin sorpresas.</p>
        </div>
        <div class="body g3">
          <div v-for="p in site.steps" :key="p.n" class="pstep">
            <span class="num">{{ p.n }}</span>
            <h3>{{ p.title }}</h3>
            <p>{{ p.text }}</p>
          </div>
        </div>
      </section>

      <section id="sobre-mi" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="user" /></span>
          <h2>Quién soy</h2>
        </div>
        <div class="body about">
          <div class="photo">[Foto de Sofía]</div>
          <div class="txt">
            <p class="lead2">{{ site.bio }}</p>
            <p class="more-txt">{{ site.bioMore }}</p>
            <div class="tools">
              <small>Herramientas</small>
              {{ site.tools }}
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" class="sec wrap" data-reveal style="padding-bottom: 0">
        <div class="label">
          <span class="ic"><Icon name="chat" /></span>
          <h2>Contacto</h2>
          <p>Respondo en [tiempo, por ejemplo menos de 24 horas].</p>
        </div>
        <div class="body">
          <div class="line">
            <a v-for="c in site.contacts" :key="c.label" :href="c.href">
              <span class="ic"><Icon :name="c.icon" /></span>
              <span class="tx">
                <small>{{ c.label }}</small>
                <span class="val">{{ c.text }}</span>
              </span>
              <Icon name="arrow" :size="20" />
            </a>
          </div>
        </div>
        <div class="foot" style="flex: 1 1 100%">
          <span>© {{ new Date().getFullYear() }} {{ site.name }}</span>
          <span>{{ site.city }}</span>
        </div>
      </section>
    </main>

    <a class="fab" :class="{ show: showFab }" :href="site.whatsapp"><Icon name="chat" :size="20" />Escríbeme</a>
  </div>
</template>
