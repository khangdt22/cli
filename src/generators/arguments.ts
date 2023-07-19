import { z, ZodArray, ZodEnum, ZodNativeEnum, ZodTuple } from 'zod'
import { Argument } from 'commander'
import { paramCase } from 'param-case'
import type { CommandArgument, CommandArgumentDescription, CommandArguments } from '../types'
import type { ParseSchemaResult } from '../utils'
import { getArgumentDescription, getParser, parseSchema } from '../utils'

type ArgumentSchema = [
    schema: CommandArgument[],
    restIndex: number | undefined,
    metadata: Omit<ParseSchemaResult, 'schema'>,
    description: CommandArgumentDescription,
]

export function getArgumentsSchema(argumentsSchema: CommandArguments): ArgumentSchema {
    const { schema, ...metadata } = parseSchema(argumentsSchema)
    const config = getArgumentDescription(argumentsSchema.description)

    if (!(schema instanceof ZodArray) && !(schema instanceof ZodTuple)) {
        return [[], undefined, {}, {}]
    }

    if (schema instanceof ZodTuple) {
        let restIndex

        if (schema._def.rest) {
            restIndex = schema._def.items.length
            schema._def.items.push(schema._def.rest)
        }

        return [schema._def.items, restIndex, metadata, config]
    }

    metadata.defaultValue = [metadata.defaultValue]

    return [[schema._def.type], 0, metadata, config]
}

export function generateArguments(argumentsSchema: CommandArguments) {
    const [items, restIndex, metadata, defaultConfig] = getArgumentsSchema(argumentsSchema)
    const { defaultValue: globalDefault, optional: isOptionalByDefault } = metadata
    const args: Argument[] = []

    for (const [i, item] of items.entries()) {
        const { schema, description, ...metadata } = parseSchema(item)
        const { optional = isOptionalByDefault, defaultValue = globalDefault?.[i] } = metadata

        const config = { ...defaultConfig, ...getArgumentDescription(schema.description ?? description) }

        const isOptional = optional || defaultValue !== undefined
        const isVariadic = restIndex !== undefined && i >= restIndex

        // Create argument instance.
        const name = paramCase(config.name ?? 'arg') + (isVariadic ? '...' : '')
        const argument = new Argument(isOptional ? `[${name}]` : `<${name}>`, config.description)

        argument.argParser(getParser(isVariadic ? z.array(schema) : schema, defaultValue))
        argument.default(defaultValue)

        if (schema instanceof ZodEnum || schema instanceof ZodNativeEnum) {
            argument.choices(Object.values(schema._def.values))
        }

        args.push(argument)
    }

    return args
}
