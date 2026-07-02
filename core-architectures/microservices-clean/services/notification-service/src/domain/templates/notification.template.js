'use strict';

class NotificationTemplate {
  constructor({ name, type, channels, subject, body, variables = [], metadata = {} }) {
    this.name = name;
    this.type = type;
    this.channels = channels;
    this.subject = subject;
    this.body = body;
    this.variables = variables;
    this.metadata = metadata;
  }

  render(variables) {
    let renderedSubject = this.subject;
    let renderedBody = this.body;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, value);
      renderedBody = renderedBody.replace(regex, value);
    }

    return { subject: renderedSubject, body: renderedBody };
  }

  validateVariables(variables) {
    const missing = [];
    for (const variable of this.variables) {
      if (!(variable in variables)) {
        missing.push(variable);
      }
    }
    return { isValid: missing.length === 0, missing };
  }
}

const TEMPLATES = {
  WELCOME_EMAIL: new NotificationTemplate({
    name: 'welcome_email',
    type: 'transactional',
    channels: ['email'],
    subject: 'Welcome to {{appName}}, {{userName}}!',
    body: 'Dear {{userName}},\n\nWelcome to {{appName}}! We\'re excited to have you on board.\n\nBest regards,\nThe {{appName}} Team',
    variables: ['appName', 'userName']
  }),

  ORDER_CONFIRMATION: new NotificationTemplate({
    name: 'order_confirmation',
    type: 'transactional',
    channels: ['email', 'sms'],
    subject: 'Order Confirmation - #{{orderId}}',
    body: 'Dear {{customerName}},\n\nYour order #{{orderId}} has been confirmed.\n\nItems:\n{{items}}\n\nTotal: {{totalAmount}}\n\nThank you for your purchase!',
    variables: ['customerName', 'orderId', 'items', 'totalAmount']
  }),

  PAYMENT_SUCCESS: new NotificationTemplate({
    name: 'payment_success',
    type: 'transactional',
    channels: ['email', 'push'],
    subject: 'Payment Successful',
    body: 'Dear {{customerName}},\n\nYour payment of {{amount}} for order #{{orderId}} has been received.\n\nTransaction ID: {{transactionId}}',
    variables: ['customerName', 'amount', 'orderId', 'transactionId']
  }),

  PASSWORD_RESET: new NotificationTemplate({
    name: 'password_reset',
    type: 'security',
    channels: ['email'],
    subject: 'Password Reset Request',
    body: 'Dear {{userName}},\n\nYou requested a password reset. Click the link below to reset your password:\n\n{{resetLink}}\n\nThis link expires in {{expiryTime}}.\n\nIf you did not request this, please ignore this email.',
    variables: ['userName', 'resetLink', 'expiryTime']
  })
};

module.exports = { NotificationTemplate, TEMPLATES };