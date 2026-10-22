import type { User } from '@supabase/supabase-js'

// Estado de sesión del panel. Solo se usa en /admin (que no se renderiza en el servidor).
export function useAdmin() {
  const sb = useSupabase()
  const user = useState<User | null>('adm-user', () => null)
  const isAdmin = useState<boolean>('adm-is-admin', () => false)
  const ready = useState<boolean>('adm-ready', () => false)

  async function checkAdmin() {
    if (!user.value) {
      isAdmin.value = false
      return
    }
    const { data } = await sb.from('admins').select('user_id').maybeSingle()
    isAdmin.value = !!data
  }

  async function load() {
    const { data } = await sb.auth.getSession()
    user.value = data.session?.user ?? null
    await checkAdmin()
    ready.value = true
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    await checkAdmin()
  }

  async function signOut() {
    await sb.auth.signOut()
    user.value = null
    isAdmin.value = false
  }

  return { sb, user, isAdmin, ready, load, signIn, signOut }
}
