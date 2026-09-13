import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'
import bcrypt, { compare } from 'bcryptjs'

function createMockContext() {
  return {
    prisma: {
      user: { findUnique: jest.fn(), create: jest.fn(), },
      session: { create: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), },
    },
    user: { id: 'user-id', email: 'test@test.com', name: null, avatarUrl: null },
    resHeaders: {} as Record<string, string>,
    token: undefined as string | undefined
  } as any
}

jest.mock('bcryptjs', () => {
  return {
    __esModule: true,
    default: {
      hash: jest.fn().mockResolvedValue('hashed-password' as never),
      compare: jest.fn().mockResolvedValue(true as never),
    },
    hash: jest.fn().mockResolvedValue('hashed-password' as never),
    compare: jest.fn().mockResolvedValue(true as never),
  }
})

jest.mock('jsonwebtoken', () => {
  return {
    __esModule: true,
    default: {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    },
    sign:jest.fn().mockReturnValue('fake-jwt-token'),
  }
})

describe('auth', () => {
  let ctx: ReturnType<typeof createMockContext>
  let caller:ReturnType<typeof appRouter.createCaller>

  beforeEach(() => {
    ctx = createMockContext()
    jest.clearAllMocks()
    caller = appRouter.createCaller(ctx)
  })

  test('register создаёт пользователя', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue(null)
    ctx.prisma.user.create.mockResolvedValue({
        id: 'new-id',
        email: 'new@test.com',
        name: null,
    })

    const result = await caller.auth.register({
      email: 'new@test.com', 
      password: '123456',
    })

    expect(result.success).toBe(true)
    expect(result.user.email).toBe('new@test.com')
  })

  test('register отклоняет занятый email', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue({ id: 'exists', email: 'new@test.com' })

    await expect(
      caller.auth.register({
        email: 'new@test.com', 
        password: '123456',
      })
    ).rejects.toThrow('User with this email already exists')
  })

  test('login находит пользователя', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue({ id: 'user-id', email: 'new@test.com', passwordHash: 'hashed-password', })

    const result = await caller.auth.login({
      email: 'new@test.com', 
      password: '123456',
    })

    expect(result.success).toBe(true)
    expect(result.user.id).toBe('user-id')
    expect(ctx.resHeaders.token).toBeDefined()
  })

  test('login неверный пароль', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue({ id: 'user-id', email: 'notnew@test.com', passwordHash: 'any-password-hash', })

    const compareMock = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never)
    
    await expect(
      caller.auth.login({
        email: 'new@test.com',
        password: '123457',
      })
    ).rejects.toThrow('Incorrect password.')

    compareMock.mockRestore()
  })

  test('login не найден пользователь', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue(null)

    await expect(
      caller.auth.login({
        email: 'nonexistent@test.com',
        password: '123456',
      })
    ).rejects.toThrow('User not found.')
  })

  test('logout выходит', async () => {
    ctx.token = 'exist-token'
    ctx.prisma.session.findUnique.mockResolvedValue({ token: 'exist-token' })
    ctx.prisma.session.delete.mockResolvedValue({ token: 'exist-token' })

    const result = await caller.auth.logout()

    expect(result).toEqual({ success: true})
    expect(ctx.prisma.session.delete).toHaveBeenCalledWith({
      where: { token: 'exist-token' }
    })
    expect(ctx.resHeaders['Set-Cookie']).toBeDefined()
  })

  test('logout не находит сессию', async () => {
    ctx.token = 'notexistist-token'
    ctx.prisma.session.findUnique.mockResolvedValue(null)

    await expect(caller.auth.logout()).rejects.toThrow('Session not found.')
  })

  test('me авторизован', async () => {
    const mockUser = {
        id: 'user-id',
        email: 'new@test.com',
        name: 'Test User',
    }

    ctx.user = mockUser
    const authorizedCaller = appRouter.createCaller(ctx)
    const result = await authorizedCaller.auth.me()

    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
  })

  test('me не авторизован', async () => {
    ctx.user = null
    const unauthorizedCaller = appRouter.createCaller(ctx)
    await expect(
      caller.auth.me()
    ).rejects.toThrow()
  })

  test('expired session неавторизован', async () => {
    ctx.user = null
    const expiredCaller = appRouter.createCaller(ctx)
    await expect(expiredCaller.auth.me()).rejects.toThrow('User not found')
  })

  test('logout без токена, неавторизован', async () => {
    ctx.token = undefined
    await expect(caller.auth.logout()).rejects.toThrow('Incorrect token.')
  })
})