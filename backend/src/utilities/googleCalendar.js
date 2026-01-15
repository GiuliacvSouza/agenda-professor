const { google } = require('googleapis');

let calendarClient = null;
let calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
let timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Sao_Paulo';
let enabled = (process.env.GOOGLE_CALENDAR_ENABLED || 'false').toLowerCase() === 'true';

function initClient() {
  if (!enabled) return null;

  // Support either full JSON in env, OR separate client_email / private_key
  let credentials = null;
  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      // try parsing JSON directly
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64) {
      const raw = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64, 'base64').toString();
      credentials = JSON.parse(raw);
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      credentials = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    }
  } catch (err) {
    console.error('Erro ao parsear credenciais do Google Calendar:', err.message);
    enabled = false;
    return null;
  }

  if (!credentials || !credentials.client_email || !credentials.private_key) {
    console.warn('Google Calendar not configured - missing credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON or client email & private key.');
    enabled = false;
    return null;
  }

  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );

  calendarClient = google.calendar({ version: 'v3', auth: jwtClient });

  if (process.env.GOOGLE_CALENDAR_ID) calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (process.env.GOOGLE_CALENDAR_TIMEZONE) timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE;

  return calendarClient;
}

async function createGoogleEvent({ booking, teacher, student }) {
  if (!enabled) return null;
  if (!calendarClient) initClient();
  if (!calendarClient) return null;

  try {
    // booking.date is Date, booking.time is "HH:mm"
    const [hourStr, minuteStr] = String(booking.time).split(':');
    const start = new Date(booking.date);
    start.setHours(parseInt(hourStr || '0', 10), parseInt(minuteStr || '0', 10), 0, 0);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 30);

    const summary = `Reserva: ${student.nome_completo} - ${teacher.nome_completo}`;
    const description = `Motivo: ${booking.reason}\nProfessor: ${teacher.nome_completo} <${teacher.email}>\nAluno: ${student.nome_completo} <${student.email}>`;

    const event = {
      summary,
      description,
      start: { dateTime: start.toISOString(), timeZone },
      end: { dateTime: end.toISOString(), timeZone },
      attendees: [],
    };

    if (teacher.email) event.attendees.push({ email: teacher.email });
    if (student.email) event.attendees.push({ email: student.email });

    const res = await calendarClient.events.insert({
      calendarId,
      requestBody: event,
    });

    return { id: res.data.id, calendarId };
  } catch (err) {
    console.error('Erro ao criar evento no Google Calendar:', err.message);
    return null;
  }
}

module.exports = {
  enabled: () => enabled,
  initClient,
  createGoogleEvent,
};
