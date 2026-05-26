import { supabase } from '@/lib/supabase'

export async function verificarLogin() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}