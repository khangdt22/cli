import { type AnyZodObject, type TypeOf, z } from 'zod'
import { cosmiconfig } from 'cosmiconfig'
import type { CliPlugin, CommandContext } from '../types'
import { option } from '../utils'
import type { Cli } from '../cli'

export type WithConfig<C extends CommandContext<any, any, any>, S extends AnyZodObject | undefined = undefined> = C & {
    config: S extends AnyZodObject ? TypeOf<S> : Record<string, any>
}

export type WithAddConfigSchema<C extends Cli> = C & {
    addConfigSchema: <S extends AnyZodObject>(schema: S) => void
}

export const config = <C extends CommandContext = CommandContext>(schema?: AnyZodObject): CliPlugin<C> => ({
    name: 'config',
    apply(cli) {
        cli.options(z.object({
            config: z.string().optional().describe(option({
                alias: 'c',
                description: 'Path to config file',
                valueDescription: 'path',
            })),
        }))

        cli.extend({
            addConfigSchema: (_schema: AnyZodObject) => {
                if (!schema) {
                    schema = z.object({})
                }

                schema = schema.merge(_schema)
            },
        })

        cli.hook.on('commands:*:prerun', async (context) => {
            const { cli, command, globalOptions } = context
            const explorer = cosmiconfig(cli.program.name())

            try {
                const result = await (globalOptions.config ? explorer.load(globalOptions.config) : explorer.search())
                const config = result?.config ?? {}

                Object.assign(context, {
                    config: schema ? schema.parse(config) : config,
                })
            } catch (error: any) {
                command.error(error)
            }
        })
    },
})
