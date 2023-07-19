import type { Awaitable } from '@khangdt22/utils/promise'
import type { Cli } from '../cli'

export interface CliPlugin {
    name: string

    dependencies?: string[]

    apply(cli: Cli): Awaitable<void>
}

export interface CliConfig {
    name?: string
    version?: string
    description?: string
}
