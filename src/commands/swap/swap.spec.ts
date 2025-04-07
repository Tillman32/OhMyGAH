import { Command } from "commander";
import { swap } from './swap';
import fs from 'fs';
import inquirer from 'inquirer';
import { glob } from 'glob';

jest.mock('fs');
jest.mock('inquirer');
jest.mock('glob');
jest.mock('process', () => ({
    exit: jest.fn(),
}));

jest.mock('./swap', () => ({
    ...jest.requireActual('./swap')
}));


describe('swap', () => {
    let program: Command;

    beforeEach(() => {
        program = new Command();
        jest.clearAllMocks();
    });

    it('should prompt for action and version if not provided', async () => {
        const mockPrompt = jest.spyOn(inquirer, 'prompt').mockResolvedValue({
            action: 'actions/checkout',
            version: 'v2.3.4',
        });
        const mockGlob = jest.spyOn(glob, 'glob').mockResolvedValue(['file1.yml', 'file2.yaml']);
        const mockPromptUserToSelectFiles = jest.fn().mockResolvedValue(['file1.yml']);
        const mockReplaceActionVersionInFiles = jest.fn();
        
        jest.mock('./swap', () => ({
            ...jest.requireActual('./swap'),
            promptUserToSelectFiles: mockPromptUserToSelectFiles,
            replaceActionVersionInFiles: mockReplaceActionVersionInFiles,
        }));


        await swap(program);
        await program.parseAsync(['swap actions/checkout v2.3.4']);

        expect(mockPrompt).toHaveBeenCalled();
        expect(mockGlob).toHaveBeenCalledWith(['**/*.yml', '**/*.yaml'], { ignore: 'node_modules/**', dot: true });
        expect(mockPromptUserToSelectFiles).toHaveBeenCalledWith(['file1.yml', 'file2.yaml']);
        expect(mockReplaceActionVersionInFiles).toHaveBeenCalledWith(['file1.yml'], 'actions/checkout', 'v2.3.4');
    });

    it('should exit if no YAML files are found', async () => {
        const mockGlob = jest.spyOn(glob, 'glob').mockResolvedValue([]);
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit called');
        });

        await swap(program);
        await expect(program.parseAsync(['node', 'swap', 'actions/checkout', 'v2.3.4'])).rejects.toThrow('process.exit called');

        expect(mockGlob).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should replace action version in selected files', async () => {
        const mockGlob = jest.spyOn(glob, 'glob').mockResolvedValue(['file1.yml', 'file2.yaml']);
        const mockPromptUserToSelectFiles = jest.fn().mockResolvedValue(['file1.yml']);
        const mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue('uses: actions/checkout@v1');
        const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();

        (swap as any).__set__('promptUserToSelectFiles', mockPromptUserToSelectFiles);

        await swap(program);
        await program.parseAsync(['node', 'swap', 'actions/checkout', 'v2.3.4']);

        expect(mockGlob).toHaveBeenCalled();
        expect(mockPromptUserToSelectFiles).toHaveBeenCalledWith(['file1.yml', 'file2.yaml']);
        expect(mockReadFileSync).toHaveBeenCalledWith('file1.yml', 'utf-8');
        expect(mockWriteFileSync).toHaveBeenCalledWith('file1.yml', 'uses: actions/checkout@v2.3.4', 'utf-8');
    });

    it('should log a message if no files are selected', async () => {
        const mockGlob = jest.spyOn(glob, 'glob').mockResolvedValue(['file1.yml', 'file2.yaml']);
        const mockPromptUserToSelectFiles = jest.fn().mockResolvedValue([]);
        const mockLog = jest.spyOn(console, 'log').mockImplementation();

        (swap as any).__set__('promptUserToSelectFiles', mockPromptUserToSelectFiles);

        await swap(program);
        await program.parseAsync(['node', 'swap', 'actions/checkout', 'v2.3.4']);

        expect(mockGlob).toHaveBeenCalled();
        expect(mockPromptUserToSelectFiles).toHaveBeenCalledWith(['file1.yml', 'file2.yaml']);
        expect(mockLog).toHaveBeenCalledWith('No files selected.');
    });
});