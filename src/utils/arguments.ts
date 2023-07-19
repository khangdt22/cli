import type { CommandArguments } from '../types'
import { generateArguments } from '../generators'
import type { Command } from '../command'

export function buildArguments(command: Command, schema?: CommandArguments) {
    let hasVariadicArgument = false

    if (schema) {
        const args = generateArguments(schema)

        for (const arg of args) {
            if (arg.variadic) {
                hasVariadicArgument = true
            }

            command.addArgument(arg)
        }
    }

    return (input: any[]) => {
        if (!schema) {
            return []
        }

        if (hasVariadicArgument) {
            input = [...input.slice(0, -1), ...input.at(-1)]
        }

        const parsedArgs = schema.safeParse(input)

        if (!parsedArgs.success) {
            command.error(parsedArgs.error)
        }

        return parsedArgs.data
    }
}
