import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/naracija')({
  server: { handlers: {
    POST: async ({ request }) => {
      const { handleNarration } = await import('@/lib/narration.server')
      return handleNarration(request)
    },
  } },
})
