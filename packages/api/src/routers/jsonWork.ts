import { z } from 'zod'
import { protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const exportSchema = z.object({
    id: z
        .string({ required_error: 'ID id required.' }),
})

export const exportJson = protectedProcedure.input(exportSchema).query( async ({ input, ctx }) => {
    const { id } = input

    const character = await ctx.prisma.character.findUnique({
        where: { id: id }
    })

    if (!character || character.userId !== ctx.user.id) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Character not found.'
        })
    }

    const customFields = await ctx.prisma.customField.findMany({
        where: { characterId: character.id }
    })

    return {
        success: true,
        data: {
            version: 1,
            character,
            customFields,
        }
    }
})

const importSchema = z.object({
    jsonString: z
        .string({ required_error: 'JSON string is required.' })
})


export const importJson = protectedProcedure.input(importSchema).mutation( async ({ input, ctx }) => {
    const { jsonString } = input
    const userId = ctx.user.id

    let parsedData: any
    try {
        parsedData = JSON.parse(jsonString)
    } catch (e) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid JSON format.'
        })
    }

    const newCharacter = await ctx.prisma.$transaction(async (tx: any) => {
        const pers = parsedData.character

        if (!pers) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Character data is missing in JSON.'
            })
        }

        const createCharacter = await tx.character.create({
            data: {
                name: pers.name,
                surname: pers.surname,
                description: pers.description,
                age: pers.age,
                height: pers.height,
                weight: pers.weight,
                character: pers.character,
                imageUrl: pers.imageUrl,
                isPublic: pers.isPublic || false,
                userId: userId,
            }
        })

        if (parsedData.customFields && Array.isArray(parsedData.customFields)) {
            for (const field of parsedData.customFields) {
                await tx.customField.create({
                    data: {
                        fieldName: field.fieldName,
                        fieldType: field.fieldType,
                        fieldValue: field.fieldValue,
                        characterId: createCharacter.id
                    }
                })
            }
        }

        return createCharacter
    })

    return {
        success: true,
        characterId: newCharacter.id
    }
})