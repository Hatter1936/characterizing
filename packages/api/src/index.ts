import { router, publicProcedure } from './trpc'
import { register, login, logout, me } from './routers/auth'
import { create, list, getById, update, remove } from './routers/universe'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),
  auth: router({
    register,
    login,
    logout,
    me,
  }),
  universe: router({
    create,
    list,
    getById,
    update,
    remove,
  })
})

export type AppRouter = typeof appRouter