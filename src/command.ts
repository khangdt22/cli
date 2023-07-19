import { Command as BaseCommand, type ErrorOptions } from 'commander'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { formatters } from '@khangdt22/logger'
import chalk from 'chalk'
import { Help } from './help'

export class Command extends BaseCommand {
    protected _helpCommandDescription = 'Show help for command'

    public override createHelp() {
        return Object.assign(new Help(), this.configureHelp())
    }

    public override error(error: string | Error, options: ErrorOptions = {}): never {
        if (error instanceof ZodError) {
            error = fromZodError(error, {
                prefix: '',
                prefixSeparator: '',
            })
        }

        const message = error instanceof Error ? formatters.formatError(error) : chalk.bgRed.whiteBright(` ${error} `)

        return super.error(message, {
            code: error['code'],
            exitCode: error['exitCode'],
            ...options,
        })
    }
}
