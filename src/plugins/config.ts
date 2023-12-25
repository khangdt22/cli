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

export interface ConfigPluginOptions {
    name?: string
    path?: string
}

// eslint-disable-next-line max-len
export const config = <C extends CommandContext = CommandContext>(schema?: AnyZodObject, options: ConfigPluginOptions = {}): CliPlugin<C> => ({
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
            const name = options.name ?? cli.program.name()
            const explorer = cosmiconfig(name)
            const path = globalOptions.config ?? options.path

            try {
                const result = await (path ? explorer.load(path) : explorer.search())
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
