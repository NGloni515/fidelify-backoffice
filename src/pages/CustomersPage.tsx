import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { customersApi, type CustomerSummary } from '../api/client'
import { formatDate } from '../format'

export function CustomersPage() {
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const list = useQuery({
    queryKey: ['customers', query, page],
    queryFn: () => customersApi.search(query, page),
    placeholderData: keepPreviousData,
  })

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setQuery(draft.trim())
    setPage(1)
  }

  const data = list.data
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <section>
      <h1>Clientes</h1>
      <p className="muted">Quiénes se inscribieron en tu tarjeta, cuántos sellos llevan y cuándo vinieron por última vez.</p>

      <form className="card search" onSubmit={onSearch}>
        <label>
          Buscar
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nombre, teléfono o código FL-…"
            autoComplete="off"
          />
        </label>
        <button type="submit">Buscar</button>
      </form>

      {list.error && <div className="alert error">{list.error.message}</div>}

      <div className="card">
        {list.isPending && <p className="muted">Cargando…</p>}
        {data && (
          <>
            <h2>
              {data.total} {data.total === 1 ? 'cliente' : 'clientes'}
              {query && ` para «${query}»`}
            </h2>
            {data.customers.length === 0 ? (
              <p className="muted">
                {query
                  ? 'Nadie coincide. Busca por nombre, por parte del teléfono o por el código de la tarjeta.'
                  : 'Todavía no hay clientes. Aparecen aquí cuando se inscriben con el QR del mostrador.'}
              </p>
            ) : (
              <ul className="list">
                {data.customers.map((customer) => (
                  <CustomerRow key={customer.id} customer={customer} />
                ))}
              </ul>
            )}
            {pages > 1 && (
              <div className="row pager">
                <button className="secondary" disabled={page <= 1 || list.isFetching} onClick={() => setPage(page - 1)}>
                  Anterior
                </button>
                <span className="muted">
                  Página {page} de {pages}
                </span>
                <button
                  className="secondary"
                  disabled={page >= pages || list.isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function CustomerRow({ customer }: { customer: CustomerSummary }) {
  const pass = customer.passes[0]
  return (
    <li className="list-item">
      <Link to={`/clientes/${customer.id}`} className="item-link">
        <span className="item-info">
          <strong>{customer.name}</strong>
          <span className="muted">{customer.phone}</span>
        </span>
        <span className="item-info item-aside">
          <span>
            {pass ? `${pass.balance} de ${pass.stampsRequired} sellos` : 'Sin tarjeta'}
            {pass && pass.rewardsReady > 0 && ` · ${pass.rewardsReady} ${pass.rewardsReady === 1 ? 'premio' : 'premios'}`}
          </span>
          <span className="muted">
            {customer.lastVisitAt ? `Última visita: ${formatDate(customer.lastVisitAt)}` : 'Todavía no vuelve'}
          </span>
        </span>
      </Link>
    </li>
  )
}
