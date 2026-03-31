import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const PUBLIC_URL = Deno.env.get('PUBLIC_URL') || ''

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response('Missing code parameter', { status: 400 })
    }

    const redirectUri = `${SUPABASE_URL}/functions/v1/google-callback`
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (tokens.error) {
      return new Response(`Token error: ${tokens.error_description}`, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await supabase.from('google_tokens').upsert({
      user_id: 'default',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expiry,
    }, { onConflict: 'user_id' })

    const appUrl = PUBLIC_URL || SUPABASE_URL.replace('.supabase.co', '.lovable.app')
    return new Response(null, {
      status: 302,
      headers: { Location: `${appUrl}/appointments?connected=true` },
    })
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
})
