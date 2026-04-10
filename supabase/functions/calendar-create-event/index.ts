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
    const { title, description, date, time, attendeeEmail, clientId, team } = await req.json()
    const teamSlug = team || 'siao'

    if (!date || !time || !title) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, date, time' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const accessToken = await getAccessToken(supabase)

    const calendarId = TEAM_CALENDARS[teamSlug] || TEAM_CALENDARS['siao']
    const teamName = teamSlug.charAt(0).toUpperCase() + teamSlug.slice(1)

    let googleEventId = ''
    let meetLink = ''

    if (accessToken) {
      const startDateTime = `${date}T${time}:00`
      const endHour = String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')
      const endDateTime = `${date}T${endHour}:${time.split(':')[1]}:00`

      const event: any = {
        summary: title,
        description: `[Equipe ${teamName}] ${description || `Reunião de alinhamento com ${title.replace('Reunião — ', '')}`}`,
        start: { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' },
        conferenceData: {
          createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
        },
      }

      if (attendeeEmail) {
        event.attendees = [{ email: attendeeEmail }]
      }

      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        }
      )
      const calData = await calRes.json()
      googleEventId = calData.id || ''
      meetLink = calData.hangoutLink || ''
    }

    const { data: apt, error } = await supabase.from('appointments').insert({
      client_id: clientId || null,
      client_name: title.replace('Reunião — ', ''),
      date, time,
      meet_link: meetLink,
      google_event_id: googleEventId,
      status: 'confirmado',
      team: teamSlug,
    }).select().single()

    if (error) throw error

    return new Response(JSON.stringify({ appointment: apt, meetLink, googleEventId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
