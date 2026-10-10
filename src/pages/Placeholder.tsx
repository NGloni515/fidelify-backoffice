interface Props {
  title: string
  description: string
}

/** Sección todavía no construida: deja claro qué va a contener. */
export function Placeholder({ title, description }: Props) {
  return (
    <section>
      <h1>{title}</h1>
      <p className="muted">{description}</p>
      <div className="card empty">Próximamente</div>
    </section>
  )
}
