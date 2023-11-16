import { fileURLToPath } from 'node:url'
import { readPackageUp } from 'read-pkg-up'
import { z, ZodObject } from 'zod'
import type { AnyObject } from '@khangdt22/utils/object'
import { readJsonFile } from '@khangdt22/utils/fs'
import type { CliConfig, CliHooks, CliPlugin, CommandDescription, CommandOption, CommandContext } from './types'
import { buildOptions, Hook, importDirectory } from './utils'
import { DependencyNotFound } from './errors'
import { generateCommand } from './generators'
import { Command } from './command'

export class Cli<TContext extends CommandContext = CommandContext> {
    public readonly program: Command
    public readonly hook: Hook<CliHooks<TContext>>

    protected readonly plugins = new Set<CliPlugin<TContext>>()
    protected readonly commands = new Map<string, CommandDescription>()
    protected readonly directories = new Set<string>()

    protected globalOptionsSchema: ZodObject<Record<string, CommandOption>> = z.object({})
    protected packageJsonContent?: AnyObject

    public constructor(public readonly config: CliConfig = {}) {
        this.program = new Command(config.name)
        this.hook = new Hook<CliHooks<TContext>>()
    }

    public get packageJson() {
        if (this.packageJsonContent) {
            return Promise.resolve(this.packageJsonContent)
        }

        return new Promise<AnyObject>((resolve) => {
            if (this.config.packageJsonPath) {
                return resolve((this.packageJsonContent = readJsonFile(this.config.packageJsonPath)))
            }

            readPackageUp().then((result) => resolve((this.packageJsonContent = result?.packageJson ?? {})))
        })
    }

    public use(plugin: CliPlugin<TContext>) {
        this.plugins.add(plugin)
    }

    public extend(obj: Record<string, any>) {
        Object.assign(this, obj)
    }

    public command(name: string, description: CommandDescription) {
        this.commands.set(name, description)
    }

    public commandDir(directory: string, importMeta: ImportMeta) {
        this.directories.add(fileURLToPath(new URL(directory, importMeta.url)))
    }

    public options(schema: ZodObject<Record<string, CommandOption>>) {
        this.globalOptionsSchema = this.globalOptionsSchema.merge(schema)
    }

    public async run(argv: string[] = process.argv) {
        await this.hook.run('prerun', this)

        await this.loadPlugins()
        await this.loadDirectories()
        await this.loadCommands(this.program, this.commands)
        await this.loadGlobalOptions()

        const version = this.config.version ?? (await this.packageJson).version
        const description = this.config.description ?? (await this.packageJson).description ?? ''

        if (version) {
            this.program.version(version, '-V, --version', 'Show current version number')
        }

        this.program.description(description)
        this.program.helpOption('-h, --help', 'Show help')

        await this.program.parseAsync(argv)
        await this.hook.run('postrun', this)
    }

    protected async loadGlobalOptions() {
        const parse = buildOptions(this.program, this.globalOptionsSchema)

        this.hook.on('commands:global-options', (context) => {
            Object.assign(context, {
                globalOptions: parse(context.command.optsWithGlobals()),
            })
        })
    }

    protected async loadDirectories() {
        await this.hook.run('directories:preload', this.directories, this)

        for (const directory of this.directories) {
            const commands = await importDirectory(directory)

            for (const [name, description] of commands) {
                this.command(name, description)
            }
        }

        await this.hook.run('directories:postload', this.directories, this)
    }

    protected async loadCommands(parent: Command, commands: Map<string, CommandDescription>, prefix = '') {
        if (prefix === '') {
            await this.hook.run('commands:preload', commands, this)
        }

        for (const [name, description] of commands) {
            await this.hook.run(`commands:*:preload`, description, this)
            await this.hook.run(`commands:${prefix}${name}:preload`, description, this)

            const command = generateCommand<any>(name, description, this, prefix)

            if (description.subcommands && Object.keys(description.subcommands).length > 0) {
                await this.loadCommands(command, new Map(Object.entries(description.subcommands)), prefix + name + '/')
            }

            parent.addCommand(command, {
                isDefault: description.isDefault,
                hidden: description.hidden,
            })

            await this.hook.run(`commands:*:postload`, command, description, this)
            await this.hook.run(`commands:${prefix}${name}:postload`, command, description, this)
        }

        if (prefix === '') {
            await this.hook.run('commands:postload', commands, this)
        }
    }

    protected async loadPlugins() {
        await this.hook.run('plugins:preload', this.plugins, this)

        const loadedPlugins: string[] = []

        for (const plugin of this.plugins) {
            await this.hook.run(`plugins:${plugin.name}:preapply`, plugin, this)

            await this.checkPluginDependencies(plugin, loadedPlugins)
            await plugin.apply(this as any)
            await loadedPlugins.push(plugin.name)

            await this.hook.run(`plugins:${plugin.name}:postapply`, plugin, this)
        }

        await this.hook.run('plugins:postload', this.plugins, this)
    }

    protected checkPluginDependencies(plugin: CliPlugin<TContext>, loaded: string[]) {
        const dependencies = plugin.dependencies ?? []

        for (const dependency of dependencies) {
            if (!loaded.includes(dependency)) {
                this.program.error(new DependencyNotFound(plugin, dependency))
            }
        }
    }
}
