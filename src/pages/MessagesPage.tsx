import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { notificationsApi, type MessageAudience, type MessagesOverview, type SentMessage } from '../api/client'
import { formatDateTime, plural } from '../format'

const AUDIENCE_LABEL: Record<MessageAudience, string> = {
  ALL: 'Todos tus clientes',
  LAPSED: 'Los que dejaron de venir',
  ONE_STAMP_LEFT: 'Los que están a un sello del premio',
}

const customers = (count: number) => plural(count, 'cliente', 'clientes')

export function MessagesPage() {
  const [notice, setNotice] = useState<string | null>(null)
  const overview = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.get })

  return (
    <section>
      <h1>Mensajes</h1>
      <p className="muted">
        Le llegan al celular a tus clientes, en la tarjeta que guardaron en su billetera. Quien no la guardó no los
        recibe.
      </p>

      {notice && <div className="alert ok">{notice}</div>}
      {overview.isPending && <p className="muted">Cargando…</p>}
      {overview.error && <div className="alert error">{overview.error.message}</div>}
      {overview.data && (
        <>
          <MessageForm data={overview.data} onSent={setNotice} />
          <History history={overview.data.history} />
        </>
      )}
    </section>
  )
}

function MessageForm({ data, onSent }: { data: MessagesOverview; onSent: (notice: string | null) => void }) {
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const [audience, setAudience] = useState<MessageAudience>('ALL')
  const size = data.audiences.find((a) => a.audience === audience)?.size ?? 0

  const send = useMutation({
    mutationFn: () => notificationsApi.send(text, audience),
    onSuccess: (sent) => {
      setText('')
      onSent(`Listo. Le llegó a ${sent.reached} de ${customers(sent.audienceSize)}.`)
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    onSent(null)
    if (!window.confirm(`¿Enviar este mensaje a ${customers(size)}? No se puede deshacer.`)) return
    send.mutate()
  }

  const { perDay, perWeek } = data.limits
  return (
    <form className="card form-stack" onSubmit={onSubmit}>
      <h2>Nuevo mensaje</h2>
      <p className="muted">
        Puedes enviar {plural(perDay, 'mensaje', 'mensajes')} por día y {perWeek} por semana. Más que eso se siente como
        spam, y tus clientes borran la tarjeta.
      </p>
      <label>
        Mensaje
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={data.maxLength}
          rows={3}
        />
        <span className="hint">
          {text.length} de {data.maxLength} caracteres. Corto y directo, como “Hoy 2x1 en conos”.
        </span>
      </label>
      <label>
        A quién
        <select value={audience} onChange={(e) => setAudience(e.target.value as MessageAudience)}>
          {data.audiences.map((a) => (
            <option key={a.audience} value={a.audience} disabled={a.size === 0}>
              {AUDIENCE_LABEL[a.audience]} ({customers(a.size)})
            </option>
          ))}
        </select>
      </label>
      {data.nextAvailableAt && (
        // No closing period: the time already ends in "a. m." or "p. m.".
        <p className="muted">Ya llegaste al límite. El próximo lo puedes enviar el {formatDateTime(data.nextAvailableAt)}</p>
      )}
      {send.error && <div className="alert error">{send.error.message}</div>}
      <button type="submit" disabled={send.isPending || data.nextAvailableAt !== null || size === 0}>
        {send.isPending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

function History({ history }: { history: SentMessage[] }) {
  return (
    <div className="card">
      <h2>Enviados</h2>
      {history.length === 0 ? (
        <p className="muted">Todavía no has enviado mensajes. Aquí vas a ver cada uno y a cuántos clientes les llegó.</p>
      ) : (
        <ul className="list">
          {history.map((sent) => (
            <li key={sent.id} className="list-item">
              <div className="item-info">
                <strong>{sent.message}</strong>
                <span className="muted">
                  {AUDIENCE_LABEL[sent.audience]} · {formatDateTime(sent.sentAt)}
                </span>
                <span>
                  Le llegó a {sent.reached} de {customers(sent.audienceSize)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
