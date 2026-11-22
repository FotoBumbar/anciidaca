import { useEffect, useState } from 'react'
import { photoFallbackUrl, photoUrl, randomPhotos, type DriveItem } from '@/data/photos'
import { cn } from '@/lib/utils'

/** A Drive image in its own natural format (no cropping), with a fallback thumbnail host. */
export function DriveImg({ id, w = 800, className, alt = '', eager }: { id: string; w?: number; className?: string; alt?: string; eager?: boolean }) {
  const [src, setSrc] = useState(photoUrl(id, w))
  useEffect(() => setSrc(photoUrl(id, w)), [id, w])
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => src !== photoFallbackUrl(id, w) && setSrc(photoFallbackUrl(id, w))}
      className={className}
    />
  )
}

/** Shows the whole photo inside any frame: blurred copy behind, real photo "contained" on top. */
export function FitPhoto({ id, w = 1600, className, eager, kenburns }: { id: string; w?: number; className?: string; eager?: boolean; kenburns?: boolean }) {
  return (
    <div className={cn('relative overflow-hidden bg-secondary', className)}>
      <DriveImg id={id} w={200} className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
      <DriveImg id={id} w={w} eager={eager} className={cn('relative h-full w-full object-contain', kenburns && 'kenburns')} />
    </div>
  )
}

/** A few different photos of us take turns — a new set on every visit. */
export function PhotoRotator({ count = 6, interval = 5500, className, items }: { count?: number; interval?: number; className?: string; items?: DriveItem[] }) {
  const [set, setSet] = useState<DriveItem[]>([])
  const [i, setI] = useState(0)

  useEffect(() => setSet(items ?? randomPhotos(count)), [count, items])
  useEffect(() => {
    if (set.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % set.length), interval)
    return () => clearInterval(t)
  }, [set, interval])

  return (
    <div className={cn('relative overflow-hidden bg-secondary', className)}>
      {set.map((p, idx) => (
        <div key={p.id} className={cn('absolute inset-0 transition-opacity duration-[1400ms]', idx === i ? 'opacity-100' : 'opacity-0')}>
          {Math.abs(idx - i) <= 1 || (i === set.length - 1 && idx === 0) ? (
            <FitPhoto id={p.id} className="h-full w-full" eager={idx === 0} />
          ) : null}
        </div>
      ))}
      {set.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {set.map((p, idx) => (
            <button
              key={p.id}
              aria-label={`Slika ${idx + 1}`}
              onClick={() => setI(idx)}
              className={cn('h-1.5 rounded-full transition-all', idx === i ? 'w-6 bg-primary' : 'w-1.5 bg-white/50')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
