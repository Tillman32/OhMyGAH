import fs from 'fs';
import { glob } from 'glob'
import { injectable } from 'tsyringe';

export interface ActionsWorkflow {
    fileName: string;
    path: string;
    actions: Action[];
}

export interface Action {
    name: string;
    version: string;
    lineNumber: number;
}

@injectable()
export class ActionsWorkflowService {
    constructor() {}

    findAllActionsWorkflows() : ActionsWorkflow[] {
        const yamlFiles = this.findAllYamlFiles();
    
        const workflows: ActionsWorkflow[] = [];
    
        yamlFiles.forEach(file => {
            const fileContent = fs.readFileSync(file, 'utf-8');
            const lines = fileContent.split('\n');
            const actions: Action[] = [];
    
            lines.forEach((line, index) => {
                if (line.includes('uses:')) {
                    const action = line.split('uses:')[1].trim();
                    const details = action.split('@');
                    actions.push({ name: details[0], version: details[1], lineNumber: index + 1 });
                }
            });
    
            const fileParts = file.match(/([^\\/]+)$/);
            const fileName = fileParts ? fileParts[0] : '';
            workflows.push({ fileName: fileName, path: file, actions });
        });
    
        return workflows;
    }

    private findAllYamlFiles() : string[] {
        const yamlFiles = glob.sync(['**/*.yml','**/*.yaml'], { ignore: 'node_modules/**', dot: true });

        if(yamlFiles.length === 0) {
            console.log("No .yml or .yaml files found in the current directory including subdirectories.");
            console.log("Please make sure you are in the correct directory and try again.");
            throw new Error("No YAML files found");
        }
    
        return yamlFiles;
    }
}