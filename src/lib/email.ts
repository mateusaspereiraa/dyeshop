import sgMail from '@sendgrid/mail'
import { Order } from '@prisma/client'
import { customerEmailHtml, adminEmailHtml } from './emailTemplates'

const apiKey = process.env.SENDGRID_API_KEY
const fromEmail = process.env.FROM_EMAIL || 'no-reply@example.com'
const adminEmail = process.env.ADMIN_EMAIL

if (apiKey) sgMail.setApiKey(apiKey)

export async function sendOrderConfirmation(order: Partial<Order> & { items?: any[] }) {
  if (!apiKey) {
    console.log('SendGrid not configured. Order email payload:', { order })
    return
  }

  const to = order.customerEmail || (order as any).user?.email
  if (!to) {
    console.log('No email to send order confirmation to for order', order.id)
    return
  }

  const msg = {
    to,
    from: fromEmail,
    subject: `Seu pedido ${order.id} — DyeShop`,
    html: customerEmailHtml(order)
  }

  try {
    await sgMail.send(msg)
    console.log('Order confirmation sent to', to)
  } catch (err) {
    console.error('Error sending order email', err)
  }
}

export async function sendAdminNotification(order: Partial<Order> & { items?: any[] }) {
  if (!apiKey) {
    console.log('SendGrid not configured. Admin order email payload:', { order })
    return
  }
  const to = adminEmail
  if (!to) {
    console.log('ADMIN_EMAIL not configured, skipping admin notification for order', order.id)
    return
  }

  const msg = {
    to,
    from: fromEmail,
    subject: `Novo pedido ${order.id} — DyeShop (admin)` ,
    html: adminEmailHtml(order)
  }

  try {
    await sgMail.send(msg)
    console.log('Admin notification sent to', to)
  } catch (err) {
    console.error('Error sending admin email', err)
  }
}
