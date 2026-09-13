import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'

function createMockContext() {
  return {
    prisma: {
      character: { findUnique: jest.fn() },
      customField: { create: jest.fn(), update: jest.fn(), delete: jest.fn(), }
    },
    user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
    resHeaders: {},
  } as any
}

describe('customField', () => {
  let ctx: ReturnType<typeof createMockContext>
  let caller: ReturnType<typeof appRouter.createCaller>

  beforeEach(() => {
      ctx = createMockContext()
      jest.clearAllMocks()
      caller = appRouter.createCaller(ctx)
  })

  test('create custom field with autorization', async () => {
    ctx.prisma.customField.create.mockResolvedValue({
      id: 'new-customField-id',
      characterId: 'character-id',
      fieldName: 'Field Name',
      fieldType: 'text',
      fieldValue: 'field-value'
    })

    ctx.prisma.character.findUnique.mockResolvedValue({
      id: 'character-id',
      userId: 'user-id'
    })

    const result = await caller.customField.create({
      characterId: 'character-id',
      fieldName: 'Field Name',
      fieldType: 'text',
      fieldValue: 'field-value',
    })

    expect(result.success).toBe(true)
    expect(result.customField.fieldName).toBe('Field Name')
  })

  test('create custom field without autorization', async () => {
    ctx.user = null
    const unauthorizedCaller = appRouter.createCaller(ctx)

    await expect(
      unauthorizedCaller.customField.create({
        characterId: 'character-id',
        fieldName: 'Field Name',
        fieldType: 'text',
        fieldValue: 'field-value',
      })
    ).rejects.toThrow()
  })

  test('create с невалидным fieldType', async () => {
    await expect(
      caller.customField.create({
        characterId: 'character-id',
        fieldName: 'Field Name',
        fieldType: 'banana' as any,
        fieldValue: 'field-value',
      })
    ).rejects.toThrow()
  })
})