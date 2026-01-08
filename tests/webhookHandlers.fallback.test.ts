jest.mock('../src/lib/prisma')
jest.mock('../src/lib/email', () => ({ sendOrderConfirmation: jest.fn(), sendAdminNotification: jest.fn() }))
jest.mock('../src/lib/notifiers', () => ({ sendAdminSlack: jest.fn(), sendAdminSms: jest.fn() }))

import { handleCheckoutSessionCompleted } from '../src/lib/webhookHandlers'
import prisma from '../src/lib/prisma'

const mockedPrisma: any = prisma as any

describe('handleCheckoutSessionCompleted fallback mapping and error cases', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('attempts to map line items by product name when metadata missing', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null)
    mockedPrisma.product.findFirst.mockResolvedValue({ id: 'prod_name', price: 25 })
    mockedPrisma.order.create.mockResolvedValue({ id: 'order_2', total: 25, items: [{ id: 'it1', product: { name: 'Fallback Product' }, quantity: 1, price: 25 }] })

    // stub stripe-like client with listLineItems
    const stripeStub: any = {
      checkout: { sessions: { listLineItems: jest.fn().mockResolvedValue({ data: [{ description: 'Fallback Product', quantity: 1 }] }) } }
    }

    const session: any = { id: 'sess_fallback', amount_total: 2500 }

    const res = await handleCheckoutSessionCompleted(session, stripeStub)

    expect(stripeStub.checkout.sessions.listLineItems).toHaveBeenCalledWith('sess_fallback', { limit: 100 })
    expect(mockedPrisma.order.create).toHaveBeenCalled()
    expect(res).toMatchObject({ id: 'order_2', created: true })
  })

  it('continues gracefully if notification sending fails', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null)
    mockedPrisma.product.findUnique.mockResolvedValue({ id: 'prod_1', price: 10 })
    mockedPrisma.order.create.mockResolvedValue({ id: 'order_3', total: 10, items: [{ id: 'it1', product: { name: 'Test' }, quantity: 1, price: 10 }], customerEmail: 'customer@example.com' })

    const session: any = { id: 'sess_notify_err', metadata: { order: JSON.stringify([{ productId: 'prod_1', quantity: 1 }]) }, amount_total: 1000, customer_details: { email: 'customer@example.com' } }

    // mock email and notifier to throw
    const email = await import('../src/lib/email')
    const notifiers = await import('../src/lib/notifiers')
    jest.spyOn(email, 'sendOrderConfirmation').mockRejectedValue(new Error('send fail'))
    jest.spyOn(email, 'sendAdminNotification').mockRejectedValue(new Error('send fail'))
    jest.spyOn(notifiers, 'sendAdminSlack').mockRejectedValue(new Error('slack fail'))
    jest.spyOn(notifiers, 'sendAdminSms').mockRejectedValue(new Error('sms fail'))

    // spy and suppress console.error to avoid noisy test output, but assert it was called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await expect(handleCheckoutSessionCompleted(session)).resolves.toMatchObject({ id: 'order_3', created: true })

    // ensure notifications were attempted
    expect(email.sendOrderConfirmation).toHaveBeenCalled()
    expect(notifiers.sendAdminSlack).toHaveBeenCalled()

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})