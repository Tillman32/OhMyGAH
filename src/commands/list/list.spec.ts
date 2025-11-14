import 'reflect-metadata';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { container } from 'tsyringe';
import { List } from './list';
import { ActionsWorkflowService } from '../../services/workflow-service';

describe('List', () => {
    let listCommand: List;
    let mockWorkflowService: jest.Mocked<ActionsWorkflowService>;

    beforeEach(() => {
        mockWorkflowService = {
            findAllActionsWorkflows: jest.fn()
        } as any;

        container.registerInstance("ActionsWorkflowService", mockWorkflowService);
        listCommand = new List();
    });

    it('should list workflows when workflows are found', async () => {
        const mockWorkflows = [
            {
                fileName: 'test.yml',
                path: '.github/workflows/test.yml',
                actions: [
                    { name: 'actions/checkout', version: 'v2', lineNumber: 10 }
                ]
            }
        ];

        mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await listCommand.run();

        expect(mockWorkflowService.findAllActionsWorkflows).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should handle empty workflows', async () => {
        mockWorkflowService.findAllActionsWorkflows.mockReturnValue([]);

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await listCommand.run();

        expect(consoleSpy).toHaveBeenCalledWith("No GitHub Actions workflows found.");

        consoleSpy.mockRestore();
    });
});
