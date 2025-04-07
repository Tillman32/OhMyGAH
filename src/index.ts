#!/usr/bin/env node
const pkg = require("../package.json");
import { Command } from "commander";
import { swap } from "./commands/swap";

async function main(args: string[] = process.argv): Promise<void> {
    const program = new Command();

    program
        .name("Oh My GitHub Actions Helper")
        .description("A CLI tool to help with GitHub Actions workflows")
        .version(pkg.version);

        (async (): Promise<void> => {
            try {
                // Register program commands here
                await swap(program);
            } catch (error) {
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