const date = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' })
const dateTime = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' })
// The backend sends a birthday as YYYY-MM-DD; read and printed in UTC so the
// local timezone cannot move it to the day before.
const calendarDate = new Intl.DateTimeFormat('es-EC', { dateStyle: 'long', timeZone: 'UTC' })

export const formatDate = (iso: string) => date.format(new Date(iso))
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatCalendarDate = (ymd: string) => calendarDate.format(new Date(`${ymd}T00:00:00Z`))

export function stampsLabel(count: number) {
  return `${count} ${count === 1 ? 'sello' : 'sellos'}`
}

export function movementLabel(type: 'STAMP' | 'REDEEM' | 'ADJUST', amount: number) {
  if (type === 'REDEEM') return 'Premio canjeado'
  const signed = `${amount > 0 ? '+' : '-'}${stampsLabel(Math.abs(amount))}`
  return type === 'ADJUST' ? `Ajuste: ${signed}` : signed
}
