import type { Logger, UserLoggerOptions } from '@khangdt22/logger'
import { createLogger } from '@khangdt22/logger'
import { deepMerge } from '@khangdt22/utils/vendor'
import type { CliPlugin, CommandContext } from '../types'

export type WithLogger<C extends CommandContext<any, any, any>> = C & {
    logger: Logger
}

export const logger = <C extends CommandContext = CommandContext>(options: UserLoggerOptions = {}): CliPlugin<C> => ({
    name: 'logger',
    apply(cli) {
        cli.hook.on('commands:*:prerun', (context) => {
            const logger = createLogger(deepMerge(context['config']?.logger ?? {}, options))

            Object.assign(context, {
                logger: 'loggerNamespace' in context.description ? logger.child(context.description['loggerNamespace'] as string) : logger,
            })
        })
    },
})
