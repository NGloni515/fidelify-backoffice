import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useEffectEvent, useState, type FormEvent } from 'react'
import { passesApi } from '../api/client'
import { Stamps } from '../components/Stamps'

export function CashierPage() {
  const [serial, setSerial] = useState<string | null>(null)
  const [manual, setManual] = useState('')
  const [scanning, setScanning] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const pass = useQuery({
    queryKey: ['pass', serial],
    queryFn: () => passesApi.get(serial!),
    enabled: !!serial,
    retry: false,
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pass', serial] })

  const stamp = useMutation({
    mutationFn: () => passesApi.stamp(serial!),
    onSuccess: (r) => {
      setNotice(r.rewardEarned ? '¡Completó la tarjeta! Tiene un premio disponible.' : 'Sello agregado.')
      void refresh()
    },
  })

  const redeem = useMutation({
    mutationFn: () => passesApi.redeem(serial!),
    onSuccess: () => {
      setNotice('Premio canjeado.')
      void refresh()
    },
  })

  const onScan = useEffectEvent((text: string) => {
    select(text)
    setScanning(false)
  })

  useEffect(() => {
    if (!scanning) return
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 240 }, false)
    scanner.render(
      (text) => onScan(text),
      () => {},
    )
    return () => {
      scanner.clear().catch(() => {})
    }
  }, [scanning])

  function select(value: string) {
    setNotice(null)
    stamp.reset()
    redeem.reset()
    setSerial(value.trim().toUpperCase())
  }

  function onManualSubmit(e: FormEvent) {
    e.preventDefault()
    if (manual.trim()) select(manual)
  }

  const error = pass.error ?? stamp.error ?? redeem.error
  const busy = stamp.isPending || redeem.isPending

  return (
    <section>
      <h1>Caja</h1>
      <p className="muted">Escanea la tarjeta del cliente desde su celular.</p>

      <div className="card">
        {scanning ? (
          <>
            <div id="qr-reader" />
            <button className="secondary" onClick={() => setScanning(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={() => setScanning(true)}>Escanear código QR</button>
        )}

        <form className="row" onSubmit={onManualSubmit}>
          <input
            placeholder="o escribe el código, ej. FL-ABC123…"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button type="submit" className="secondary">
            Buscar
          </button>
        </form>
      </div>

      {error && <div className="alert error">{error.message}</div>}
      {notice && <div className="alert ok">{notice}</div>}

      {pass.data && (
        <div className="card">
          <h2>{pass.data.customer.name}</h2>
          <p className="muted">{pass.data.program.name}</p>
          <Stamps filled={pass.data.balance} total={pass.data.program.stampsRequired} />
          <p>
            Premios disponibles: <strong>{pass.data.rewardsReady}</strong> ({pass.data.program.rewardText})
          </p>
          <div className="row">
            <button disabled={busy} onClick={() => stamp.mutate()}>
              + Dar sello
            </button>
            <button
              className="secondary"
              disabled={busy || pass.data.rewardsReady < 1}
              onClick={() => redeem.mutate()}
            >
              Canjear premio
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
