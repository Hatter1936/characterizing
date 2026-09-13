import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'

function createMockContext() {
  return {
    prisma: {
      universe: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), },
    },
    user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
    resHeaders: {},
  } as any
}

describe('universe', () => {
  let ctx: ReturnType<typeof createMockContext>
  let caller:ReturnType<typeof appRouter.createCaller>

  beforeEach(() => {
    ctx = createMockContext()
    jest.clearAllMocks()
    caller = appRouter.createCaller(ctx)
  })

  // Тест 1: Успешное создание
  test('create создаёт', async () => {
    ctx.prisma.universe.create.mockResolvedValue({
        id: 'new-universe-id',
        name: 'Name Universe',
        description: 'Description Universe', 
        coverImageUrl: 'https://imageurl.com',
        userId: 'user-id'
    })

    const result = await caller.universe.create({
        name: 'Name Universe',
        description: 'Description Universe', 
        coverImageUrl: 'https://imageurl.com',
    })

    expect(result.success).toBe(true)
    expect(result.universe.name).toBe('Name Universe')
    expect(result.universe.description).toBe('Description Universe')
    expect(result.universe.coverImageUrl).toBe('https://imageurl.com')
  })

  //Тест 2: Создание без авторизации
  test('create пользователь не авторизован', async () => {
    ctx.user = null
    const unauthorizedCaller = appRouter.createCaller(ctx)

    await expect(
      unauthorizedCaller.universe.create({
        name: 'Name Universe',
        description: 'Description Universe', 
        coverImageUrl: 'https://imageurl.com',
      })
    ).rejects.toThrow()
  })

  // Тест 3: Усешное удаление
  test('remove удаляет', async () => {
    ctx.prisma.universe.findUnique.mockResolvedValue({
        id: 'new-universe-id',
        userId: 'user-id'
    })

    ctx.prisma.universe.delete.mockResolvedValue({
      id: 'new-universe-id',
      userId: 'user-id'
    })

    const result = await caller.universe.remove({
        id: 'new-universe-id'
    })

    expect(result.success).toBe(true)
  })

  // Тест 4: Удаление не авторизованного пользователя
  test('remove пользователь не авторизован', async () => {
    ctx.prisma.universe.findUnique.mockResolvedValue({
        id: 'new-universe-id',
        name: 'Name Universe',
        userId: 'alian-user-id'
    })

    await expect(
      caller.universe.remove({
        id: 'new-universe-id'
      })
    ).rejects.toThrow('Universe not found.')
  })
})