import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cikpuilwcvttcdptdpzp.supabase.co'
const SUPABASE_KEY = 'sb_publishable_0YPL_BrgA0TNUXg7nVLhow_xOH_kmzE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
