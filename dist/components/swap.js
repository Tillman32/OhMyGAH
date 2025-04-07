"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = swap;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
function swap(program) {
    return __awaiter(this, void 0, void 0, function* () {
        program
            .command('swap')
            .description('Swaps the version of a GitHub Action in all .yml files in the current directory')
            .argument('[action]', 'The action to swap the version of')
            .argument('[version]', 'The version to swap to')
            .action((action, version) => __awaiter(this, void 0, void 0, function* () {
            console.log("Action: ", action);
            console.log("Version: ", version);
            if (!action || !version) {
                const prompt = yield inquirer_1.default.prompt([
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
            replaceActionVersionInFiles(action, version);
        }));
        return program;
    });
}
function replaceActionVersionInFiles(action, version) {
    console.log(`Replacing version of action ${action} to ${version}`);
    const cwd = process.cwd();
    //const githubDir = path.join(cwd, '.github');
    // Search for any .yml files in cwd
    //const files = fs.readdirSync(cwd, {recursive: true}).filter(file => file.endsWith('.yml'));
    // const files = fs.readdirSync(cwd, { withFileTypes: false, recursive: true }) as string[];
    // const ymlFiles = files.filter(file => typeof file === 'string' && file.endsWith('.yml'));
    const files = findYamlFilesInDirectory(cwd);
    //files.push(...findYamlFilesInDirectory(githubDir));
    // files.push(fs.readdirSync(cwd).filter(file => file.endsWith('.yml')));
    // files.push(fs.readdirSync(cwd).filter(file => file.endsWith('.yaml')));
    console.log(`Found ${files.length} .yml files in ${cwd}`);
    // Iterate through each file and search for the pattern 'uses:'
    files.forEach(file => {
        const filePath = path_1.default.join(cwd, file);
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('uses:')) {
                console.log(`Found 'uses:' in ${filePath} on line ${index + 1}`);
                // Replace the action version
                const newLine = line.replace(/(uses:\s*['"]?.*?)(@[^'"]*)/, `$1@${version}`);
                console.log(`Replacing line: ${line} with ${newLine} in file ${filePath}`);
                lines[index] = newLine;
            }
        });
        // Write the updated content back to the file
        const updatedContent = lines.join('\n');
        fs_1.default.writeFileSync(filePath, updatedContent, 'utf-8'); // Write the changes back to the file
        console.log(`Updated file: ${filePath}`);
    });
}
function findYamlFilesInDirectory(dir) {
    const files = fs_1.default.readdirSync(dir, { withFileTypes: true });
    const yamlFiles = [];
    console.log(files);
    for (const file of files) {
        if (file.isDirectory()) {
            if (file.name === 'node_modules' || file.name === 'dist' || file.name === '.vscode') {
                continue; // Skip 
            }
            console.log(file);
            findYamlFilesInDirectory(file.name);
        }
        else if (fileFilter(file.name)) {
            yamlFiles.push(path_1.default.join(dir, file.name));
        }
        // if(fileFilter(file.name)) {
        //     console.log(`Found .yml file: ${path.join(dir, file.name)}`);
        //     yamlFiles.push(file.name);
        // }
    }
    console.log(`Found ${yamlFiles.length} .yml files in ${dir}`);
    console.log(yamlFiles);
    return yamlFiles;
}
function fileFilter(file) {
    return file.endsWith('.yml') || file.endsWith('.yaml');
}
