import type { CommandArgumentDescription, CommandOptionDescription } from '../types'

export const ARGUMENT_DESCRIPTION_PREFIX = '__argument_description__'

export const OPTION_DESCRIPTION_PREFIX = '__option_description__'

export function argument(description: CommandArgumentDescription) {
    return ARGUMENT_DESCRIPTION_PREFIX + JSON.stringify(description)
}

export function option(description: CommandOptionDescription) {
    return OPTION_DESCRIPTION_PREFIX + JSON.stringify(description)
}

export function getArgumentDescription(input: string | undefined) {
    return getDescription<CommandArgumentDescription>(ARGUMENT_DESCRIPTION_PREFIX, input)
}

export function getOptionDescription(input: string | undefined) {
    return getDescription<CommandOptionDescription>(OPTION_DESCRIPTION_PREFIX, input)
}

export function getDescription<T extends Record<string, any>>(key: string, input: string | undefined) {
    const config: Record<string, any> = {}

    if (input?.startsWith(key)) {
        Object.assign(config, JSON.parse(input?.slice(key.length)))
    } else {
        config.description = input
    }

    return config as T
}
