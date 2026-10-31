import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { dashboardApi, type Dashboard } from '../api/client'
import { formatDate, plural } from '../format'

export function HomePage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get })

  return (
    <section>
      <h1>Inicio</h1>
      <p className="muted">Cómo va tu tarjeta de sellos.</p>
      {dashboard.isPending && <p className="muted">Cargando…</p>}
      {dashboard.error && <div className="alert error">{dashboard.error.message}</div>}
      {dashboard.data && <Summary data={dashboard.data} />}
    </section>
  )
}

function Summary({ data }: { data: Dashboard }) {
  const days = data.periodDays
  return (
    <>
      <div className="stats">
        <Stat
          label="Clientes"
          value={data.customers.total}
          detail={`${plural(data.customers.newInPeriod, 'nuevo', 'nuevos')} en ${days} días`}
        />
        <Stat
          label="Sellos dados hoy"
          value={data.today.stamps}
          detail={plural(data.today.rewardsRedeemed, 'premio canjeado', 'premios canjeados')}
        />
        <Stat
          label={`Sellos en ${days} días`}
          value={data.period.stamps}
          detail={plural(data.period.rewardsRedeemed, 'premio canjeado', 'premios canjeados')}
        />
        <Stat label="Premios por canjear" value={data.rewardsPending} detail="Ganados y todavía sin cobrar" />
      </div>

      <div className="card">
        <h2>Quiénes vienen más</h2>
        <p className="muted">Los que más días vinieron en los últimos {days} días.</p>
        {data.topCustomers.length === 0 ? (
          <p className="muted">Nadie vino en los últimos {days} días.</p>
        ) : (
          <ul className="list">
            {data.topCustomers.map((customer) => (
              <li key={customer.id} className="list-item">
                <Link to={`/clientes/${customer.id}`} className="item-link">
                  <strong>{customer.name}</strong>
                  <span className="item-info item-aside">
                    <span>{plural(customer.visits, 'visita', 'visitas')}</span>
                    <span className="muted">Última: {formatDate(customer.lastVisitAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Dejaron de venir</h2>
        <p className="muted">
          {data.customers.lapsed === 0
            ? `Nadie lleva más de ${days} días sin venir.`
            : `${plural(data.customers.lapsed, 'cliente lleva', 'clientes llevan')} más de ${days} días sin venir. Primero, los que dejaron de venir hace menos.`}
        </p>
        {data.lapsedCustomers.length > 0 && (
          <ul className="list">
            {data.lapsedCustomers.map((customer) => (
              <li key={customer.id} className="list-item">
                <Link to={`/clientes/${customer.id}`} className="item-link">
                  <strong>{customer.name}</strong>
                  <span className="muted item-aside">
                    {customer.lastVisitAt
                      ? `Última visita: ${formatDate(customer.lastVisitAt)}`
                      : `Se inscribió el ${formatDate(customer.joinedAt)} y no volvió`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {data.customers.lapsed > data.lapsedCustomers.length && (
          <p className="hint">
            Se muestran {data.lapsedCustomers.length} de {data.customers.lapsed}.
          </p>
        )}
      </div>
    </>
  )
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="card stat">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value.toLocaleString('es-EC')}</strong>
      <span className="hint">{detail}</span>
    </div>
  )
}
