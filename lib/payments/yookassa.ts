import axios from 'axios'

export interface YooKassaPayment {
  id: string
  status: 'pending' | 'succeeded' | 'canceled'
  amount: {
    value: string
    currency: string
  }
  description: string
  metadata?: {
    userId?: string
    tier?: string
  }
}

export class YooKassaClient {
  private shopId: string
  private secretKey: string
  private baseUrl: string

  constructor(shopId: string, secretKey: string, isTest: boolean = false) {
    this.shopId = shopId
    this.secretKey = secretKey
    this.baseUrl = isTest
      ? 'https://api.yookassa.ru/v3'
      : 'https://api.yookassa.ru/v3'
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64')}`
  }

  async createPayment(
    amount: number,
    currency: string,
    description: string,
    returnUrl: string,
    metadata?: Record<string, string>
  ): Promise<YooKassaPayment> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          amount: {
            value: amount.toFixed(2),
            currency,
          },
          confirmation: {
            type: 'redirect',
            return_url: returnUrl,
          },
          description,
          metadata,
        },
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
            'Idempotence-Key': `${Date.now()}-${Math.random()}`,
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('YooKassa payment creation error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.description || 'Failed to create payment')
    }
  }

  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    try {
      const response = await axios.get(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      })

      return response.data
    } catch (error: any) {
      console.error('YooKassa get payment error:', error.response?.data || error.message)
      throw new Error('Failed to get payment status')
    }
  }
}
