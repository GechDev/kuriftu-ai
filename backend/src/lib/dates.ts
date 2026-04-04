/** Normalize to UTC midnight for the same calendar day as the input's UTC date. */
export function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function parseDateOnly(input: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!m) throw new Error("INVALID_DATE");
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  return new Date(Date.UTC(y, mo, day));
}

/** Number of nights: exclusive checkout day (hotel convention). */
export function nightCount(checkIn: Date, checkOut: Date): number {
  const a = utcDay(checkIn).getTime();
  const b = utcDay(checkOut).getTime();
  const days = Math.round((b - a) / 86400000);
  return Math.max(0, days);
}

export function startOfTodayUtc(): Date {
  const n = new Date();
  return utcDay(n);
}

export function isNightBookedForDay(
  day: Date,
  bookingCheckIn: Date,
  bookingCheckOut: Date
): boolean {
  const d = utcDay(day).getTime();
  const in0 = utcDay(bookingCheckIn).getTime();
  const out0 = utcDay(bookingCheckOut).getTime();
  return d >= in0 && d < out0;
}
