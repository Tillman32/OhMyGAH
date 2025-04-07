import fs from "fs";
import { Command } from "commander";
import { glob } from 'glob'
import inquirer from "inquirer";
import { exit } from "process";

export async function swap(program: Command) : Promise<Command> {
    program
        .command('swap')
        .description('Swaps the version of a GitHub Action in all .yml files in the current directory')
        .argument('[action]', 'The action name to swap (eg; actions/checkout)')
        .argument('[version]', 'The version to swap to (eg; v2.3.4 or feature/xyz)')
        .action(async function (action, version) {
            if(!action || !version) {
                const prompt = await inquirer.prompt([
                    {
                        type: "input",
                        name: "action",
                        message: "Enter action name (eg; actions/checkout)"
                    },
                    {
                        type: "input",
                        name: "version",
                        message: "Enter version/branch"
                    }
                ]);

                action = prompt.action;
                version = prompt.version;
            }

            const yamlFiles = await glob(['**/*.yml','**/*.yaml'], { ignore: 'node_modules/**', dot: true });

            if(yamlFiles.length === 0) {
                console.log("No .yml or .yaml files found in the current directory including subdirectories.");
                console.log("Please make sure you are in the correct directory and try again.");
                exit(1);
            }

            const slectedFiles = await promptUserToSelectFiles(yamlFiles);

            await replaceActionVersionInFiles(slectedFiles, action, version);
        });

    return program;
}

async function replaceActionVersionInFiles(files: string[], action: string, version: string) {
    console.log(`Replacing version of action ${action} to ${version}`);

    // Iterate through each file and search for the pattern 'uses:'
    files.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf-8');
        const lines = fileContent.split('\n');

        lines.forEach((line, index) => {
            if (line.includes('uses:')) {
                // Replace the action version
                const newLine = line.replace(/(uses:\s*['"]?.*?)(@[^'"]*)/, `$1@${version}`);
                lines[index] = newLine;
            }
        });

        // Write the updated content back to the file
        const updatedContent = lines.join('\n');
        fs.writeFileSync(file, updatedContent, 'utf-8'); // Write the changes back to the file
        console.log(`Updated file: ${file}`);
    });
}

async function promptUserToSelectFiles(files: string[]): Promise<string[]> {
    const { selectedFiles } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedFiles',
            message: 'Select files to update',
            choices: files.map(file => ({ name: file, value: file })),
        },
    ]);

    return selectedFiles;
}