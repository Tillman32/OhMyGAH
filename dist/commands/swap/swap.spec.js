"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const globals_1 = require("@jest/globals");
const tsyringe_1 = require("tsyringe");
const swap_1 = require("./swap");
(0, globals_1.describe)('Swap', () => {
    let swapCommand;
    let mockWorkflowService;
    (0, globals_1.beforeEach)(() => {
        mockWorkflowService = {
            findAllActionsWorkflows: globals_1.jest.fn()
        };
        tsyringe_1.container.registerInstance("ActionsWorkflowService", mockWorkflowService);
        swapCommand = new swap_1.Swap();
    });
    (0, globals_1.it)('should have a run method', () => {
        (0, globals_1.expect)(swapCommand.run).toBeDefined();
        (0, globals_1.expect)(typeof swapCommand.run).toBe('function');
    });
    (0, globals_1.it)('should handle empty workflows gracefully', async () => {
        mockWorkflowService.findAllActionsWorkflows.mockReturnValue([]);
        const consoleSpy = globals_1.jest.spyOn(console, 'log').mockImplementation(() => { });
        await swapCommand.run('actions/checkout', 'v3');
        (0, globals_1.expect)(consoleSpy).toHaveBeenCalledWith("No GitHub Actions workflows found.");
        consoleSpy.mockRestore();
    });
});
