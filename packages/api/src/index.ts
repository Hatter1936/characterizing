import { router, publicProcedure } from './trpc'
import { register, login, logout, me } from './routers/auth'
import { create, list, getById, update, remove } from './routers/universe'
import { create as createCharacter, list as listCharacter, getById as getByIdCharacter, getPublic as getPublicCharacter, update as updateCharacter, remove as removeCharacter } from './routers/character'
import {create as createCustomField, update as updateCustomField, remove as removeCustomField } from './routers/customField'
import { create as createTemplate, list as listTemplate } from './routers/template'

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
    getPublic: getPublicCharacter,
    update: updateCharacter,
    remove: removeCharacter,
  }),
  customField: router({
    create: createCustomField,
    update: updateCustomField,
    remove: removeCustomField,
  }),
  template: router({
    create: createTemplate,
    list: listTemplate,
  }),
})

export type AppRouter = typeof appRouter