export class NotificationService {
  async sendWelcomeEmail(email: string, name: string) { console.log(`Welcome email queued for ${name} <${email}>`); }
  async sendOrderConfirmation(email: string, name: string, orderId: string, amount: number) { console.log(`Order ${orderId} confirmation queued for ${name} <${email}> amount=${amount}`); }
}
