/** Short parts keep synthesis requests bounded and start playback sooner. */
export function narrationParts(title: string, body: string, limit = 2400): string[] {
  if (!body.trim()) return []
  const text = `${title.trim()}.\n${body.trim()}`
  const parts: string[] = []
  let remaining = text
  while (remaining.length > limit) {
    const candidate = remaining.slice(0, limit)
    const sentence = Math.max(candidate.lastIndexOf('. '), candidate.lastIndexOf('! '), candidate.lastIndexOf('? '), candidate.lastIndexOf('\n'))
    const boundary = sentence > limit / 2 ? sentence + 1 : candidate.lastIndexOf(' ') > limit / 2 ? candidate.lastIndexOf(' ') : limit
    parts.push(remaining.slice(0, boundary).trim())
    remaining = remaining.slice(boundary).trim()
  }
  if (remaining) parts.push(remaining)
  return parts
}
