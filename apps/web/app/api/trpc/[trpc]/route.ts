import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@characterizing/api'
import { createContext } from '@characterizing/api/src/trpc'

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  })

  const body = await response.json()

  if (body?.result?.data?.token) {
    const token = body.result.data.token
    delete body.result.data.token

    return new Response(JSON.stringify(body), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      },
    })
  }

  return response
}

export { handler as GET, handler as POST }