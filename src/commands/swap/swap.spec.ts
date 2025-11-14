import 'reflect-metadata';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { container } from 'tsyringe';
import { Swap } from './swap';
import { ActionsWorkflowService } from '../../services/workflow-service';

describe('Swap', () => {
    let swapCommand: Swap;
    let mockWorkflowService: jest.Mocked<ActionsWorkflowService>;

    beforeEach(() => {
        mockWorkflowService = {
            findAllActionsWorkflows: jest.fn()
        } as any;

        container.registerInstance("ActionsWorkflowService", mockWorkflowService);
        swapCommand = new Swap();
    });

    it('should have a run method', () => {
        expect(swapCommand.run).toBeDefined();
        expect(typeof swapCommand.run).toBe('function');
    });

    it('should handle empty workflows gracefully', async () => {
        mockWorkflowService.findAllActionsWorkflows.mockReturnValue([]);

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await swapCommand.run('actions/checkout', 'v3');

        expect(consoleSpy).toHaveBeenCalledWith("No GitHub Actions workflows found.");

        consoleSpy.mockRestore();
    });
});
