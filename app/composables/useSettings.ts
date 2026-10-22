// Lee y guarda una pantalla de textos del panel (una fila de site_settings).
export function useSettingsPage<T extends Record<string, any>>(key: string) {
  const { sb, isAdmin, ready, load } = useAdmin()
  const loading = ref(true)
  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  // carga la sesión, saca a quien no es admin y devuelve lo guardado (o null si aún no hay nada)
  async function start(): Promise<T | null> {
    await load()
    if (!isAdmin.value) {
      await navigateTo('/admin')
      return null
    }
    const { data, error: e } = await sb.from('site_settings').select('value').eq('key', key).maybeSingle()
    if (e) error.value = 'No pude leer lo guardado. Recarga la página.'
    loading.value = false
    return (data?.value as T) ?? null
  }

  async function save(value: T) {
    error.value = ''
    saved.value = false
    saving.value = true
    try {
      const { error: e } = await sb.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (e) throw e
      saved.value = true
    } catch {
      error.value = 'No pude guardar. Revisa tu conexión y vuelve a intentar.'
    } finally {
      saving.value = false
    }
  }

  return { isAdmin, ready, loading, saving, saved, error, start, save }
}
