import { z } from 'zod'
import { protectedProcedure } from '../trpc'

const createSchema = z.object({
    name: z
        .string({ required_error: 'Name field is empty.' })
        .min(1),

    fields: z
        .any(),
})

export const create = protectedProcedure.input(createSchema).mutation( async ({ input, ctx }) => {
    const { name, fields } = input

    const userId = ctx.user.id

    const newTemplates = await ctx.prisma.template.create({
        data: { name, fields, userId }
    })

    return {
        success: true,
        templates: {
            id: newTemplates.id,
            userId: newTemplates.userId,
            name: newTemplates.name,
            fields: newTemplates.fields,
            isDefault: false
        }
    }
})

export const list = protectedProcedure.query( async ({ ctx }) => {
    const templates = await ctx.prisma.template.findMany({
        where: {
            OR: [
                { isDefault: true },
                { userId: ctx.user.id },
            ]
        }
    })

    return {
        success: true,
        templates
    }
})