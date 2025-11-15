import 'reflect-metadata';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { container } from 'tsyringe';
import { Swap } from './swap';
import { ActionsWorkflowService, ActionsWorkflow } from '../../services/workflow-service';
import fs from 'fs';
import inquirer from 'inquirer';

// Mock fs module
jest.mock('fs');
// Mock inquirer module  
jest.mock('inquirer');

const mockedInquirer = inquirer as jest.Mocked<typeof inquirer>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('Swap', () => {
    let swapCommand: Swap;
    let mockWorkflowService: jest.Mocked<ActionsWorkflowService>;
    let consoleSpy: jest.SpiedFunction<typeof console.log>;
    let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
    let mockExit: jest.SpiedFunction<typeof process.exit>;

    const mockWorkflows: ActionsWorkflow[] = [
        {
            fileName: 'ci.yml',
            path: '.github/workflows/ci.yml',
            actions: [
                { name: 'actions/checkout', version: 'v2', lineNumber: 10 },
                { name: 'actions/setup-node', version: 'v3', lineNumber: 15 }
            ]
        },
        {
            fileName: 'deploy.yml',
            path: '.github/workflows/deploy.yml',
            actions: [
                { name: 'actions/checkout', version: 'v2', lineNumber: 8 }
            ]
        }
    ];

    beforeEach(() => {
        mockWorkflowService = {
            findAllActionsWorkflows: jest.fn()
        } as any;

        container.registerInstance("ActionsWorkflowService", mockWorkflowService);
        swapCommand = new Swap();
        
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
            throw new Error(`process.exit: ${code}`);
        }) as any;

        // Reset mocks
        mockedFs.readFileSync.mockClear();
        mockedFs.writeFileSync.mockClear();
        mockedInquirer.prompt.mockClear();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        mockExit.mockRestore();
    });

    describe('run', () => {
        it('should have a run method', () => {
            expect(swapCommand.run).toBeDefined();
            expect(typeof swapCommand.run).toBe('function');
        });

        it('should handle empty workflows gracefully', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue([]);

            await swapCommand.run('actions/checkout', 'v3');

            expect(consoleSpy).toHaveBeenCalledWith("No GitHub Actions workflows found.");
            expect(mockWorkflowService.findAllActionsWorkflows).toHaveBeenCalledTimes(1);
        });

        it('should prompt when action name is empty', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);
            mockedInquirer.prompt
                .mockResolvedValueOnce({ action: 'actions/checkout', version: 'v3' } as any)
                .mockResolvedValueOnce({ selectedFiles: ['.github/workflows/ci.yml'] } as any);
            mockedFs.readFileSync.mockReturnValue('uses: actions/checkout@v2' as any);

            await swapCommand.run('', 'v3');

            expect(mockedInquirer.prompt).toHaveBeenCalled();
        });

        it('should prompt when version is empty', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);
            mockedInquirer.prompt
                .mockResolvedValueOnce({ action: 'actions/checkout', version: 'v3' } as any)
                .mockResolvedValueOnce({ selectedFiles: ['.github/workflows/ci.yml'] } as any);
            mockedFs.readFileSync.mockReturnValue('uses: actions/checkout@v2' as any);

            await swapCommand.run('actions/checkout', '');

            expect(mockedInquirer.prompt).toHaveBeenCalled();
        });

        it('should filter workflows by file path', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);
            mockedInquirer.prompt.mockResolvedValue({ selectedFiles: ['.github/workflows/ci.yml'] } as any);
            mockedFs.readFileSync.mockReturnValue('uses: actions/checkout@v2' as any);

            await swapCommand.run('actions/checkout', 'v4', 'ci.yml');

            expect(consoleSpy).toHaveBeenCalledWith('Targeting specific workflow file: .github/workflows/ci.yml');
            expect(inquirer.prompt).toHaveBeenCalledWith([{
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to update',
                choices: [{ name: '.github/workflows/ci.yml', value: '.github/workflows/ci.yml' }]
            }]);
        });

        it('should exit with error when specified file is not found', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);

            await expect(async () => {
                await swapCommand.run('actions/checkout', 'v4', 'nonexistent.yml');
            }).rejects.toThrow('process.exit: 1');

            expect(consoleErrorSpy).toHaveBeenCalledWith("Error: Workflow file 'nonexistent.yml' not found.");
            expect(consoleSpy).toHaveBeenCalledWith('Available workflows:');
        });

        it('should exit gracefully when no files are selected', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);
            mockedInquirer.prompt.mockResolvedValue({ selectedFiles: [] } as any);

            await swapCommand.run('actions/checkout', 'v4');

            expect(consoleSpy).toHaveBeenCalledWith("No files selected. Exiting.");
        });

        it('should prompt for action and version when not provided', async () => {
            mockWorkflowService.findAllActionsWorkflows.mockReturnValue(mockWorkflows);
            mockedInquirer.prompt
                .mockResolvedValueOnce({ action: 'actions/checkout', version: 'v4' } as any)
                .mockResolvedValueOnce({ selectedFiles: ['.github/workflows/ci.yml'] } as any);
            mockedFs.readFileSync.mockReturnValue('uses: actions/checkout@v2' as any);

            await swapCommand.run('', '');

            expect(inquirer.prompt).toHaveBeenCalledWith([
                {
                    type: 'input',
                    name: 'action',
                    message: 'Enter action name (eg; actions/checkout)',
                    validate: expect.any(Function)
                },
                {
                    type: 'input',
                    name: 'version',
                    message: 'Enter version/branch',
                    validate: expect.any(Function)
                }
            ]);
        });
    });

    describe('replaceActionVersionInFiles', () => {
        it('should replace action versions in workflow files', async () => {
            const fileContent = `
name: CI
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v3
`;
            const expectedContent = `
name: CI
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
`;

            mockedFs.readFileSync.mockReturnValue(fileContent as any);

            await swapCommand.replaceActionVersionInFiles(
                [mockWorkflows[0]], 
                'actions/checkout', 
                'v4'
            );

            expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
                '.github/workflows/ci.yml',
                expectedContent,
                'utf-8'
            );
            expect(consoleSpy).toHaveBeenCalledWith('Replacing version of action actions/checkout to v4');
            expect(consoleSpy).toHaveBeenCalledWith('Updated file: .github/workflows/ci.yml');
        });

        it('should handle files with no changes needed', async () => {
            const fileContent = 'uses: actions/setup-node@v3';
            mockedFs.readFileSync.mockReturnValue(fileContent as any);

            await swapCommand.replaceActionVersionInFiles(
                [mockWorkflows[0]], 
                'actions/checkout', 
                'v4'
            );

            expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('No changes needed for: .github/workflows/ci.yml');
        });

        it('should handle special regex characters in action names', async () => {
            const fileContent = 'uses: my-org/action.name@v1';
            const expectedContent = 'uses: my-org/action.name@v2';

            mockedFs.readFileSync.mockReturnValue(fileContent as any);

            await swapCommand.replaceActionVersionInFiles(
                [mockWorkflows[0]], 
                'my-org/action.name', 
                'v2'
            );

            expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
                '.github/workflows/ci.yml',
                expectedContent,
                'utf-8'
            );
        });

        it('should handle multiple occurrences in the same file', async () => {
            const fileContent = `
steps:
  - uses: actions/checkout@v2
  - uses: actions/setup-node@v3
  - uses: actions/checkout@v2
`;
            const expectedContent = `
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v3
  - uses: actions/checkout@v4
`;

            mockedFs.readFileSync.mockReturnValue(fileContent as any);

            await swapCommand.replaceActionVersionInFiles(
                [mockWorkflows[0]], 
                'actions/checkout', 
                'v4'
            );

            expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
                '.github/workflows/ci.yml',
                expectedContent,
                'utf-8'
            );
        });

        it('should throw error when file processing fails', async () => {
            mockedFs.readFileSync.mockImplementation(() => {
                throw new Error('File read error');
            });

            await expect(async () => {
                await swapCommand.replaceActionVersionInFiles(
                    [mockWorkflows[0]], 
                    'actions/checkout', 
                    'v4'
                );
            }).rejects.toThrow('File read error');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Error processing file'),
                expect.any(Error)
            );
        });

        it('should handle actions with branch names as versions', async () => {
            const fileContent = 'uses: actions/checkout@main';
            const expectedContent = 'uses: actions/checkout@feature/new-feature';

            mockedFs.readFileSync.mockReturnValue(fileContent as any);

            await swapCommand.replaceActionVersionInFiles(
                [mockWorkflows[0]], 
                'actions/checkout', 
                'feature/new-feature'
            );

            expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
                '.github/workflows/ci.yml',
                expectedContent,
                'utf-8'
            );
        });
    });

    describe('promptUserToSelectWorkflows', () => {
        it('should return selected workflows', async () => {
            mockedInquirer.prompt.mockResolvedValue({
                selectedFiles: ['.github/workflows/ci.yml']
            } as any);

            const result = await swapCommand.promptUserToSelectWorkflows(mockWorkflows);

            expect(result).toHaveLength(1);
            expect(result[0].path).toBe('.github/workflows/ci.yml');
            expect(mockedInquirer.prompt).toHaveBeenCalledWith([{
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Select files to update',
                choices: [
                    { name: '.github/workflows/ci.yml', value: '.github/workflows/ci.yml' },
                    { name: '.github/workflows/deploy.yml', value: '.github/workflows/deploy.yml' }
                ]
            }]);
        });

        it('should return multiple selected workflows', async () => {
            mockedInquirer.prompt.mockResolvedValue({
                selectedFiles: ['.github/workflows/ci.yml', '.github/workflows/deploy.yml']
            } as any);

            const result = await swapCommand.promptUserToSelectWorkflows(mockWorkflows);

            expect(result).toHaveLength(2);
            expect(result[0].path).toBe('.github/workflows/ci.yml');
            expect(result[1].path).toBe('.github/workflows/deploy.yml');
        });

        it('should return empty array when no workflows selected', async () => {
            mockedInquirer.prompt.mockResolvedValue({ selectedFiles: [] } as any);

            const result = await swapCommand.promptUserToSelectWorkflows(mockWorkflows);

            expect(result).toHaveLength(0);
        });
    });
});
