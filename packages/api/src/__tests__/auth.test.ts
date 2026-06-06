import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { appRouter } from '../index'
import bcrypt, { compare } from 'bcryptjs'

function createMockContext() {
  return {
    prisma: {
      user: { findUnique: jest.fn(), create: jest.fn(), },
      session: { create: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), },
    },
    user: null,
    resHeaders: {},
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
    expect(result.token).toBe('fake-jwt-token')
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
    ctx.prisma.session.findUnique.mockResolvedValue({ id: 'session-id', token: 'exist-token', userId: 'user-id', })
    ctx.prisma.session.delete.mockResolvedValue({ id: 'session-id', token: 'exist-token', })

    const result = await caller.auth.logout({
      token: 'exist-token',
    })

    expect(result.success).toBe(true)
    expect(ctx.prisma.session.delete).toHaveBeenCalledWith({
      where: { token: 'exist-token' }
    })
  })

  test('logout не находит сессию', async () => {
    ctx.prisma.session.findUnique.mockResolvedValue(null)

    await expect(
      caller.auth.logout({
        token: 'notexistist-token',
      })
    ).rejects.toThrow('Session not found.')
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
    await expect(
      caller.auth.me()
    ).rejects.toThrow()
  })
})