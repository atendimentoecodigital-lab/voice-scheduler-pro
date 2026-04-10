const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

const TEAM_CALENDARS: Record<string, string> = {
  arca: 'e38d5610a8720a788c358e19e267d1968f4eeb2b41d86a073d99ae93640dcf14@group.calendar.google.com',
  juda: '0129971c7ce7226946a90e1945ae5d08cbb67e18f1f2f4f37cec80769b945a02@group.calendar.google.com',
  siao: 'e97b5158a1c8cc6b0e44096ccb8f99d2b52fd6a25c144573348cc18be3961de0@group.calendar.google.com',
}

async function getAccessToken(supabase: any): Promise<string | null> {
  const { data } = await supabase.from('google_tokens').select('*').eq('user_id', 'default').single()
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
    await supabase.from('google_tokens').update({ access_token: tokens.access_token, expiry }).eq('user_id', 'default')
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

    let teamSlug = 'siao'
    try {
      const body = await req.json()
      teamSlug = body.team || 'siao'
    } catch { /* default */ }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'not_connected', availability: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const calendarId = TEAM_CALENDARS[teamSlug] || TEAM_CALENDARS['siao']
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const slots = ['14:00', '15:00', '16:00']
    const availability = []

    for (let i = 1; i <= 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      const dateStr = date.toISOString().split('T')[0]
      const timeMin = `${dateStr}T13:00:00Z`
      const timeMax = `${dateStr}T18:00:00Z`

      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const calData = await calRes.json()
      const busyTimes = (calData.items || []).map((e: any) => {
        const start = e.start?.dateTime ? new Date(e.start.dateTime) : null
        return start ? `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}` : ''
      })

      availability.push({
        date: dateStr,
        dayName: dayNames[dayOfWeek],
        slots: slots.map(s => ({ time: s, available: !busyTimes.includes(s) })),
      })
    }

    return new Response(JSON.stringify({ availability }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
