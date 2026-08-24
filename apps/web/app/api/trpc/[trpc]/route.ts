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
      const token = opts.data?.[0]?.result?.data?.token
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

  const cloned = response.clone()
  const body = await cloned.json()

  if (body?.result?.data?.token) {
    delete body.result.data.token
    return new Response(JSON.stringify(body), {
      status: response.status,
      headers: response.headers,
    })
  }

  return response
}

export { handler as GET, handler as POST }