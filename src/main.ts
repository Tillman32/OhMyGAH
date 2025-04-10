import "reflect-metadata";
import { Command } from "@commander-js/extra-typings";
import { container, injectable } from "tsyringe";
import { List } from "./commands/list";
import { Swap } from "./commands/swap";
const pkg = require("../package.json");

export async function Main(program: Command): Promise<void> {
    program
        .name("Oh My GitHub Actions Helper")
        .description("A CLI tool to help with GitHub Actions workflows")
        .version(pkg.version);

    const listCommand = await container.resolve<List>("List");
    program
        .command('list')
        .description('Lists all the GitHub Actions Workflows in the current directory.')
        .argument('[action]', 'The action name to swap (eg; actions/checkout)')
        .action(async () => {
            await listCommand.run();
        });

    const swapCommand = await container.resolve<Swap>("Swap");
    program
        .command('swap')
        .description('Swaps the version of a GitHub Action in all Workflows within the current directory.')
        .argument('[action]', 'The action name to swap (eg; actions/checkout)')
        .argument('[version]', 'The version to swap to (eg; v2.3.4 or feature/xyz)')
        .action(async (action, version) => {
            await swapCommand.run(action!, version!);
        });

    await program.parseAsync(process.argv);    
}