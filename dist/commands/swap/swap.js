"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Swap = void 0;
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const tsyringe_1 = require("tsyringe");
let Swap = class Swap {
    async run(action, version) {
        // Promt user if no input is provided
        if (!action || !version) {
            const prompt = await inquirer_1.default.prompt([
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
        const workflowService = tsyringe_1.container.resolve("ActionsWorkflowService");
        const workflows = workflowService.findAllActionsWorkflows();
        console.log(workflows);
        const selectedFiles = await this.promptUserToSelectWorkflows(workflows);
        await this.replaceActionVersionInFiles(selectedFiles, action, version);
    }
    async replaceActionVersionInFiles(workflows, action, version) {
        console.log(`Replacing version of action ${action} to ${version}`);
        const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
        // Iterate through each file and search for the pattern 'uses:'
        workflows.forEach(file => {
            const fileContent = fs_1.default.readFileSync(file.path, 'utf-8');
            const lines = fileContent.split('\n');
            lines.forEach((line, index) => {
                if (line.includes('uses:')) {
                    // Replace the action version
                    const newLine = line.replace(new RegExp(`(uses:\\s*['"]?${escapedAction})(@[^'"]*)`), `$1@${version}`);
                    lines[index] = newLine;
                }
            });
            // Write the updated content back to the file
            const updatedContent = lines.join('\n');
            fs_1.default.writeFileSync(file.path, updatedContent, 'utf-8'); // Write the changes back to the file
            console.log(`Updated file: ${file.path}`);
        });
    }
    async promptUserToSelectWorkflows(workflows) {
        const { selectedFiles } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to update',
                choices: workflows.map(workflow => ({ name: workflow.path, value: workflow.path })),
            },
        ]);
        return workflows.filter(workflow => selectedFiles.includes(workflow.path));
    }
};
exports.Swap = Swap;
exports.Swap = Swap = __decorate([
    (0, tsyringe_1.injectable)()
], Swap);
exports.default = Swap;
