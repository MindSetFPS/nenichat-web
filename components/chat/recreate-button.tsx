'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RecreateButton({ businessId }: { businessId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true)
          setError(null)
          try {
            const delRes = await fetch(`/api/infra/containers?business_id=${encodeURIComponent(businessId)}`, { method: 'DELETE' })
            if (!delRes.ok) {
              const body = await delRes.text()
              throw new Error(`Error al eliminar: ${delRes.status} ${body}`)
            }

            const postRes = await fetch('/api/infra/containers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ business_id: Number(businessId) })
            })
            if (!postRes.ok) {
              const body = await postRes.text()
              throw new Error(`Error al crear: ${postRes.status} ${body}`)
            }

            router.push('/wapp')
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Error desconocido'
            console.error('Error recreating container:', e)
            setError(message)
            setLoading(false)
          }
        }}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Recreando...' : 'Recrear contenedor'}
      </button>
      {error && (
        <p className="text-xs text-destructive max-w-xs">{error}</p>
      )}
    </div>
  )
}
