import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'

function createMockContext() {
    return {
        prisma: {
            character: { findUnique: jest.fn() },
            customField: { findMany: jest.fn() }
        },
        user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
        resHeaders: {},
    } as any
}

describe('export', () => {
    let ctx: ReturnType<typeof createMockContext>
    let caller: ReturnType<typeof appRouter.createCaller>

    beforeEach(() => {
        ctx = createMockContext()
        jest.clearAllMocks()
        caller = appRouter.createCaller(ctx)
    })

    test('export работает', async () => {
        ctx.prisma.character.findUnique.mockResolvedValue({
          id: 'character-id',
          name: 'Test',
          userId: 'user-id',
        })
        ctx.prisma.customField.findMany.mockResolvedValue([])

        const result = await caller.character.exportPng({ id: 'character-id' })

        expect(result.success).toBe(true)
        expect(result.png).toBeDefined()
        expect(typeof result.png).toBe('string')
    }, 30000)
})