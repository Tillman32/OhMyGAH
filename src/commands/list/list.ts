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

        workflows.forEach(workflow => {
            console.log(`File: ${workflow.fileName}`);
            workflow.actions.forEach(a => {
                console.log(`  -L${a.lineNumber}: ${workflow.path}`);
            });
        });
    }
}

export default List;