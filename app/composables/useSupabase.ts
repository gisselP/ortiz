import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

// Un solo cliente para toda la app. La clave "publishable" es pública por diseño,
// lo que protege los datos son las reglas (RLS) de la base.
export function useSupabase(): SupabaseClient {
  if (client) return client
  const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
  const inBrowser = import.meta.client
  client = createClient(supabaseUrl as string, supabaseKey as string, {
    auth: { persistSession: inBrowser, autoRefreshToken: inBrowser, detectSessionInUrl: false }
  })
  return client
}
