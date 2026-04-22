import { FastifyInstance } from 'fastify';

export class CalendarService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  // Google Calendar OAuth URL
  getGoogleAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  // Troca code por tokens Google
  async exchangeGoogleCode(code: string, redirectUri: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    return response.json();
  }

  // Cria evento no Google Calendar
  async createGoogleEvent(accessToken: string, event: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    attendeeEmail?: string;
    calendarId?: string;
  }) {
    const body: any = {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startDateTime, timeZone: 'America/Sao_Paulo' },
      end: { dateTime: event.endDateTime, timeZone: 'America/Sao_Paulo' },
    };
    if (event.attendeeEmail) {
      body.attendees = [{ email: event.attendeeEmail }];
    }
    const calId = event.calendarId || 'primary';
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  // Lista eventos Google Calendar
  async listGoogleEvents(accessToken: string, calendarId = 'primary', timeMin?: string, timeMax?: string) {
    const params = new URLSearchParams({
      orderBy: 'startTime',
      singleEvents: 'true',
      ...(timeMin && { timeMin }),
      ...(timeMax && { timeMax }),
    });
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.json();
  }

  // Outlook Calendar - cria evento via Microsoft Graph
  async createOutlookEvent(accessToken: string, event: {
    subject: string;
    body?: string;
    startDateTime: string;
    endDateTime: string;
    attendeeEmail?: string;
  }) {
    const body: any = {
      subject: event.subject,
      body: { contentType: 'HTML', content: event.body || '' },
      start: { dateTime: event.startDateTime, timeZone: 'E. South America Standard Time' },
      end: { dateTime: event.endDateTime, timeZone: 'E. South America Standard Time' },
    };
    if (event.attendeeEmail) {
      body.attendees = [{ emailAddress: { address: event.attendeeEmail }, type: 'required' }];
    }
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }
}
