import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'
import { getPublic } from '../routers/character'

function createMockContext() {
  return {
    prisma: {
      character: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), },
      universe: { findUnique: jest.fn() },
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
    ctx.prisma.character.findUnique.mockResolvedValue({
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

  //Тест 5: Публичная карточка персонажа возвращает без авторизации
  test('get public character пользователь не авторизован', async () => {
    ctx.user = null

    ctx.prisma.character.findUnique.mockResolvedValue({
        id: 'new-character-id',
        name: 'Public Character Name',
        isPublic: true
    })

    const unauthorizedCaller = appRouter.createCaller(ctx)

    const result = await unauthorizedCaller.character.getPublic({
      id: 'new-character-id'
    })

    expect(result.success).toBe(true)
    expect(result.character.name).toBe('Public Character Name')
  })

  test('create в чужой вселенной', async() => {
    ctx.prisma.universe.findUnique.mockResolvedValue({
      id: 'universe-id',
      userId: 'alien-user-id',
    })

    await expect(
      caller.character.create({
        name: 'Test',
        universeId: 'universe-id',
      })
    ).rejects.toThrow('Universe not found or access denied.')
  })

  test('getPublic не отдаёт приватного персонажа', async() => {
    ctx.prisma.character.findUnique.mockResolvedValue({
      id: 'character-id',
      name: 'Private',
      isPublic: false
    })

    await expect(
      caller.character.getPublic({ id: 'chatacter-id' })
    ).rejects.toThrow('Character not found.')
  })
})