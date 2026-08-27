import { z } from 'zod'
import { protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const createSchema = z.object({
    name: z
        .string({ required_error: 'Name is empty.' })
        .min(1),

    universeId: z
        .string()
        .optional(),

    surname: z
        .string()
        .optional(),

    description: z
        .string()
        .optional(),

    age: z
        .number()
        .min(0)
        .max(999999)
        .optional(),

    height: z
        .number()
        .min(0)
        .max(999999)
        .optional(),

    weight: z
        .number()
        .min(0)
        .max(999999)
        .optional(),

    character: z
        .string()
        .optional(),

    imageUrl: z
        .string()
        .url('Invalid URL format.')
        .optional(),
})

export const create = protectedProcedure.input(createSchema).mutation( async ({ input, ctx }) => {
    const { name, universeId, surname, description, age, height, weight, character, imageUrl } = input

    const userId = ctx.user.id

    const newCharacter = await ctx.prisma.character.create({
        data: { name, universeId, surname, description, age, height, weight, character, imageUrl, userId }
    })

    return {
        success: true,
        character: {
            id: newCharacter.id,
            name: newCharacter.name,
            universeId: newCharacter.universeId,
            surname: newCharacter.surname,
            description: newCharacter.description,
            age: newCharacter.age,
            height: newCharacter.height,
            weight: newCharacter.weight,
            character: newCharacter.character,
            imageUrl: newCharacter.imageUrl,
            userId: newCharacter.userId
        }
    }
})

const listSchema = z.object({
    name: z
        .string({ required_error: 'Name is empty.' })
        .optional(),

    universeId: z
        .string()
        .optional(),
})

export const list = protectedProcedure.input(listSchema).query( async ({ input, ctx }) => {
    const { name, universeId } = input

    const characters = await ctx.prisma.character.findMany({
        where: {
            userId: ctx.user.id,
            ...universeId && { universeId },
            ...name && { name: { contains: name, mode: 'insensitive' } },
        }
    })

    return {
        success: true,
        characters,
    }
})

const getByIdSchema = z.object({
    id: z
        .string(),
})

export const getById = protectedProcedure.input(getByIdSchema).query( async ({ input, ctx }) => {
    const character = await ctx.prisma.character.findUnique({
        where: { id: input.id }
    })

    if (!character || character.userId !== ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Character not found with provided criteria.'
        })
    }

    return {
        success: true,
        character,
    }
})

export const getPublic = publicProcedure.input(getByIdSchema).query( async ({ input, ctx }) => {
    const character = await ctx.prisma.character.findUnique({
        where: { id: input.id }
    })

    if (!character) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Character not found.'
        })
    }

    const resultCharacter = {
        id: input.id,
        name: character.name,
        surname: character.surname,
        description: character.description,
        age: character.age,
        height: character.height,
        weight: character.weight,
        character: character.character,
        imageUrl: character.imageUrl
    }

    return {
        success: true,
        character: resultCharacter
    }
})

const updateSchema = z.object({
    id: z
        .string({ required_error: 'ID is required.'}),

    name: z
        .string({ required_error: 'Name is empty.' })
        .min(1),

    universeId: z
        .string()
        .optional(),

    surname: z
        .string()
        .optional(),

    description: z
        .string()
        .optional(),

    age: z
        .number()
        .min(0)
        .max(999999)
        .optional(),

    height: z
        .number()
        .min(0)
        .max(999999)
        .optional(),

    weight: z
        .number()
        .min(0)
        .max(999999)
        .optional(),

    character: z
        .string()
        .optional(),

    imageUrl: z
        .string()
        .url('Invalid URL format.')
        .optional(),
})

export const update = protectedProcedure.input(updateSchema).mutation( async ({ input, ctx }) => {
    const { id, name, universeId, surname, description, age, height, weight, character, imageUrl } = input
   
    const updateCharacter = await ctx.prisma.character.findUnique({
        where: { id: id }
    })

    if (!updateCharacter || updateCharacter.userId != ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Character not found.'
        })
    }

    const updated = await ctx.prisma.character.update({
        where: { id },
        data: { name, universeId, surname, description, age, height, weight, character, imageUrl }
    })

    return {
        success: true,
        character: updated
    }
})

const deleteSchema = z.object({
    id: z
        .string({ required_error: 'ID id required.' }),
})

export const remove = protectedProcedure.input(deleteSchema).mutation( async ({ input, ctx }) => {
    const { id } = input

    const character = await ctx.prisma.character.findUnique({
        where: { id: input.id }
    })

    if (!character || character.userId != ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Character not found.'
        })
    }

    await ctx.prisma.character.delete({
        where: { id },
    });

    return {
        success: true
    }
})