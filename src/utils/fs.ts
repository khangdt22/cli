import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { paramCase } from 'param-case'
import { isObject, isKeyOf } from '@khangdt22/utils/object'
import type { CommandDescription } from '../types'

export async function importDirectory(path: string) {
    const files = await readdir(path)
    const commands = new Map<string, CommandDescription>()

    for (const file of files) {
        const filePath = join(path, file)
        const fileStat = await stat(filePath)
        const name = paramCase(file.replace(/\.(js|ts)$/, ''))

        const command: CommandDescription = {
            subcommands: commands.get(name)?.subcommands ?? {},
        }

        if (fileStat.isDirectory()) {
            const subcommands = await importDirectory(filePath)
            const indexCommand = subcommands.get('index')

            if (indexCommand) {
                subcommands.delete('index')
                Object.assign(command, indexCommand)
            }

            command.subcommands = Object.fromEntries(subcommands)
            commands.set(name, command)

            continue
        }

        if (!/\.(js|ts)$/.test(file) || file.endsWith('.d.ts')) {
            continue
        }

        const description = await import(pathToFileURL(filePath).href).then((m) => {
            if (isKeyOf(m, 'default') && isObject(m.default)) {
                return m.default
            }

            return m
        })

        commands.set(name, Object.assign(command, description))
    }

    return commands
}
