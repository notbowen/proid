import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'missing'
})

let supabase

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing')
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing')
  console.error('Please create a .env file with your Supabase credentials')
  
  // Create a mock client for development that will show errors
  const mockClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
      updateUser: async () => ({ data: null, error: new Error('Supabase not configured') })
    },
    from: () => ({
      select: () => ({ order: () => Promise.reject(new Error('Supabase not configured')) }),
      insert: () => ({ select: () => ({ single: () => Promise.reject(new Error('Supabase not configured')) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.reject(new Error('Supabase not configured')) }) }) }),
      delete: () => ({ eq: () => Promise.reject(new Error('Supabase not configured')) })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not configured')),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} })
      })
    })
  }
  
  supabase = mockClient
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase } 