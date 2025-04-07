#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pkg = require("../package.json");
const commander_1 = require("commander");
const swap_1 = require("./commands/swap");
async function main(args = process.argv) {
    const program = new commander_1.Command();
    program
        .name("Oh My GitHub Actions Helper")
        .description("A CLI tool to help with GitHub Actions workflows")
        .version(pkg.version);
    (async () => {
        try {
            // Register program commands here
            await (0, swap_1.swap)(program);
        }
        catch (error) {
            console.error("An error occurred:", error);
            process.exit(1); // Exit with a failure code
        }
    })();
    await program.parseAsync(args);
}
main().catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1); // Exit with a failure code
});
