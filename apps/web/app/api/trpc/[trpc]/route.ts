import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@characterizing/api'
import { createContext } from '@characterizing/api/src/trpc'

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    responseMeta(opts) {
      const token = opts.ctx?.resHeaders?.token
      if (token) {
        return {
          headers: {
            'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
          },
        }
      }
      return {}
    },
  })
  return response
}

export { handler as GET, handler as POST }