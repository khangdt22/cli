import type { Awaitable } from '@khangdt22/utils/promise'
import type { Cli } from '../cli'
import type { Command } from '../command'
import type { CommandContext, CommandDescription } from './command'
import type { CliPlugin } from './cli'

export type CliHooks<TContext extends CommandContext = CommandContext> = {
    'prerun': (cli: Cli<TContext>) => Awaitable<void>
    'postrun': (cli: Cli<TContext>) => Awaitable<void>
    'plugins:preload': (plugins: Set<CliPlugin>, cli: Cli<TContext>) => Awaitable<void>
    'plugins:postload': (plugins: Set<CliPlugin>, cli: Cli<TContext>) => Awaitable<void>
    [key: `plugins:${string}:preapply`]: (plugin: CliPlugin, cli: Cli<TContext>) => Awaitable<void>
    [key: `plugins:${string}:postapply`]: (plugin: CliPlugin, cli: Cli<TContext>) => Awaitable<void>
    'directories:preload': (directories: Set<string>, cli: Cli<TContext>) => Awaitable<void>
    'directories:postload': (directories: Set<string>, cli: Cli<TContext>) => Awaitable<void>
    'commands:preload': (commands: Map<string, CommandDescription>, cli: Cli<TContext>) => Awaitable<void>
    'commands:postload': (commands: Map<string, CommandDescription>, cli: Cli<TContext>) => Awaitable<void>
    [key: `commands:${string}:preload`]: (description: CommandDescription, cli: Cli<TContext>) => Awaitable<void>
    [key: `commands:${string}:postload`]: (command: Command, description: CommandDescription, cli: Cli<TContext>) => Awaitable<void>
    [key: `commands:${string}:prerun`]: (context: TContext) => Awaitable<void>
    [key: `commands:${string}:postrun`]: (context: TContext) => Awaitable<void>
    [key: string]: (...args: any[]) => Awaitable<void>
}
