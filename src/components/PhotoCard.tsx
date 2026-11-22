import { DriveImg } from './Photo'
import { photoPersonality, specialDayFor, type DriveItem } from '@/data/photos'
import { useStore } from '@/data/store'

/** Polaroid-style card: the photo in its natural shape, plus its own emoji, tilt and tape. */
export function PhotoCard({ photo, onOpen }: { photo: DriveItem; onOpen: () => void }) {
  const { memories, comments } = useStore()
  const p = photoPersonality(photo.id)
  const special = specialDayFor(photo.date)
  const memory = memories[photo.id]
  const count = comments.filter((c) => c.photoId === photo.id).length

  return (
    <button
      onClick={onOpen}
      className="group relative block w-full rounded-sm bg-[#fffdfa] p-2 pb-3 text-left text-[#1a1212] shadow-[0_10px_30px_rgba(125,83,78,0.10)] transition duration-300 hover:z-10 hover:!rotate-0 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(125,83,78,0.16)]"
      style={{ transform: `rotate(${p.tilt * 0.6}deg)` }}
    >
      <span className="absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-4deg] opacity-80" style={{ background: p.tape }} aria-hidden />
      <DriveImg id={photo.id} w={600} className="block h-auto w-full bg-[#ddd0b8]" />
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <span className="font-hand truncate text-lg leading-none">{memory?.title || special?.label || ''}</span>
        <span className="flex shrink-0 items-center gap-1 text-sm">
          {count > 0 && <span className="text-xs">💬{count}</span>}
          {special && <span>{special.emoji}</span>}
          <span className="transition group-hover:scale-125">{p.emoji}</span>
        </span>
      </div>
    </button>
  )
}
