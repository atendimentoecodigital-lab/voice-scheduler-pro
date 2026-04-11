const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const DAY_MAP: Record<string, number> = {
  'domingo': 0, 'dom': 0,
  'segunda': 1, 'seg': 1,
  'terca': 2, 'terça': 2, 'ter': 2,
  'quarta': 3, 'qua': 3,
  'quinta': 4, 'qui': 4,
  'sexta': 5, 'sex': 5,
  'sabado': 6, 'sábado': 6, 'sab': 6,
}

const TIME_PATTERNS = ['14h', '15h', '16h', '17h', '10h', '11h', '09h', '08h']
const HOUR_REGEX = /\b(\d{1,2})\s*h?\b/g

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function extractDay(text: string): number | null {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const original = text.toLowerCase()

  // Check original text first (for accented chars like terça)
  for (const [key, val] of Object.entries(DAY_MAP)) {
    if (original.includes(key) || lower.includes(key.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      return val
    }
  }
  return null
}

function extractTime(text: string): string | null {
  const lower = text.toLowerCase()

  // Match patterns like "14h", "15h", "14:00", "às 14"
  const match = lower.match(/\b(\d{1,2})\s*(?:h|:00|hrs?)?\b/)
  if (match) {
    const hour = parseInt(match[1])
    if (hour >= 8 && hour <= 18) {
      return `${String(hour).padStart(2, '0')}:00`
    }
  }
  return null
}

function getNextOccurrence(dayOfWeek: number): string {
  const now = new Date()
  const today = now.getDay()
  let daysAhead = dayOfWeek - today
  if (daysAhead <= 0) daysAhead += 7
  const target = new Date(now)
  target.setDate(now.getDate() + daysAhead)
  return target.toISOString().split('T')[0]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()
    const phone = payload.phone || ''
    const messageText = payload.message?.text || payload.message?.body || ''

    if (!phone || !messageText) {
      return new Response(JSON.stringify({ error: 'Missing phone or message text' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const sanitized = sanitizePhone(phone)

    // Find client by phone (compare digits only)
    const { data: clients } = await supabase.from('clients').select('*')
    const client = clients?.find((c: any) => sanitizePhone(c.phone || '') === sanitized)

    const clientId = client?.id || null
    const clientName = client?.name || phone
    const teamSlug = client?.team || 'siao'

    // Save message
    await supabase.from('whatsapp_messages').insert({
      client_id: clientId,
      client_name: clientName,
      phone: sanitized,
      message_text: messageText,
      direction: 'incoming',
      team_slug: teamSlug,
    })

    // Parse day and time from message
    const dayOfWeek = extractDay(messageText)
    const time = extractTime(messageText)

    if (dayOfWeek !== null && time !== null && client) {
      // Schedule appointment
      const date = getNextOccurrence(dayOfWeek)

      // Get team name
      const { data: team } = await supabase.from('teams').select('name').eq('slug', teamSlug).single()
      const teamName = team?.name || teamSlug.charAt(0).toUpperCase() + teamSlug.slice(1)

      // Call calendar-create-event
      const createEventUrl = `${SUPABASE_URL}/functions/v1/calendar-create-event`
      const eventRes = await fetch(createEventUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          title: `Reunião — ${clientName}`,
          description: `Agendamento automático via WhatsApp`,
          date,
          time,
          attendeeEmail: client.email || undefined,
          clientId: client.id,
          team: teamSlug,
          teamName,
        }),
      })
      const eventData = await eventRes.json()

      // Update client status
      await supabase.from('clients').update({ status: 'agendado' }).eq('id', client.id)

      return new Response(JSON.stringify({
        action: 'scheduled',
        client: clientName,
        date,
        time,
        team: teamSlug,
        appointment: eventData.appointment,
        meetLink: eventData.meetLink,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If message shows interest but no specific time
    if (client && client.status === 'pendente') {
      await supabase.from('clients').update({ status: 'em_contato' }).eq('id', client.id)

      return new Response(JSON.stringify({
        action: 'status_updated',
        client: clientName,
        newStatus: 'em_contato',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      action: 'message_saved',
      client: clientName,
      message: 'Mensagem salva, sem ação automática',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
