import type { Logger, LoggerOptions } from '@khangdt22/logger'
import { createDefaultLogger } from '@khangdt22/logger'
import { deepMerge } from '@khangdt22/utils/vendor'
import type { CliPlugin, CommandContext } from '../types'

export type WithLogger<C extends CommandContext<any, any, any>> = C & {
    logger: Logger
}

export const logger = <C extends CommandContext = CommandContext>(options: LoggerOptions = {}): CliPlugin<C> => ({
    name: 'logger',
    apply(cli) {
        cli.hook.on('commands:*:prerun', (context) => {
            const logger = createDefaultLogger(deepMerge(context['config']?.logger ?? {}, options))

            Object.assign(context, {
                logger: 'loggerNamespace' in context.description ? logger.child({ name: context.description['loggerNamespace'] as string }) : logger,
            })
        })
    },
})
