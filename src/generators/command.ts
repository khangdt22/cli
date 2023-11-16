import type { CommandContext, CommandDescription } from '../types'
import type { Cli } from '../cli'
import { buildArguments, buildOptions } from '../utils'
import { Command } from '../command'

export function generateCommand<TCli extends Cli = Cli>(name: string, description: CommandDescription, cli: TCli, prefix = '') {
    const command = new Command(name)

    for (const fn of ['alias', 'usage', 'description', 'summary'] as const) {
        const value = description[fn]

        if (value) {
            command[fn](value)
        }
    }

    const parseArguments = buildArguments(command, description.args)
    const parseOptions = buildOptions(command, description.options)

    if (description.handler) {
        const handler = description.handler

        command.action(async (...input: any[]) => {
            const cmd = input.pop()
            const options = parseOptions(input.pop())
            const args = parseArguments(input)

            const context: CommandContext = {
                cli,
                command: cmd,
                args,
                options,
                globalOptions: {},
                schemas: {
                    args: description.args,
                    options: description.options,
                },
            }

            await cli.hook.run('commands:global-options', context)
            await cli.hook.run('commands:*:prerun', context)
            await cli.hook.run(`commands:${prefix}${name}:prerun`, context)

            await handler(context)

            await cli.hook.run('commands:*:postrun', context)
            await cli.hook.run(`commands:${prefix}${name}:postrun`, context)
        })
    }

    command.helpOption('-h, --help', 'Show help')

    if (description.showGlobalOptions) {
        command.configureHelp({
            showGlobalOptions: true,
        })
    }

    if (description.version) {
        command.version(description.version, '-V, --version', 'Show current version number')
    }

    return command
}
