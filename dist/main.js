"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = Main;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const pkg = require("../package.json");
async function Main(program) {
    program
        .name("Oh My GitHub Actions Helper")
        .description("A CLI tool to help with GitHub Actions workflows")
        .version(pkg.version);
    const listCommand = await tsyringe_1.container.resolve("List");
    program
        .command('list')
        .description('Lists all the GitHub Actions Workflows in the current directory.')
        .argument('[action]', 'The action name to swap (eg; actions/checkout)')
        .action(async () => {
        await listCommand.run();
    });
    const swapCommand = await tsyringe_1.container.resolve("Swap");
    program
        .command('swap')
        .description('Swaps the version of a GitHub Action in all Workflows within the current directory.')
        .argument('[action]', 'The action name to swap (eg; actions/checkout)')
        .argument('[version]', 'The version to swap to (eg; v2.3.4 or feature/xyz)')
        .action(async () => {
        await swapCommand.run();
    });
    await program.parseAsync(process.argv);
}
