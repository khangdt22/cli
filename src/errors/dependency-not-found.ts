import type { CliPlugin, CommandContext } from '../types'

export class DependencyNotFound<TContext extends CommandContext = CommandContext> extends Error {
    public constructor(public readonly plugin: CliPlugin<TContext>, public readonly dependency: string) {
        super(`Plugin "${plugin.name}" requires plugin "${dependency}" to be run, ensure that "${dependency}" is registered before "${plugin.name}"`)
    }
}
