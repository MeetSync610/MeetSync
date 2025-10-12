export interface Block {
  id?: number;       // id interno de tu backend
  googleId?: string; // id de Google Calendar
  day: string;
  start: string;
  finish: string;
  summary: string;
  color: string;
}
