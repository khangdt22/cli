import type { CliPlugin } from '../types'

export class DependencyNotFound extends Error {
    public constructor(public readonly plugin: CliPlugin, public readonly dependency: string) {
        super(`Plugin "${plugin.name}" requires plugin "${dependency}" to be run, ensure that "${dependency}" is registered before "${plugin.name}"`)
    }
}
