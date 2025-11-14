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
        // Prompt user if no input is provided
        if (!action || !version) {
            const prompt = await inquirer_1.default.prompt([
                {
                    type: "input",
                    name: "action",
                    message: "Enter action name (eg; actions/checkout)",
                    validate: (input) => {
                        if (!input || input.trim().length === 0) {
                            return "Action name is required";
                        }
                        return true;
                    }
                },
                {
                    type: "input",
                    name: "version",
                    message: "Enter version/branch",
                    validate: (input) => {
                        if (!input || input.trim().length === 0) {
                            return "Version is required";
                        }
                        return true;
                    }
                }
            ]);
            action = prompt.action;
            version = prompt.version;
        }
        // Validate inputs
        if (!action || action.trim().length === 0) {
            console.error("Error: Action name is required");
            process.exit(1);
        }
        if (!version || version.trim().length === 0) {
            console.error("Error: Version is required");
            process.exit(1);
        }
        const workflowService = tsyringe_1.container.resolve("ActionsWorkflowService");
        const workflows = workflowService.findAllActionsWorkflows();
        if (workflows.length === 0) {
            console.log("No GitHub Actions workflows found.");
            return;
        }
        const selectedFiles = await this.promptUserToSelectWorkflows(workflows);
        if (selectedFiles.length === 0) {
            console.log("No files selected. Exiting.");
            return;
        }
        await this.replaceActionVersionInFiles(selectedFiles, action, version);
    }
    async replaceActionVersionInFiles(workflows, action, version) {
        console.log(`Replacing version of action ${action} to ${version}`);
        const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
        // Iterate through each file and search for the pattern 'uses:'
        workflows.forEach(file => {
            try {
                const fileContent = fs_1.default.readFileSync(file.path, 'utf-8');
                const lines = fileContent.split('\n');
                let changesMade = false;
                lines.forEach((line, index) => {
                    if (line.includes('uses:')) {
                        // Replace the action version
                        const newLine = line.replace(new RegExp(`(uses:\\s*['"]?${escapedAction})(@[^'"\s]*)`), `$1@${version}`);
                        if (newLine !== line) {
                            lines[index] = newLine;
                            changesMade = true;
                        }
                    }
                });
                if (changesMade) {
                    // Write the updated content back to the file
                    const updatedContent = lines.join('\n');
                    fs_1.default.writeFileSync(file.path, updatedContent, 'utf-8');
                    console.log(`Updated file: ${file.path}`);
                }
                else {
                    console.log(`No changes needed for: ${file.path}`);
                }
            }
            catch (error) {
                console.error(`Error processing file ${file.path}:`, error);
                throw error;
            }
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
