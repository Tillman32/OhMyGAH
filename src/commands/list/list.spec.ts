import 'reflect-metadata';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { container } from 'tsyringe';
import { List } from './list';
import { ActionsWorkflowService } from '../../services/workflow-service';

describe('List', () => {
    let listCommand: List;
    let mockWorkflowService: jest.Mocked<ActionsWorkflowService>;
    let consoleSpy: jest.SpiedFunction<typeof console.log>;

    beforeEach(() => {
        mockWorkflowService = {
            findAllActionsWorkflows: jest.fn()
        } as any;

        container.registerInstance("ActionsWorkflowService", mockWorkflowService);
        listCommand = new List();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('run', () => {
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

            await listCommand.run();

            expect(mockWorkflowService.findAllActionsWorkflows).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith('Found 1 workflow file(s):\n');
            expect(consoleSpy).toHaveBeenCalledWith('File: .github/workflows/test.yml');
            expect(consoleSpy).toHaveBeenCalledWith('  Line 10: actions/checkout@v2');
        });

        it('should list multiple workflows with multiple actions', async () => {
            const mockWorkflows = [
                {
                    fileName: 'ci.yml',
                    path: '.github/workflows/ci.yml',
                    actions: [
                        { name: 'actions/checkout', version: 'v4', lineNumber: 10 },
                        { name: 'actions/setup-node', version: 'v4', lineNumber: 12 }
                    ]
                },
                {
                    fileName: 'deploy.yml',
                    path: '.github/workflows/deploy.yml',
                    actions: [
                        { name: 'actions/checkout', version: 'v3', lineNumber: 8 }
                    ]
                }
            ];

            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);

            await listCommand.run();

            expect(consoleSpy).toHaveBeenCalledWith('Found 2 workflow file(s):\n');
            expect(consoleSpy).toHaveBeenCalledWith('File: .github/workflows/ci.yml');
            expect(consoleSpy).toHaveBeenCalledWith('  Line 10: actions/checkout@v4');
            expect(consoleSpy).toHaveBeenCalledWith('  Line 12: actions/setup-node@v4');
            expect(consoleSpy).toHaveBeenCalledWith('File: .github/workflows/deploy.yml');
            expect(consoleSpy).toHaveBeenCalledWith('  Line 8: actions/checkout@v3');
        });

        it('should handle workflows with no actions', async () => {
            const mockWorkflows = [
                {
                    fileName: 'empty.yml',
                    path: '.github/workflows/empty.yml',
                    actions: []
                }
            ];

            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);

            await listCommand.run();

            expect(consoleSpy).toHaveBeenCalledWith('Found 1 workflow file(s):\n');
            expect(consoleSpy).toHaveBeenCalledWith('File: .github/workflows/empty.yml');
            expect(consoleSpy).toHaveBeenCalledWith('  No actions found in this workflow.');
        });

        it('should handle empty workflows list', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue([]);

            await listCommand.run();

            expect(consoleSpy).toHaveBeenCalledWith("No GitHub Actions workflows found.");
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('Found'));
        });

        it('should handle workflows with various action formats', async () => {
            const mockWorkflows = [
                {
                    fileName: 'test.yml',
                    path: '.github/workflows/test.yml',
                    actions: [
                        { name: 'actions/checkout', version: 'v4', lineNumber: 10 },
                        { name: 'custom/action', version: 'main', lineNumber: 15 },
                        { name: 'org/repo', version: 'feature/branch', lineNumber: 20 }
                    ]
                }
            ];

            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);

            await listCommand.run();

            expect(consoleSpy).toHaveBeenCalledWith('  Line 10: actions/checkout@v4');
            expect(consoleSpy).toHaveBeenCalledWith('  Line 15: custom/action@main');
            expect(consoleSpy).toHaveBeenCalledWith('  Line 20: org/repo@feature/branch');
        });
    });
});
