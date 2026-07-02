export class EventService {
  async publish(eventName: string, payload: unknown) { console.log(`event:${eventName}`, payload); }
}
