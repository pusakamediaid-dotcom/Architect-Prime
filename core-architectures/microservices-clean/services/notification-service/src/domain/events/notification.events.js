'use strict';

class NotificationSentEvent {
  constructor(notification) {
    this.eventType = 'NotificationSentEvent';
    this.notificationId = notification.id;
    this.userId = notification.userId;
    this.channel = notification.channel;
    this.templateName = notification.templateName;
    this.timestamp = new Date().toISOString();
  }
}

class NotificationFailedEvent {
  constructor(notification, error) {
    this.eventType = 'NotificationFailedEvent';
    this.notificationId = notification.id;
    this.userId = notification.userId;
    this.channel = notification.channel;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }
}

class NotificationScheduledEvent {
  constructor(notification, scheduledFor) {
    this.eventType = 'NotificationScheduledEvent';
    this.notificationId = notification.id;
    this.userId = notification.userId;
    this.channel = notification.channel;
    this.scheduledFor = scheduledFor;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = {
  NotificationSentEvent,
  NotificationFailedEvent,
  NotificationScheduledEvent
};