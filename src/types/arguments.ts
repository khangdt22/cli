import type { ValidZodArray, ValidZodTuple, ValidZodType } from './types'

export type CommandArgument = ValidZodType

export type CommandArguments = ValidZodArray | ValidZodTuple

export interface CommandArgumentDescription {
    name?: string
    description?: string
    defaultValueDescription?: string
}
