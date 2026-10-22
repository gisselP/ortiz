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
function onScroll() { showFab.value = window.scrollY > 520 }
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
    <header class="topbar wrap">
      <span class="brand">{{ site.name }}</span>
      <nav class="nav" aria-label="Secciones">
        <a v-if="redes.length" href="#redes">TikTok / Reels / Shorts</a>
        <a v-if="contenido.length" href="#casos">Creación de Contenido</a>
        <a href="#servicios">Qué hago</a>
        <a v-if="horizontal.length" href="#horizontales">Videos Horizontales</a>
        <a href="#contacto">Contacto</a>
      </nav>
      <a class="btn sm" :href="site.whatsapp"><Icon name="chat" :size="18" />Escríbeme</a>
    </header>

    <main>
      <section class="hero wrap">
        <div class="hero-txt">
          <span class="avail"><i />{{ site.availability }}</span>
          <h1>{{ site.name }}</h1>
          <div class="role">{{ site.role }}</div>
          <p class="lead">{{ site.lead }}</p>
          <div class="cta">
            <a class="btn" :href="site.whatsapp"><Icon name="chat" />Escríbeme por WhatsApp</a>
            <NuxtLink v-if="reel" class="btn ghost" :to="`/trabajo/${reel.id}`">Ver mi reel</NuxtLink>
          </div>
        </div>
        <div class="stair">
          <WorkCard v-if="reel" :work="reel" featured :caption="false" />
          <WorkCard v-for="w in hero" :key="w.id" :work="w" />
        </div>
      </section>

      <section id="stats" class="stats" aria-label="Números">
        <div v-for="(s, i) in site.stats" :key="s.label" class="stat">
          <b :aria-label="`${s.value}${s.suffix}`"><Odometer :value="s.value" :delay="i * 250" /><i aria-hidden="true">{{ s.suffix }}</i></b>
          <span class="l">{{ s.label }}</span>
          <a class="src" :href="s.href">{{ s.src }}</a>
        </div>
      </section>

      <section v-if="redes.length" id="redes" class="sec first wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="phone" /></span>
          <h2>TikTok / Reels / Shorts</h2>
          <p>Videos para redes.</p>
        </div>
        <div class="body g4">
          <WorkCard v-for="w in redes" :key="w.id" :work="w" />
        </div>
      </section>

      <section v-if="contenido.length" id="casos" class="sec wrap" data-reveal>
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
              <div v-if="w.problem" class="step"><span class="ic sm"><Icon name="flag" :size="18" /></span><div><b>El problema</b><span class="t">{{ w.problem }}</span></div></div>
              <div v-if="w.did" class="step"><span class="ic sm"><Icon name="camera" :size="18" /></span><div><b>Lo que hice</b><span class="t">{{ w.did }}</span></div></div>
              <div v-if="w.result" class="step"><span class="ic sm"><Icon name="trending" :size="18" /></span><div><b>El resultado</b><span class="t">{{ w.result }}</span></div></div>
              <div v-if="w.metrics" class="mets">
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

      <section id="clientes" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="heart" /></span>
          <h2>Lo que dicen mis clientes</h2>
        </div>
        <div class="body g2">
          <figure v-for="(q, i) in site.quotes" :key="i" class="quote">
            <blockquote>{{ q.text }}</blockquote>
            <figcaption><b>{{ q.who }}</b><span class="cr">{{ q.rubro }}</span></figcaption>
          </figure>
        </div>
      </section>

      <section v-if="horizontal.length" id="horizontales" class="sec wrap" data-reveal>
        <div class="label">
          <span class="ic"><Icon name="monitor" /></span>
          <h2>Videos Horizontales</h2>
          <p>Proyectos de la universidad.</p>
        </div>
        <div class="body g2">
          <WorkCard v-for="w in horizontal" :key="w.id" :work="w" ratio="16/9" />
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
          <a class="btn big-cta" :href="site.whatsapp"><Icon name="chat" />Escríbeme por WhatsApp</a>
          <div class="line">
            <a v-for="c in site.contacts" :key="c.label" href="#contacto">
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
          <span>© [Año] {{ site.name }}</span>
          <span>{{ site.city }}</span>
        </div>
      </section>
    </main>

    <a class="fab" :class="{ show: showFab }" :href="site.whatsapp"><Icon name="chat" :size="20" />Escríbeme</a>
  </div>
</template>
