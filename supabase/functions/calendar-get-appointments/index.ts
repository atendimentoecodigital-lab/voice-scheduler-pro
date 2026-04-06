const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

async function getAccessToken(supabase: any): Promise<string | null> {
  const { data } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', 'default')
    .single()

  if (!data) return null

  if (new Date(data.expiry) < new Date()) {
    if (!data.refresh_token) return null

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: data.refresh_token,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    })
    const tokens = await res.json()
    if (tokens.error) return null

    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    await supabase.from('google_tokens').update({
      access_token: tokens.access_token,
      expiry,
    }).eq('user_id', 'default')

    return tokens.access_token
  }

  return data.access_token
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const accessToken = await getAccessToken(supabase)

    // Check if Google is connected (for status indicator) but always read from DB
    const isConnected = !!accessToken

    const { data: dbApts, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error

    const appointments = (dbApts || []).map((a: any) => ({
      id: a.id,
      clientId: a.client_id || '',
      clientName: a.client_name || 'Sem título',
      date: a.date || '',
      time: a.time || '',
      meetLink: a.meet_link || '',
      status: a.status || 'pendente',
      createdAt: a.created_at?.split('T')[0] || '',
    }))

    return new Response(JSON.stringify({ appointments, connected: isConnected }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
