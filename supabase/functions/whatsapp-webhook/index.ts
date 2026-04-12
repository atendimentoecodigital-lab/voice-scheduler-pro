const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const ZAPI_INSTANCE = '3F17C7660DEA1383DCA1AAE399BC1248'
const ZAPI_TOKEN = '43DD63BAE862B0D18A7F3A25'
const ZAPI_CLIENT_TOKEN = Deno.env.get('ZAPI_CLIENT_TOKEN') || 'F66bc26f3c70e493dbf4e8cecd59b3509S'

const DAY_MAP: Record<string, number> = {
  'domingo': 0, 'dom': 0,
  'segunda': 1, 'seg': 1,
  'terca': 2, 'terça': 2, 'ter': 2,
  'quarta': 3, 'qua': 3,
  'quinta': 4, 'qui': 4,
  'sexta': 5, 'sex': 5,
  'sabado': 6, 'sábado': 6, 'sab': 6,
}

const INTEREST_WORDS = ['sim', 'pode', 'quero', 'interesse', 'ok', 'topo', 'claro', 'vamos', 'bora', 'ótimo', 'otimo', 'perfeito', 'combinado']

const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function extractDay(text: string): number | null {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const original = text.toLowerCase()
  for (const [key, val] of Object.entries(DAY_MAP)) {
    if (original.includes(key) || lower.includes(key.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      return val
    }
  }
  return null
}

function extractTime(text: string): string | null {
  const lower = text.toLowerCase()
  const match = lower.match(/\b(\d{1,2})\s*(?:h|:00|hrs?)?\b/)
  if (match) {
    const hour = parseInt(match[1])
    if (hour >= 8 && hour <= 18) {
      return `${String(hour).padStart(2, '0')}:00`
    }
  }
  return null
}

function hasInterest(text: string): boolean {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return INTEREST_WORDS.some(w => lower.includes(w.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
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

function formatDatePtBr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return `${dayNames[date.getDay()]}, ${String(day).padStart(2, '0')} de ${MONTH_NAMES[month - 1]} de ${year}`
}

async function sendWhatsAppMessage(phone: string, message: string) {
  await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': ZAPI_CLIENT_TOKEN,
    },
    body: JSON.stringify({ phone, message }),
  })
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
    console.log('Raw Z-API payload:', JSON.stringify(payload))

    const phone = payload.phone || payload.participantPhone || ''
    const messageText = payload.text?.message || payload.message?.text || payload.message?.body || (typeof payload.text === 'string' ? payload.text : '')

    console.log('Extracted phone:', phone, 'message:', messageText)

    if (!phone || !messageText) {
      return new Response(JSON.stringify({ error: 'Missing phone or message text', rawPayload: payload }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const sanitized = sanitizePhone(phone)

    // Find client by phone — try exact and with 9 inserted after area code
    const sanitizedWith9 = (sanitized.startsWith('55') && sanitized.length === 12)
      ? sanitized.slice(0, 4) + '9' + sanitized.slice(4)
      : null
    const phonesToMatch = sanitizedWith9 ? [sanitized, sanitizedWith9] : [sanitized]

    const { data: clients } = await supabase.from('clients').select('*')
    const client = clients?.find((c: any) => {
      const stored = sanitizePhone(c.phone || '')
      return phonesToMatch.includes(stored)
    })

    const clientId = client?.id || null
    const clientName = client?.name || phone
    const teamSlug = client?.team || 'siao'

    // Save incoming message
    await supabase.from('whatsapp_messages').insert({
      client_id: clientId,
      client_name: clientName,
      phone: sanitized,
      message_text: messageText,
      direction: 'incoming',
      team_slug: teamSlug,
    })

    // Parse day and time
    const dayOfWeek = extractDay(messageText)
    const time = extractTime(messageText)

    // IMPROVEMENT 1: Schedule + send confirmation
    if (dayOfWeek !== null && time !== null && client) {
      const date = getNextOccurrence(dayOfWeek)

      const { data: team } = await supabase.from('teams').select('name').eq('slug', teamSlug).single()
      const teamName = team?.name || teamSlug.charAt(0).toUpperCase() + teamSlug.slice(1)

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

      await supabase.from('clients').update({ status: 'agendado' }).eq('id', client.id)

      // Send confirmation via WhatsApp
      const meetLink = eventData.meetLink || 'Link será enviado em breve'
      const formattedDate = formatDatePtBr(date)
      const hourStr = time.replace(':00', '')
      const confirmMsg = `Perfeito, ${clientName}! ✅\n\nSua reunião foi agendada com sucesso!\n\n📅 ${formattedDate}\n⏰ ${hourStr}h00\n📹 Meet: ${meetLink}\n\nTe esperamos lá! Qualquer dúvida é só chamar aqui. 😊`

      await sendWhatsAppMessage(sanitized, confirmMsg)

      // Save outgoing message
      await supabase.from('whatsapp_messages').insert({
        client_id: clientId,
        client_name: clientName,
        phone: sanitized,
        message_text: confirmMsg,
        direction: 'outgoing',
        team_slug: teamSlug,
      })

      return new Response(JSON.stringify({
        action: 'scheduled',
        client: clientName,
        date,
        time,
        team: teamSlug,
        appointment: eventData.appointment,
        meetLink: eventData.meetLink,
        confirmationSent: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // IMPROVEMENT 2: Interest detected → send available slots
    if (client && hasInterest(messageText)) {
      // Update status if pendente
      if (client.status === 'pendente') {
        await supabase.from('clients').update({ status: 'em_contato' }).eq('id', client.id)
      }

      // Fetch availability
      const availRes = await fetch(`${SUPABASE_URL}/functions/v1/calendar-get-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ team: teamSlug }),
      })
      const availData = await availRes.json()

      if (availData.availability && availData.availability.length > 0) {
        // Build message with available slots only
        let slotsMsg = `Oi ${clientName}! 😊 Temos os seguintes horários disponíveis:\n\n`
        let hasSlots = false

        for (const day of availData.availability) {
          const availableSlots = day.slots.filter((s: any) => s.available)
          if (availableSlots.length === 0) continue
          hasSlots = true

          const [y, m, d] = day.date.split('-').map(Number)
          const dateFormatted = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
          const slotsFormatted = availableSlots.map((s: any) => `${s.time.replace(':00', '')}h00 ✅`).join(' | ')
          slotsMsg += `📅 ${day.dayName}, ${dateFormatted} → ${slotsFormatted}\n`
        }

        slotsMsg += `\nQual desses horários fica melhor pra você?`

        if (hasSlots) {
          await sendWhatsAppMessage(sanitized, slotsMsg)

          await supabase.from('whatsapp_messages').insert({
            client_id: clientId,
            client_name: clientName,
            phone: sanitized,
            message_text: slotsMsg,
            direction: 'outgoing',
            team_slug: teamSlug,
          })

          return new Response(JSON.stringify({
            action: 'availability_sent',
            client: clientName,
            newStatus: client.status === 'pendente' ? 'em_contato' : client.status,
            slotsSent: true,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

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
