"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const globals_1 = require("@jest/globals");
const tsyringe_1 = require("tsyringe");
const list_1 = require("./list");
(0, globals_1.describe)('List', () => {
    let listCommand;
    let mockWorkflowService;
    (0, globals_1.beforeEach)(() => {
        mockWorkflowService = {
            findAllActionsWorkflows: globals_1.jest.fn()
        };
        tsyringe_1.container.registerInstance("ActionsWorkflowService", mockWorkflowService);
        listCommand = new list_1.List();
    });
    (0, globals_1.it)('should list workflows when workflows are found', async () => {
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
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation(() => { });
        await listCommand.run();
        (0, globals_1.expect)(mockWorkflowService.findAllActionsWorkflows).toHaveBeenCalled();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('should handle empty workflows', async () => {
        mockWorkflowService.findAllActionsWorkflows.mockReturnValue([]);
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation(() => { });
        await listCommand.run();
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith("No GitHub Actions workflows found.");
        consoleSpy.mockRestore();
    });
});
