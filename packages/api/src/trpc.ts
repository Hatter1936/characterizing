import { initTRPC } from '@trpc/server';
import { prisma } from '@characterizing/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { TRPCError } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    let user: { id: string; email: string; name: string | null; avatarUrl: string | null } | null = null
    const resHeaders: Record<string, string> = {}

    // cookie
    const rawCookies = opts.req.headers.get('cookie') || '';
    const cookies = cookie.parse(rawCookies)
    const token = cookies.token

    console.log('cookies: ', rawCookies)
    console.log('token: ', token)

    // далее - проверяем jwt токен
    if (token){
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string}
            if (payload && payload.userId) {
                user = await prisma.user.findUnique({ 
                    where: { id: payload.userId } 
                })
            }
        } catch (error) {
            console.error('Ошибка верификации JWT: ', error)
        }
    }
    return { prisma, user, resHeaders }
}

// тип процедуры
type Context = Awaited<ReturnType<typeof createContext>>
// контекст
const t = initTRPC.context<Context>().create()
// пока низнаю
export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
export const protectedProcedure = t.procedure.use(
    middleware(async ({ ctx, next }) => {
        if (!ctx.user) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'User not found.'
            }) 
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
            }
        })
    })
)