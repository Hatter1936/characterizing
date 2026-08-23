import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'

function createMockContext() {
  return {
    prisma: {
      character: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), },
    },
    user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
    resHeaders: {},
  } as any
}

describe('character', () => {
  let ctx: ReturnType<typeof createMockContext>
  let caller:ReturnType<typeof appRouter.createCaller>

  beforeEach(() => {
    ctx = createMockContext()
    jest.clearAllMocks()
    caller = appRouter.createCaller(ctx)
  })

  // Тест 1: Успешное создание
  test('create создаёт', async () => {
    ctx.prisma.character.create.mockResolvedValue({
        id: 'new-character-id',
        name: 'Name Character',
        description: 'Description Character', 
        coverImageUrl: 'https://imageurl.com',
        userId: 'user-id'
    })

    const result = await caller.character.create({
        name: 'Name Character',
        description: 'Description Character',
    })

    expect(result.success).toBe(true)
    expect(result.character.name).toBe('Name Character')
    expect(result.character.description).toBe('Description Character')
  })

  //Тест 2: Создание без авторизации
  test('create пользователь не авторизован', async () => {
    ctx.user = null
    const unauthorizedCaller = appRouter.createCaller(ctx)

    await expect(
      unauthorizedCaller.character.create({
        name: 'Name Character',
        description: 'Description Character',
      })
    ).rejects.toThrow()
  })

  // Тест 3: Усешное удаление
  test('remove удаляет', async () => {
    ctx.prisma.character.findUnique.mockResolvedValue({
        id: 'new-character-id',
        userId: 'user-id'
    })

    ctx.prisma.character.delete.mockResolvedValue({
      id: 'new-character-id',
      userId: 'user-id'
    })

    const result = await caller.character.remove({
        id: 'new-character-id'
    })

    expect(result.success).toBe(true)
  })

  // Тест 4: Удаление не авторизованного пользователя
  test('remove пользователь не авторизован', async () => {
    ctx.prisma.character.create.mockResolvedValue({
        id: 'new-character-id',
        name: 'Name Character',
        userId: 'alian-user-id'
    })

    await expect(
      caller.character.remove({
        id: 'new-character-id'
      })
    ).rejects.toThrow('Character not found.')
  })
})