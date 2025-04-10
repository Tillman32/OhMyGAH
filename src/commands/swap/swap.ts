import fs from "fs";
import inquirer from "inquirer";
import { container, injectable } from "tsyringe";
import { ActionsWorkflow, ActionsWorkflowService } from "../../services/workflow-service";

export interface Swap {
    initialize(): Promise<void>;
}

@injectable()
export class Swap {
    async run(): Promise<void> {
        let actionName = "";
        let actionVersion = "";

        const workflowService = container.resolve<ActionsWorkflowService>("ActionsWorkflowService");
        const workflows = workflowService.findAllActionsWorkflows();

        const selectedFiles = await this.promptUserToSelectWorkflows(workflows);

        await this.replaceActionVersionInFiles(selectedFiles, actionName, actionVersion);
    }

    async replaceActionVersionInFiles(workflows: ActionsWorkflow[], action: string, version: string) {
        console.log(`Replacing version of action ${action} to ${version}`);
    
        const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
    
        // Iterate through each file and search for the pattern 'uses:'
        workflows.forEach(file => {
            const fileContent = fs.readFileSync(file.fileName, 'utf-8');
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
            fs.writeFileSync(file.fileName, updatedContent, 'utf-8'); // Write the changes back to the file
            console.log(`Updated file: ${file.fileName}`);
        });
    }
    
    async promptUserToSelectWorkflows(workflows: ActionsWorkflow[]): Promise<ActionsWorkflow[]> {
        const { selectedFiles } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to update',
                choices: workflows.map(workflow => ({ name: workflow.fileName, value: workflow.fileName })),
            },
        ]);
    
        return workflows.filter(workflow => selectedFiles.includes(workflow.fileName));
    }
    
}

export default Swap;