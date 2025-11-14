import { container, injectable } from "tsyringe";
import { ActionsWorkflowService } from "../../services/workflow-service";

export interface List {
    run(): Promise<void>;
}

@injectable()
export class List implements List {
    async run(): Promise<void> {
        const workflowService = container.resolve<ActionsWorkflowService>("ActionsWorkflowService");
        const workflows = workflowService.findAllActionsWorkflows();

        if (workflows.length === 0) {
            console.log("No GitHub Actions workflows found.");
            return;
        }

        console.log(`Found ${workflows.length} workflow file(s):\n`);
        
        workflows.forEach(workflow => {
            console.log(`File: ${workflow.path}`);
            if (workflow.actions.length === 0) {
                console.log(`  No actions found in this workflow.`);
            } else {
                workflow.actions.forEach(a => {
                    console.log(`  Line ${a.lineNumber}: ${a.name}@${a.version}`);
                });
            }
            console.log('');
        });
    }
}

export default List;