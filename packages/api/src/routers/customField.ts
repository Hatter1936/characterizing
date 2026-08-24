import { z } from 'zod'
import { protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const createSchema = z.object({
    fieldName: z
        .string({ required_error: 'Name field is empty.' })
        .min(1),

    characterId: z
        .string(),

    fieldType: z
        .string(),

    fieldValue: z
        .string(),
})

export const create = protectedProcedure.input(createSchema).mutation( async ({ input, ctx }) => {
    const { fieldName, characterId, fieldType, fieldValue } = input
    const character = await ctx.prisma.character.findUnique({
        where: { id: characterId }
    })

    if (!character || character.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Character not found.' })
    }

    const newCustomField = await ctx.prisma.customField.create({
        data: { fieldName, characterId, fieldType, fieldValue }
    })

    return {
        success: true,
        customField: {
            id: newCustomField.id,
            characterId: newCustomField.characterId,
            fieldName: newCustomField.fieldName,
            fieldType: newCustomField.fieldType,
            fieldValue: newCustomField.fieldValue
        }
    }
})

const updateSchema = z.object({
    id: z
        .string({ required_error: 'ID is required.'}),

    fieldName: z
        .string({ required_error: 'Name field is empty.' })
        .min(1)
        .optional(),

    fieldType: z
        .string()
        .optional(),

    fieldValue: z
        .string()
        .optional(),
})

export const update = protectedProcedure.input(updateSchema).mutation( async ({ input, ctx }) => {
    const { id, fieldName, fieldType, fieldValue } = input
    
    const customField = await ctx.prisma.customField.findUnique({
        where: { id: input.id }
    })

    if (!customField) {
        throw new TRPCError({ code: 'NOT_FOUND',  message: 'Custom field not found.'})
    }

    const  character = await ctx.prisma.character.findUnique({
        where: { id: customField.characterId }
    })

    if (!character || character.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Character field not found.'})
    }

    const updated = await ctx.prisma.customField.update({
        where: { id: input.id },
        data: { fieldName, fieldType, fieldValue }
    })

    return {
        success: true,
        customField: updated
    }
})

const deleteSchema = z.object({
    id: z
        .string({ required_error: 'ID id required.' }),
})

export const remove = protectedProcedure.input(deleteSchema).mutation( async ({ input, ctx }) => {
    const { id } = input

    const customField = await ctx.prisma.customField.findUnique({
        where: { id: input.id }
    })

    if (!customField) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'customField not found.'
        })
    }

    const  character = await ctx.prisma.character.findUnique({
        where: { id: customField.characterId }
    })
    if (!character || character.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Character field not found.'})
    }

    await ctx.prisma.customField.delete({
        where: { id },
    });

    return {
        success: true
    }
})