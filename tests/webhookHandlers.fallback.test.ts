import { handleCheckoutSessionCompleted } from '../src/lib/webhookHandlers'
import prisma from '../src/lib/prisma'
import * as email from '../src/lib/email'
import * as notifiers from '../src/lib/notifiers'

jest.mock('../src/lib/prisma', () => ({
  order: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  product: {
    findFirst: jest.fn(),
    findUnique: jest.fn()
  }
}))

jest.mock('../src/lib/email', () => ({
  sendOrderConfirmation: jest.fn(),
  sendAdminNotification: jest.fn()
}))

jest.mock('../src/lib/notifiers', () => ({
  sendAdminSlack: jest.fn(),
  sendAdminSms: jest.fn()
}))

const mockedPrisma = prisma as jest.Mocked<typeof prisma>

describe('handleCheckoutSessionCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps line items by product name when metadata is missing', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null)
    mockedPrisma.product.findFirst.mockResolvedValue({ id: 'prod_name', price: 25 } as any)
    mockedPrisma.order.create.mockResolvedValue({
      id: 'order_2',
      total: 25,
      items: [{ quantity: 1, price: 25, product: { name: 'Fallback Product' } }]
    } as any)

    const stripeStub = {
      checkout: {
        sessions: {
          listLineItems: jest.fn().mockResolvedValue({
            data: [{ description: 'Fallback Product', quantity: 1 }]
          })
        }
      }
    }

    const session = { id: 'sess_fallback', amount_total: 2500 }

    const result = await handleCheckoutSessionCompleted(session as any, stripeStub as any)

    expect(stripeStub.checkout.sessions.listLineItems).toHaveBeenCalledWith(
      'sess_fallback',
      { limit: 100 }
    )
    expect(mockedPrisma.order.create).toHaveBeenCalled()
    expect(result).toEqual({ id: 'order_2', created: true })
  })

  it('continues gracefully when notification sending fails', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null)
    mockedPrisma.product.findUnique.mockResolvedValue({ id: 'prod_1', price: 10 } as any)
    mockedPrisma.order.create.mockResolvedValue({
      id: 'order_3',
      total: 10,
      items: [{ quantity: 1, price: 10, product: { name: 'Test' } }],
      customerEmail: 'customer@example.com'
    } as any)

    ;(email.sendOrderConfirmation as jest.Mock).mockRejectedValue(new Error('email fail'))
    ;(email.sendAdminNotification as jest.Mock).mockRejectedValue(new Error('email fail'))
    ;(notifiers.sendAdminSlack as jest.Mock).mockRejectedValue(new Error('slack fail'))
    ;(notifiers.sendAdminSms as jest.Mock).mockRejectedValue(new Error('sms fail'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const session = {
      id: 'sess_notify_err',
      amount_total: 1000,
      metadata: {
        order: JSON.stringify([{ productId: 'prod_1', quantity: 1 }])
      },
      customer_details: { email: 'customer@example.com' }
    }

    await expect(
      handleCheckoutSessionCompleted(session as any)
    ).resolves.toEqual({ id: 'order_3', created: true })

    expect(email.sendOrderConfirmation).toHaveBeenCalled()
    expect(notifiers.sendAdminSlack).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
