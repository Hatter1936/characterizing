import { z } from 'zod';
import { protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const createSchema = z.object({
    // валидация имени
    name: z
        .string({ required_error: 'Name is empty.'})
        .min(1, 'A name cannot be empty.')
        .max(255, 'Name is too long.'),

    // валидация описания (опционально)
    description: z.string().optional(),

    // валдация ссылки картинки
    coverImageUrl: z.string().url('Invalid URL format.').optional(),
})

export const create = protectedProcedure.input(createSchema).mutation(async ({ input, ctx }) => {
    const { name, description, coverImageUrl } = input

    const userId = ctx.user.id

    const newUniverse = await ctx.prisma.universe.create({
        data: { name, description, coverImageUrl, userId }
    });

    return {
        success: true,
        universe: {
            id: newUniverse.id,
            name: newUniverse.name,
            coverImageUrl: newUniverse.coverImageUrl,
            description: newUniverse.description,
            userId: newUniverse.userId
        }
    }
})

export const list = protectedProcedure.query(async ({ ctx }) => {
    const universes = await ctx.prisma.universe.findMany({
        where: { userId: ctx.user.id }
    })

    return {
        success: true,
        universes
    }
})

const getByIdSchema = z.object({
    id: z.string()
})

export const getById = protectedProcedure.input(getByIdSchema).query(async ({ input, ctx }) => {
    const universe = await ctx.prisma.universe.findUnique({
        where: { id: input.id }
    })

    if (!universe || universe.userId != ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Universe not found.'
        })
    }
    
    return {
        success: true,
        universe
    }
})

const updateSchema = z.object({
    // валидация  id
    id: z.string({ required_error: 'ID is required.' }),

    // валидация имени
    name: z
        .string({ required_error: 'Name is required.' })
        .min(1, 'A name cannot be empty.')
        .max(255, 'Name is too long.')
        .optional(),

    // валидация описания (опционально)
    description: z.string().optional(),

    // валдация ссылки картинки
    coverImageUrl: z.string().url('Invalid URL format.').optional(),
})

export const update = protectedProcedure.input(updateSchema).mutation(async ({ input, ctx }) => {
    const { id, name, description, coverImageUrl } = input

    const universe = await ctx.prisma.universe.findUnique({
        where: { id: input.id }
    })

    if (!universe || universe.userId != ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Universe not found.'
        })
    }

    const updated = await ctx.prisma.universe.update({
        where: { id },
        data: { 
            name,
            description, 
            coverImageUrl,
        }
    });

    return {
        success: true,
        universe: updated
    }
})

const deleteSchema = z.object({
    // валидация  id
    id: z.string({ required_error: 'ID is required.' }),
})

export const remove = protectedProcedure.input(deleteSchema).mutation(async ({ input, ctx }) => {
    const { id } = input

    const universe = await ctx.prisma.universe.findUnique({
        where: { id: input.id }
    })

    if (!universe || universe.userId != ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Universe not found.'
        })
    }

    await ctx.prisma.universe.delete({
        where: { id },
    });

    return {
        success: true
    }
})