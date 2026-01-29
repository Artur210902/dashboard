// Email service using Resend
// For production, install: npm install resend

export async function sendAlertEmail(
  to: string,
  subject: string,
  message: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // In production, use the Resend SDK:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // const { data, error } = await resend.emails.send({
    //   from: 'alerts@yourdomain.com',
    //   to,
    //   subject,
    //   html: message,
    // })

    // For now, we'll use fetch API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Price Tracker <alerts@yourdomain.com>',
        to,
        subject,
        html: message,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}
