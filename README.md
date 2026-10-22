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
- `app/composables/useSite.ts` textos de ejemplo y lectura de videos desde Supabase. Los `[corchetes]` son placeholders.
- `public/videos/` videos de prueba (cortes de hover, videos completos y portadas).

## Próximos pasos

1. Login y panel `/admin` con Supabase.
2. Subida de videos desde el panel (Cloudflare R2).
3. Reemplazar textos, fotos y contacto por los reales.

## Decisiones de diseño que no se tocan

- Tipografía: Bricolage Grotesque (títulos y números) + Instrument Sans (texto). Gissel y Sofía quieren mantenerla.
- Verde oliva como acento (#5C6B3A) sobre fondo crema (#F8F6F1).
- Videos verticales primero, sin carrusel ni marquee.
- Cualquier mejora de diseño (skills, Playwright) se propone antes de cambiar el código y respeta esto.

## Panel de administración

- Entrada en `/admin` (login con correo y contraseña de Supabase). No se indexa (`robots.txt` y `noindex`).
- Base de datos en Supabase, proyecto `ortiz` (cuenta de Sofía). Tablas `works`, `site_settings` y `admins`, con RLS: el público solo ve videos publicados y solo los usuarios de `admins` pueden escribir.
- El sitio sale pre-renderizado con los videos de la base y en el navegador pide la lista fresca.
- Variables opcionales: `NUXT_PUBLIC_SUPABASE_URL` y `NUXT_PUBLIC_SUPABASE_KEY` (ver `.env.example`). La clave publishable es pública por diseño.
- Pendiente: subir archivos a Cloudflare R2 desde el formulario (hoy se pega el link), pantallas de Números, Sobre mí y Contacto, y un deploy hook para republicar el sitio al guardar.

## Subida de videos (Cloudflare Pages + R2)

- El formulario del admin sube los archivos a `/api/upload` (`functions/api/upload.ts`), una Pages Function que los guarda en el bucket R2 `sofia-videos`. Solo deja pasar a administradores de Supabase.
- Configuración en Cloudflare Pages (Settings > Bindings): binding R2 con nombre `VIDEOS` apuntando al bucket `sofia-videos`. Luego hay que volver a desplegar.
- Variable opcional `R2_PUBLIC_URL` (por defecto la URL `r2.dev` del bucket; al comprar el dominio cambiarla por el dominio de videos).
- Límite de 95 MB por archivo. La subida no funciona con `npm run dev` (ahí se puede pegar un link).
