import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@characterizing/api'
import { createContext } from '@characterizing/api/src/trpc'

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  })
}

export { handler as GET, handler as POST }