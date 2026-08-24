import { router, publicProcedure } from './trpc'
import { register, login, logout, me } from './routers/auth'
import { create, list, getById, update, remove } from './routers/universe'
import { create as createCharacter, list as listCharacter, getById as getByIdCharacter, update as updateCharacter, remove as removeCharacter } from './routers/character'
import {create as createCustomField, update as updateCustomField, remove as removeCustomField } from './routers/customField'

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),
  auth: router({
    register,
    login,
    logout,
    me,
  }),
  universe: router({
    create,
    list,
    getById,
    update,
    remove,
  }),
  character: router({
    create: createCharacter,
    list: listCharacter,
    getById: getByIdCharacter,
    update: updateCharacter,
    remove: removeCharacter,
  }),
  customField: router({
    create: createCustomField,
    update: updateCustomField,
    remove: removeCustomField,
  }),
})

export type AppRouter = typeof appRouter