import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://hxfjqeoghziymujnfjpu.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase