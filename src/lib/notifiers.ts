import fetch from 'node-fetch'

const slackWebhook = process.env.SLACK_WEBHOOK_URL
const twilioSid = process.env.TWILIO_SID
const twilioAuth = process.env.TWILIO_AUTH_TOKEN
const twilioFrom = process.env.TWILIO_FROM
const adminPhone = process.env.ADMIN_PHONE

export async function sendAdminSlack(order: any) {
  if (!slackWebhook) {
    console.log('SLACK_WEBHOOK_URL not configured, skipping slack notification')
    return
  }

  const text = `Novo pedido ${order.id} — R$ ${order.total?.toFixed(2)} — ${order.customerEmail || (order.user && order.user.email) || '—'}`
  try {
    await fetch(slackWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    console.log('Slack notification sent')
  } catch (err) {
    console.error('Error sending Slack notification', err)
  }
}

export async function sendAdminSms(order: any) {
  if (!twilioSid || !twilioAuth || !twilioFrom || !adminPhone) {
    console.log('Twilio not configured (TWILIO_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM/ADMIN_PHONE), skipping SMS')
    return
  }

  // Lazy load twilio to avoid adding runtime dependency if not used
  try {
    // dynamic import to avoid requiring the package at module load time
    const mod = await import('twilio')
    const createClient = (mod as any).default || mod
    const twilioClient = createClient(twilioSid, twilioAuth)
    await twilioClient.messages.create({ body: `Novo pedido ${order.id} — R$ ${order.total?.toFixed(2)}`, from: twilioFrom, to: adminPhone })
    console.log('Admin SMS sent')
  } catch (err) {
    console.error('Error sending admin SMS', err)
  }
}
