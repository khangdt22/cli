import type { Logger, UserLoggerOptions } from '@khangdt22/logger'
import { createLogger } from '@khangdt22/logger'
import { deepMerge } from '@khangdt22/utils/vendor'
import type { CliPlugin, CommandContext } from '../types'

export type WithLogger<C extends CommandContext> = C & {
    logger: Logger
}

export const logger = (options: UserLoggerOptions = {}): CliPlugin => ({
    name: 'logger',
    apply(cli) {
        cli.hook.on('commands:*:prerun', (context) => {
            Object.assign(context, {
                logger: createLogger(deepMerge(options, context['config']?.logger ?? {})),
            })
        })
    },
})
