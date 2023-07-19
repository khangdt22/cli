import { Help as BaseHelp, Option } from 'commander'
import terminalSize from 'term-size'
import chalk from 'chalk'
import type { Command } from './command'

export class Help extends BaseHelp {
    public override formatHelp(cmd: Command, helper: Help): string {
        const { formattedOptions, longestOptionTermLength } = this.formatOptions(helper.visibleOptions(cmd))
        const gOptions = this.formatOptions(helper.visibleGlobalOptions(cmd))

        const termWidth = helper.padWidthManual(cmd, helper, longestOptionTermLength, gOptions.longestOptionTermLength)
        const helpWidth = helper.helpWidth || Math.max(terminalSize().columns, 80)

        const itemIndentWidth = 2
        const itemSeparatorWidth = 2

        const formatList = (texts: string[]) => {
            return texts.join('\n').replaceAll(/^/gm, ' '.repeat(itemIndentWidth))
        }

        const formatItem = (term: string, description: string) => {
            if (description) {
                const padded = term.padEnd(termWidth + itemSeparatorWidth)
                const fullText = `${chalk.green(padded)}${description}`

                return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth)
            }

            return chalk.green(term)
        }

        const output: string[] = [chalk.yellow('USAGE:') + ' ' + helper.commandUsage(cmd), '']

        // Description
        const commandDescription = helper.commandDescription(cmd)

        if (commandDescription.length > 0) {
            output.push(helper.wrap(commandDescription, helpWidth, 0), '')
        }

        // Arguments
        const argumentList = helper.visibleArguments(cmd).map((argument) => (
            formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument))
        ))

        if (argumentList.length > 0) {
            output.push(chalk.yellow('ARGUMENTS:'), formatList(argumentList), '')
        }

        // Options
        const optionList = formattedOptions.map(([term, option]) => {
            return formatItem(term, helper.optionDescription(option))
        })

        if (optionList.length > 0) {
            output.push(chalk.yellow('OPTIONS:'), formatList(optionList), '')
        }

        // Global options
        if (this.showGlobalOptions) {
            const globalOptionList = gOptions.formattedOptions.map(([term, option]) => {
                return formatItem(term, helper.optionDescription(option))
            })

            if (globalOptionList.length > 0) {
                output.push(chalk.yellow('GLOBAL OPTIONS:'), formatList(globalOptionList), '')
            }
        }

        // Commands
        const commandList = helper.visibleCommands(cmd).map((cmd) => {
            return formatItem(helper.subcommandTerm(cmd), helper.subcommandDescription(cmd))
        })

        if (commandList.length > 0) {
            output.push(chalk.yellow('COMMANDS:'), formatList(commandList), '')
        }

        return output.join('\n')
    }

    public padWidthManual(cmd: Command, helper: Help, longestOptionTerm: number, longestGlobalOptionTerm: number) {
        return Math.max(
            longestOptionTerm,
            longestGlobalOptionTerm,
            helper.longestSubcommandTermLength(cmd, helper),
            helper.longestArgumentTermLength(cmd, helper)
        )
    }

    protected formatOptions(options: Option[]) {
        const longestShortFlagLength = options.reduce((max, option) => Math.max(max, option.short?.length ?? 0), 0)
        const formattedOptions: Array<[term: string, instance: Option]> = []

        let longestOptionTermLength = 0

        for (const option of options) {
            const description = option.flags.slice(
                (option.short ? option.short.length + 2 : 0) + (option.long?.length ?? 0)
            )

            if ((!option.short || option.short.length < longestShortFlagLength) && option.long) {
                option.long = option.long.padStart(option.long.length + longestShortFlagLength)
            }

            const term = (option.short ? option.short + ', ' : '') + (option.long ?? '')
            const flag = (option.short ? term : '  ' + term) + description

            longestOptionTermLength = Math.max(longestOptionTermLength, flag.length)
            formattedOptions.push([flag, option])
        }

        return { formattedOptions, longestOptionTermLength }
    }
}
