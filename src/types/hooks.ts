import type { Awaitable } from '@khangdt22/utils/promise'
import type { Cli } from '../cli'
import type { Command } from '../command'
import type { CommandContext, CommandDescription } from './command'
import type { CliPlugin } from './cli'

export type CliHooks = {
    'prerun': (cli: Cli) => Awaitable<void>
    'postrun': (cli: Cli) => Awaitable<void>
    'plugins:preload': (plugins: Set<CliPlugin>, cli: Cli) => Awaitable<void>
    'plugins:postload': (plugins: Set<CliPlugin>, cli: Cli) => Awaitable<void>
    [key: `plugins:${string}:preapply`]: (plugin: CliPlugin, cli: Cli) => Awaitable<void>
    [key: `plugins:${string}:postapply`]: (plugin: CliPlugin, cli: Cli) => Awaitable<void>
    'directories:preload': (directories: Set<string>, cli: Cli) => Awaitable<void>
    'directories:postload': (directories: Set<string>, cli: Cli) => Awaitable<void>
    'commands:preload': (commands: Map<string, CommandDescription>, cli: Cli) => Awaitable<void>
    'commands:postload': (commands: Map<string, CommandDescription>, cli: Cli) => Awaitable<void>
    [key: `commands:${string}:preload`]: (description: CommandDescription, cli: Cli) => Awaitable<void>
    [key: `commands:${string}:postload`]: (command: Command, description: CommandDescription, cli: Cli) => Awaitable<void>
    [key: `commands:${string}:prerun`]: (context: CommandContext) => Awaitable<void>
    [key: `commands:${string}:postrun`]: (context: CommandContext) => Awaitable<void>
    [key: string]: (...args: any[]) => Awaitable<void>
}
