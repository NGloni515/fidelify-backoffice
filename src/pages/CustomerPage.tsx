import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { customersApi, passesApi, type CustomerDetail } from '../api/client'
import { Stamps } from '../components/Stamps'
import { formatCalendarDate, formatDate, formatDateTime, movementLabel } from '../format'

export function CustomerPage() {
  const { id = '' } = useParams()
  const customer = useQuery({ queryKey: ['customer', id], queryFn: () => customersApi.get(id), retry: false })

  return (
    <section>
      <Link to="/clientes" className="back">
        ← Clientes
      </Link>
      {customer.isPending && <p className="muted">Cargando…</p>}
      {customer.error && <div className="alert error">{customer.error.message}</div>}
      {customer.data && <Detail customer={customer.data} />}
    </section>
  )
}

function Detail({ customer }: { customer: CustomerDetail }) {
  return (
    <>
      <h1>{customer.name}</h1>
      <p className="muted">
        {customer.phone}
        {customer.email && ` · ${customer.email}`}
      </p>

      <div className="card">
        <dl className="facts">
          <dt>Se inscribió</dt>
          <dd>{formatDate(customer.joinedAt)}</dd>
          <dt>Cumpleaños</dt>
          <dd>{customer.birthDate ? formatCalendarDate(customer.birthDate) : 'No lo dejó'}</dd>
          <dt>Aceptó el uso de sus datos</dt>
          <dd>{formatDateTime(customer.consentAt)}</dd>
        </dl>
      </div>

      {customer.passes.length === 0 && <div className="card empty">No tiene una tarjeta activa.</div>}
      {customer.passes.map((pass) => (
        <PassSection key={pass.serialNumber} customerId={customer.id} pass={pass} />
      ))}
    </>
  )
}

function PassSection({ customerId, pass }: { customerId: string; pass: CustomerDetail['passes'][number] }) {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)

  const adjust = useMutation({
    mutationFn: (input: { stamps: number; note: string }) => passesApi.adjust(pass.serialNumber, input.stamps, input.note),
    onSuccess: (result) => {
      setNotice(
        result.rewardEarned ? 'Ajuste guardado. Con él completó la tarjeta: tiene un premio disponible.' : 'Ajuste guardado.',
      )
      void queryClient.invalidateQueries({ queryKey: ['customer', customerId] })
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  function onAdjust(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    setNotice(null)
    adjust.mutate(
      {
        stamps: Number(form.get('direction')) * Number(form.get('count')),
        note: String(form.get('note')).trim(),
      },
      { onSuccess: () => formElement.reset() },
    )
  }

  return (
    <>
      {notice && <div className="alert ok">{notice}</div>}

      <div className="card">
        <h2>{pass.program.name}</h2>
        <p className="muted">Código {pass.serialNumber}</p>
        <Stamps filled={pass.balance} total={pass.program.stampsRequired} />
        <p>
          Premios disponibles: <strong>{pass.rewardsReady}</strong> ({pass.program.rewardText})
        </p>
      </div>

      <div className="card">
        <h2>Historial</h2>
        {pass.movements.length === 0 ? (
          <p className="muted">Todavía no tiene sellos ni canjes.</p>
        ) : (
          <ul className="list">
            {pass.movements.map((movement, i) => (
              <li key={`${movement.at}-${i}`} className="list-item item-info">
                <strong>{movementLabel(movement.type, movement.amount)}</strong>
                <span className="muted">
                  {formatDateTime(movement.at)}
                  {movement.staffName && ` · ${movement.staffName}`}
                </span>
                {movement.note && <span>{movement.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="card form-stack" onSubmit={onAdjust}>
        <h2>Ajustar sellos</h2>
        <p className="muted">Para corregir un error de la caja. Queda en el historial con tu nombre y el motivo.</p>
        <div className="row">
          <label>
            Qué hacer
            <select name="direction" defaultValue="1">
              <option value="1">Sumar sellos</option>
              <option value="-1">Quitar sellos</option>
            </select>
          </label>
          <label>
            Cuántos
            <input name="count" type="number" inputMode="numeric" min={1} max={20} defaultValue={1} required />
          </label>
        </div>
        <label>
          Motivo
          <input name="note" required minLength={3} maxLength={200} placeholder="Ej.: la caja olvidó dar un sello" />
        </label>
        {adjust.error && <div className="alert error">{adjust.error.message}</div>}
        <button type="submit" disabled={adjust.isPending}>
          {adjust.isPending ? 'Guardando…' : 'Guardar ajuste'}
        </button>
      </form>
    </>
  )
}
