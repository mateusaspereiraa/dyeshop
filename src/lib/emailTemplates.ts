export function customerEmailHtml(order: any) {
  const itemsHtml = (order.items || []).map((it: any) => `<li>${it.product.name} x ${it.quantity} — R$ ${it.price.toFixed(2)}</li>`).join('')
  return `
  <div style="font-family: Inter, Arial, sans-serif; color: #111">
    <h2>Obrigado pelo pedido!</h2>
    <p>Pedido <strong>${order.id}</strong></p>
    <p>Total: <strong>R$ ${order.total?.toFixed(2)}</strong></p>
    <ul>${itemsHtml}</ul>
    <p>Em breve enviaremos atualizações sobre o status do pedido.</p>
    <hr>
    <small>— DyeShop</small>
  </div>`
}

export function adminEmailHtml(order: any) {
  const itemsHtml = (order.items || []).map((it: any) => `<li>${it.product.name} x ${it.quantity} — R$ ${it.price.toFixed(2)}</li>`).join('')
  return `
  <div style="font-family: Inter, Arial, sans-serif; color: #111">
    <h2>Novo pedido recebido</h2>
    <p>Pedido <strong>${order.id}</strong> — Total: <strong>R$ ${order.total?.toFixed(2)}</strong></p>
    <p>Cliente: ${order.customerEmail || (order.user && (order.user as any).email) || '—'}</p>
    <ul>${itemsHtml}</ul>
    <p>ID sessão Stripe: ${order.stripeSessionId || '—'}</p>
    <hr>
  </div>`
}
