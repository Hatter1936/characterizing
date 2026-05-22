import { initTRPC } from '@trpc/server';
import { prisma } from '@characterizing/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const createContext = async () => {
    let user = null

    // // cookie
    // const cookies = cookie.parse(user || '');
    // const token = cookies.token

    // // далее - проверяем jwt токен
    // if (!token){
    //     return { user: null }
    // }
    // try {
    //     const payload = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string}
    //     if (payload && payload.userId) {
    //         user = await prisma.user.findUnique({ 
    //             where: { id: payload.userId } 
    //         })
    //     }
    // } catch (error) {
    //     console.error('Ошибка верификации JWT: ', error)
    // }
    return { prisma, user }
}

// тип процедуры
type Context = Awaited<ReturnType<typeof createContext>>
// контекст
const t = initTRPC.context<Context>().create()
// пока низнаю
export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware