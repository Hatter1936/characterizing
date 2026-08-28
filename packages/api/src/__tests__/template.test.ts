import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'

function createMockContext() {
    return {
        prisma: {
            template: { create: jest.fn(), findMany: jest.fn() }
        },
        user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
        resHeaders: {},
    } as any
}

describe('template', () => {
    let ctx: ReturnType<typeof createMockContext>
    let caller: ReturnType<typeof appRouter.createCaller>

    beforeEach(() => {
        ctx = createMockContext()
        jest.clearAllMocks()
        caller = appRouter.createCaller(ctx)
    })

    test('create with autorization', async () => {
        const mockFields = [{ fieldName: 'Field Name', fieldType: 'text' }]

        ctx.prisma.template.create.mockResolvedValue({
            id: 'id-template',
            userId: 'user-id',
            name: 'Template Name',
            fields: mockFields,
            isDefault: false
        })

        const result = await caller.template.create({
            name: 'Template Name', 
            fields: mockFields as any
        })

        expect(result).toEqual({
            success: true,
            templates: {
                id: 'id-template',
                userId: 'user-id',
                name: 'Template Name',
                fields: mockFields,
                isDefault: false
            }
        })

        expect(ctx.prisma.template.create).toHaveBeenCalledWith({
            data: {
                name: 'Template Name',
                fields: mockFields,
                userId: 'user-id'
            }
        })
    })

    test('test list', async () => {
        ctx.prisma.template.findMany.mockResolvedValue([
            { id: '1', userId: 'admin', name: 'Template Default', fields: [], isDefault: true },
            { id: '2', userId: 'user', name: 'User Template', fields: [], isDefault: false }
        ])

        const result = await caller.template.list()

        expect(result).toEqual({
            success: true,
            templates: [
                { id: '1', userId: 'admin', name: 'Template Default', fields: [], isDefault: true },
                { id: '2', userId: 'user', name: 'User Template', fields: [], isDefault: false }
            ]
        })

        expect(ctx.prisma.template.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    { isDefault: true },
                    { userId: ctx.user.id },
                ]
            }
        })
    })
})

