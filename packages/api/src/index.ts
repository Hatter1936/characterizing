import { router, publicProcedure } from './trpc'
import { register, login, logout, me } from './routers/auth'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),
  auth: router({
    register,
    login,
    logout,
    me,
  })
})

export type AppRouter = typeof appRouter