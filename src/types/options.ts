import type { ZodObject } from 'zod'
import type { ValidZodArrayLike, ValidZodObject, ValidZodType, ZodProxy } from './types'

export type CommandOption = ValidZodType | ValidZodArrayLike | ValidZodObject

export type CommandOptions = ZodProxy<ZodObject<Record<string, CommandOption>>>

export interface CommandOptionDescription {
    alias?: string
    description?: string
    defaultValueDescription?: string
    preset?: any
    conflicts?: string | string[]
    valueDescription?: string
    env?: string
    hidden?: boolean
}
