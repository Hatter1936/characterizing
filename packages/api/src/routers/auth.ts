import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const registerSchema = z.object({
    // валидация email
    email: z
        .string({ required_error: 'Email is empty.'})
        .min(1, 'An email cannot be empty.')
        .email('The email is incorrect.'),
    
    // валидация пароля
    password: z
        .string({ required_error: 'Password is empty.'})
        .min(6, 'The password must be at least 6 characters long.')
    })

// основная логика, муташн
export const register = publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    // парсим полученый ответ
    const { email, password } = input;

    // проверка на дубликат имейла в БД
    const userExists = await ctx.prisma.user.findUnique({
        where: { email },
    });

    // если да - ошибка 
    if (userExists) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists.'
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // создание пользователя в БД
    const newUser = await ctx.prisma.user.create({
        data: { email, passwordHash }
    });

    // токен
    const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    // сохранение токена 
    await ctx.prisma.session.create({
        data: {
            userId: newUser.id,
            token,
            expiresAt: new Date(Date.now() + 604800000),
        }
    })

    // ответ
    ctx.resHeaders.token = token
    return {
        success: true,
        token,
        user: {
            id: newUser.id,
            email: newUser.email,
        }
    }
})

const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is empty.'})
        .min(1, 'An email cannot be empty.')
        .email('The email is incorrect.'),

    password: z
        .string({ required_error: 'Password is empty.'})
        .min(6, 'The password must be at least 6 characters long.')
    })

// основная логика входа 
export const login = publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    const userExist = await ctx.prisma.user.findUnique({
        where: { email },
    });

    if (!userExist) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found.'
        });
    }

    const isPasswordValid = await bcrypt.compare(password, userExist.passwordHash);
    if (!isPasswordValid) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Incorrect password.'
        })
    }

    const token = jwt.sign(
        { userId: userExist.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d'}
    )

    await ctx.prisma.session.create({
        data: {
            userId: userExist.id,
            token,
            expiresAt: new Date(Date.now() + 604800000),
        }
    })

    ctx.resHeaders.token = token
    return {
        success: true,
        token,
        user: {
            id: userExist.id,
            email: userExist.email,
        }
    }
})

const logoutSchema = z.object({
    token: z.string()
})

export const logout = publicProcedure.input(logoutSchema).mutation(async ({ input, ctx }) => {
    const session = await ctx.prisma.session.findUnique({
        where: { token: input.token }
    })

    if (!session) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Session not found.'
        })
    }

    await ctx.prisma.session.delete({
        where: { token: input.token }
    })

    return {
        success: true
    }
})

export const me = protectedProcedure.query(async ({ ctx }) => {
    return {
        success: true,
        user: {
            id: ctx.user.id,
            email: ctx.user.email,
            name: ctx.user.name,
        }
    }
})