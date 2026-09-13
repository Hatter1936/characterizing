import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'

function createMockContext() {
  return {
    prisma: {
      character: { findUnique: jest.fn() },
      customField: { findMany: jest.fn() },
      $transaction: jest.fn((callback: any) => callback({
        character: { create: jest.fn() },
        customField: { create: jest.fn() },
      })) as any,
    },
    user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
    resHeaders: {},
  } as any
}

describe('jsonWork', () => {
  let ctx: ReturnType<typeof createMockContext>
  let caller: ReturnType<typeof appRouter.createCaller>

  beforeEach(() => {
    ctx = createMockContext()
    jest.clearAllMocks()
    caller = appRouter.createCaller(ctx)
  })

  test('exportJson возвращает данные', async () => {
    ctx.prisma.character.findUnique.mockResolvedValue({
      id: 'character-id',
      name: 'Test',
      userId: 'user-id',
    })
    ctx.prisma.customField.findMany.mockResolvedValue([])

    const result = await caller.jsonWork.exportJson({ id: 'character-id' })

    expect(result.success).toBe(true)
    expect(result.data.version).toBe(1)
    expect(result.data.character.name).toBe('Test')
  })

  test('importJson отклоняет невалидный JSON', async () => {
    await expect(
      caller.jsonWork.importJson({ jsonString: 'not-json' })
    ).rejects.toThrow('Invalid JSON format')
  })
})