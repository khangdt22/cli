import { Option } from 'commander'
import { ZodArray, ZodBoolean, ZodEnum, ZodNativeEnum, ZodObject, type ZodRawShape, ZodSet } from 'zod'
import plur from 'plur'
import { paramCase } from 'param-case'
import type { CommandOptions } from '../types'
import { getOptionDescription, getParser, parseSchema } from '../utils'

export function generateOptions(optionsSchema: CommandOptions, namePrefix = '') {
    const options: Option[] = []
    const { schema: _optionsSchema, defaultValue: globalDefaultValue = {} } = parseSchema(optionsSchema)

    if (!(_optionsSchema instanceof ZodObject)) {
        return []
    }

    for (const [key, _schema] of Object.entries((_optionsSchema as ZodObject<ZodRawShape>).shape)) {
        const { schema, defaultValue = globalDefaultValue[key], description, optional } = parseSchema(_schema)
        const config = getOptionDescription(schema._def.description ?? description)

        // Convert schema name to kebab-case.
        const formattedKey = paramCase(key)
        const name = namePrefix + formattedKey

        // Flatten object schema.
        if (schema instanceof ZodObject) {
            options.push(...generateOptions((schema as any).default(defaultValue), `${name}.`))
            continue
        }

        // Build option flag.
        const negate = schema instanceof ZodBoolean && defaultValue === true
        const expectsValue = !(schema instanceof ZodBoolean)

        let flag = (config.alias ? `-${config.alias}, ` : '') + (negate ? '--no-' : '--') + name

        if (expectsValue) {
            const variadic = schema instanceof ZodArray || schema instanceof ZodSet

            if (!config.valueDescription) {
                config.valueDescription = variadic ? plur(formattedKey) : formattedKey
            }

            const valueDescription = config.valueDescription + (variadic ? '...' : '')
            const isOptional = optional || defaultValue !== undefined

            flag += isOptional ? ` [${valueDescription}]` : ` <${valueDescription}>`
        }

        // Create option instance.
        const option = new Option(flag, config.description)

        option.argParser(getParser(schema, defaultValue))
        option.preset(config.preset)
        option.conflicts(config.conflicts ?? [])
        option.hideHelp(config.hidden ?? false)

        if (config.env) {
            option.env(config.env)
        }

        if (schema instanceof ZodEnum || schema instanceof ZodNativeEnum) {
            option.choices(Object.values(schema._def.values))
        }

        if (defaultValue !== undefined) {
            if (!config.defaultValueDescription && schema instanceof ZodSet) {
                config.defaultValueDescription = JSON.stringify([...defaultValue])
            }

            option.default(defaultValue, config.defaultValueDescription)
        }

        options.push(option)
    }

    return options
}
