import type { Awaitable } from '@khangdt22/utils/promise'
import type { AnyZodObject, TypeOf, ZodArray, ZodTypeAny } from 'zod'
import type { Command } from '../command'
import type { Cli } from '../cli'
import type { CommandArguments } from './arguments'
import type { CommandOptions } from './options'

// eslint-disable-next-line max-len
export interface CommandContext<A extends CommandArguments = ZodArray<ZodTypeAny>, O extends CommandOptions = AnyZodObject, G extends CommandOptions = AnyZodObject> {
    cli: Cli<any>
    command: Command
    args: TypeOf<A>
    options: TypeOf<O>
    globalOptions: TypeOf<G>
    schemas: {
        args?: A
        options?: O
        globalOptions?: G
    }
}

export type CommandHandler<C extends CommandContext = CommandContext> = (context: C) => Awaitable<void>

export interface CommandDescription<C extends CommandContext = CommandContext> {
    alias?: string
    usage?: string
    description?: string
    summary?: string
    version?: string
    isDefault?: boolean
    hidden?: boolean
    showGlobalOptions?: boolean
    args?: C['schemas']['args']
    options?: C['schemas']['options']
    handler?: CommandHandler<C>
    subcommands?: Record<string, CommandDescription>
}
