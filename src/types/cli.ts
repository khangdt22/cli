import type { Awaitable } from '@khangdt22/utils/promise'
import type { Cli } from '../cli'
import type { CommandContext } from './command'

export interface CliPlugin<TContext extends CommandContext = CommandContext> {
    name: string

    dependencies?: string[]

    apply(cli: Cli<TContext>): Awaitable<void>
}

export interface CliConfig {
    name?: string
    version?: string
    description?: string
    packageJsonPath?: string
}
