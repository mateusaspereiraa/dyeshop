jest.mock('../src/lib/prisma')
jest.mock('../src/lib/email', () => ({ sendOrderConfirmation: jest.fn(), sendAdminNotification: jest.fn() }))
jest.mock('../src/lib/notifiers', () => ({ sendAdminSlack: jest.fn(), sendAdminSms: jest.fn() }))

import { handleCheckoutSessionCompleted } from '../src/lib/webhookHandlers'
import prisma from '../src/lib/prisma'

const mockedPrisma: any = prisma as any

describe('handleCheckoutSessionCompleted', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('creates an order when none exists and sends notifications', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null)
    mockedPrisma.product.findUnique.mockResolvedValue({ id: 'prod_1', price: 10 })
    mockedPrisma.order.create.mockResolvedValue({ id: 'order_1', total: 10, items: [{ id: 'it1', product: { name: 'Test' }, quantity: 1, price: 10 }], customerEmail: 'customer@example.com' })

    const session: any = {
      id: 'sess_123',
      metadata: { order: JSON.stringify([{ productId: 'prod_1', quantity: 1 }]), userId: 'user_1' },
      amount_total: 1000,
      payment_intent: 'pi_123',
      customer_details: { email: 'customer@example.com' }
    }

    // mock notifier and email modules
    const email = await import('../src/lib/email')
    const notifiers = await import('../src/lib/notifiers')
    jest.spyOn(email, 'sendOrderConfirmation').mockResolvedValue(undefined as any)
    jest.spyOn(email, 'sendAdminNotification').mockResolvedValue(undefined as any)
    jest.spyOn(notifiers, 'sendAdminSlack').mockResolvedValue(undefined as any)
    jest.spyOn(notifiers, 'sendAdminSms').mockResolvedValue(undefined as any)

    // spy console.error to fail the test if unexpected errors are logged
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const res = await handleCheckoutSessionCompleted(session)

    expect(mockedPrisma.order.findUnique).toHaveBeenCalledWith({ where: { stripeSessionId: 'sess_123' } })
    expect(mockedPrisma.order.create).toHaveBeenCalled()
    expect(res).toMatchObject({ id: 'order_1', created: true })
    expect(email.sendOrderConfirmation).toHaveBeenCalled()
    expect(email.sendAdminNotification).toHaveBeenCalled()
    expect(notifiers.sendAdminSlack).toHaveBeenCalled()
    expect(notifiers.sendAdminSms).toHaveBeenCalled()

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('does not create duplicate orders when session already processed', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({ id: 'order_existing' })

    const session: any = { id: 'sess_999' }
    const res = await handleCheckoutSessionCompleted(session)

    expect(mockedPrisma.order.findUnique).toHaveBeenCalledWith({ where: { stripeSessionId: 'sess_999' } })
    expect(mockedPrisma.order.create).not.toHaveBeenCalled()
    expect(res).toMatchObject({ existing: true })
  })
})
