export function Stamps({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="stamps" aria-label={`${filled} de ${total} sellos`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < filled ? 'stamp filled' : 'stamp'} />
      ))}
    </div>
  )
}
