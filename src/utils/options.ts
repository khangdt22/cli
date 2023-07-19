import { unflatten } from '@khangdt22/utils/vendor'
import type { CommandOptions } from '../types'
import { generateOptions } from '../generators'
import type { Command } from '../command'

export function buildOptions(command: Command, schema?: CommandOptions) {
    if (schema) {
        const options = generateOptions(schema)

        for (const option of options) {
            command.addOption(option)
        }
    }

    return (input: Record<string, unknown>) => {
        if (!schema) {
            return {}
        }

        const parsedOptions = schema.safeParse(unflatten(input))

        if (!parsedOptions.success) {
            command.error(parsedOptions.error)
        }

        return parsedOptions.data
    }
}
