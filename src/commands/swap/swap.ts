import fs from "fs";
import inquirer from "inquirer";
import { container, injectable } from "tsyringe";
import { ActionsWorkflow, ActionsWorkflowService } from "../../services/workflow-service";

export interface Swap {
    run(action: string, version: string, filePath?: string): Promise<void>;
}

@injectable()
export class Swap {
    async run(action: string, version: string, filePath?: string): Promise<void> {
        // Validate inputs first, before prompting
        const needsPrompt = !action || !version || action.trim().length === 0 || version.trim().length === 0;
        
        // Prompt user if no valid input is provided
        if(needsPrompt) {
            const prompt = await inquirer.prompt([
                {
                    type: "input",
                    name: "action",
                    message: "Enter action name (eg; actions/checkout)",
                    validate: (input: string) => {
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
                    validate: (input: string) => {
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

        const workflowService = container.resolve<ActionsWorkflowService>("ActionsWorkflowService");
        let workflows = workflowService.findAllActionsWorkflows();

        if (workflows.length === 0) {
            console.log("No GitHub Actions workflows found.");
            return;
        }

        // Filter to specific file if provided
        if (filePath) {
            const filteredWorkflows = workflows.filter(w => w.path === filePath || w.path.endsWith(filePath));
            if (filteredWorkflows.length === 0) {
                console.error(`Error: Workflow file '${filePath}' not found.`);
                console.log(`Available workflows:`);
                workflows.forEach(w => console.log(`  - ${w.path}`));
                process.exit(1);
            }
            workflows = filteredWorkflows;
            console.log(`Targeting specific workflow file: ${workflows[0].path}`);
        }

        const selectedFiles = await this.promptUserToSelectWorkflows(workflows);

        if (selectedFiles.length === 0) {
            console.log("No files selected. Exiting.");
            return;
        }

        await this.replaceActionVersionInFiles(selectedFiles, action, version);
    }

    async replaceActionVersionInFiles(workflows: ActionsWorkflow[], action: string, version: string) {
        console.log(`Replacing version of action ${action} to ${version}`);
    
        const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
    
        // Iterate through each file and search for the pattern 'uses:'
        workflows.forEach(file => {
            try {
                const fileContent = fs.readFileSync(file.path, 'utf-8');
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
                    fs.writeFileSync(file.path, updatedContent, 'utf-8');
                    console.log(`Updated file: ${file.path}`);
                } else {
                    console.log(`No changes needed for: ${file.path}`);
                }
            } catch (error) {
                console.error(`Error processing file ${file.path}:`, error);
                throw error;
            }
        });
    }
    
    async promptUserToSelectWorkflows(workflows: ActionsWorkflow[]): Promise<ActionsWorkflow[]> {
        const { selectedFiles } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to update',
                choices: workflows.map(workflow => ({ name: workflow.path, value: workflow.path })),
            },
        ]);
    
        return workflows.filter(workflow => selectedFiles.includes(workflow.path));
    }
    
}

export default Swap;