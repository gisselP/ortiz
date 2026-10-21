# Sofía Ortiz, portafolio

Web de Sofía Ortiz, comunicadora audiovisual. Hecha con Nuxt (Vue).

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Estructura

- `app/pages/index.vue` home con todas las secciones del diseño.
- `app/pages/trabajo/[id].vue` video abierto, con su propia dirección para compartir.
- `app/components/WorkCard.vue` tile con video que se reproduce al pasar el mouse (en celular, al verlo en pantalla).
- `app/composables/useSite.ts` textos y videos de ejemplo. Los `[corchetes]` son placeholders.
- `public/videos/` videos de prueba (cortes de hover, videos completos y portadas).

## Próximos pasos

1. Login y panel `/admin` con Supabase.
2. Subida de videos desde el panel (Cloudflare R2).
3. Reemplazar textos, fotos y contacto por los reales.
